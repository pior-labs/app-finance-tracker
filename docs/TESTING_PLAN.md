# FinLens Testing Plan

Status: proposed
Branch: `chore/testing-foundation`
Date: 2026-08-23

## 1. Goal

FinLens has no meaningful automated test coverage. CI runs `pnpm typecheck`, `pnpm build`,
and two `docker build`s - it proves the code compiles and the images assemble, nothing about
whether the app is correct. The single existing test
(`packages/api/test/auth-cookie-prefix.test.mjs`) runs against `dist/` via `node --test` and
covers one assertion.

This plan establishes a real test pyramid across the workspace so that regressions are caught
by CI rather than by using the app.

## 2. Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Runner | **Vitest** for every package | One runner, one config style, one coverage report. Runs TS/ESM directly, so backend tests stop requiring `pnpm build` first. Reuses the existing Vite config and `@/*` alias for web. |
| Backend DB | **Real Postgres**, per-test transaction rollback | The backend's logic *is* SQL. `routes/transactions.ts` (416 lines) and `db/finance-queries.ts` (440 lines) are dominated by raw fragments like `substr(date, 1, 7)` and `coalesce(sum(case when amount > 0 ...))`. A mocked `db` can only assert that a builder was called; it cannot catch a wrong aggregation, an off-by-one month boundary, or SQL that does not parse. |
| Postgres provisioning | **Compose service + CI service container** | Container persists between local runs, so the local loop is fast after first start. CI already has Docker. Costs a `TEST_DATABASE_URL` env var and wiring in two places. |
| E2E | **Deferred** | Land the pyramid's base first. Playwright gets a documented slot in Phase 6, not this effort. |

## 3. What gets tested at each layer

**`@finlens/shared` - pure unit.** `dates.ts` (`computeMonthBounds`, `isValidMonth`,
`getCurrentMonth`, `formatMonthLabel`, `formatShortDate`) and `money.ts` (`formatMoney`,
`splitMoney`). Small, pure, entirely deterministic, and depended on by every other package.
Highest value per line of test code in the repo. Pin locale-sensitive output explicitly.

**`packages/api/src/services/pdf-parser.ts` - pure unit.** Already exports
`extractMerchantName`, `parseRbcStatementTable`, `parseBankStatementDocument`, and
`parseBankStatementText`, all of which take raw *text*, not a PDF. They can be tested with
zero I/O. This is 410 lines of the gnarliest heuristics in the codebase - month-abbreviation
tables, merchant prefix stripping, stop-word lists, statement-period year inference, page-break
and reference-number filtering. It is the most likely thing to silently regress and the easiest
thing to test.

**`@finlens/db` - integration against real Postgres.** `createFinanceQueries` end to end:
period resolution, monthly spending summaries, month-over-month comparison, merchant
aggregation, transaction filtering and pagination.

**`packages/api` routes - integration.** Each router mounted on a bare Hono app with a stubbed
auth middleware, hitting a real test database via `app.request()`. Covers Zod validation
rejections (400s), 404s on missing resources, the actual aggregation numbers returned by
`/api/transactions/stats`, filter and pagination behaviour, category create/update/delete
including the delete-with-transactions path, and statement upload/reparse/delete.

**`packages/api` auth middleware - unit with a mocked `auth`.** Path passthrough for non-`/api/`
and `/api/auth/`, 401 on no session, 401 on a non-numeric `session.user.id`, and correct
population of `userId`/`userEmail`/`userName`.

**`packages/web` - component and hook tests.** jsdom + Testing Library + MSW. Data hooks
(`useTransactionsData`, `useDashboardData`, `useCategoriesData`, `useStatementsData`,
`useCategorizeQueue`, `useAuth`) tested against mocked HTTP, including the error branches that
currently exist in every `fetchJson`. Pure view helpers (each `pages/*/lib/format.ts`,
`pages/categories/lib/color.ts`) as plain unit tests. Presentational components tested by
rendered output and interaction, not snapshots.

**`packages/mcp-server` - deferred to Phase 5**, reusing the same Postgres harness.

## 4. Blockers that require production-code changes

These are not optional; the current code cannot be tested without them.

1. **`packages/api/src/index.ts` calls `serve()` at module scope.** Importing the app to test it
   would bind port 3001. Split into `src/app.ts` (builds and exports the Hono app, no side
   effects) and `src/index.ts` (imports the app, resolves the upload dir, calls `serve`). No
   behaviour change.

2. **`packages/api/src/db/index.ts` creates a module-level connection** from `env.databaseUrl`,
   and routes import that `db` singleton directly. Tests point it at the test database by
   setting `DATABASE_URL` in the Vitest setup file before any import. This works because
   `env.ts` uses `dotenv`, which does not overwrite variables already present in `process.env`.
   Full dependency injection is a larger refactor and is explicitly *not* part of this plan.

3. **`packages/api/src/lib/env.ts` throws** if `CENTRAL_AUTH_DISCOVERY_URL`, `CENTRAL_AUTH_ISSUER`,
   `CENTRAL_AUTH_CLIENT_ID`, or `CENTRAL_AUTH_CLIENT_SECRET` are absent. It works locally only
   because a `.env` exists. CI has none. The setup file supplies inert fake values.

4. **Route tests must not go through better-auth.** Mounting routers behind the real
   `authMiddleware` would drag in OIDC discovery. Tests mount the routers on a fresh Hono app
   with a two-line middleware that sets the auth variables directly. The real middleware is
   tested separately in isolation.

5. **SWR caches globally.** Every web hook test wraps the component in
   `<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>` so cache state does
   not leak between tests.

## 5. Phases

### Phase 0 - Harness

- Add `vitest` + `@vitest/coverage-v8` at the workspace root.
- Root `vitest.config.ts` using `test.projects` to register `shared`, `db`, `api`, and `web`.
- Add `"test"`, `"test:watch"`, `"test:coverage"` scripts to the root `package.json`; add a
  per-package `"test"` script to each package.
- Add a `postgres-test` service to `docker-compose.yml` (tmpfs-backed data dir, distinct port,
  not on `pior_edge`/`pior_data`) plus `TEST_DATABASE_URL` in `.env.example`.
- Replace `packages/api`'s `"test": "pnpm build && node --test test/*.test.mjs"` with the Vitest
  script, and port `auth-cookie-prefix.test.mjs` to `.test.ts`.
- **Exit criteria:** `pnpm test` runs green from a clean checkout with one ported test.

### Phase 1 - Pure units, no infrastructure

- `packages/shared/src/dates.test.ts`, `money.test.ts`.
- `packages/api/src/services/pdf-parser.test.ts`, driven by anonymised statement-text fixtures
  in `packages/api/test/fixtures/` (text only - no PDFs, no real account data).
- `packages/web/src/**/lib/*.test.ts` for the five `format.ts` modules and `color.ts`.
- **Exit criteria:** meaningful coverage of the three highest-risk pure modules with zero
  infrastructure dependencies. This phase alone is worth landing on its own.

### Phase 2 - Backend test database

- `packages/api/test/setup.ts`: sets `DATABASE_URL` from `TEST_DATABASE_URL` and the fake
  `CENTRAL_AUTH_*` values, then runs the Drizzle migrations in `packages/api/drizzle/` once per
  run. Testing against migrations (not `db:push`) means a broken migration fails CI.
- `packages/api/test/helpers/db.ts`: `withRollback(fn)` - open a transaction, run the test, roll
  back. Plus small factories for users, categories, statements, and transactions.
- Port `packages/db/src/finance-queries.ts` coverage onto that harness.
- **Exit criteria:** `pnpm test` against a running `postgres-test` exercises `finance-queries`
  end to end and leaves no rows behind.

### Phase 3 - API route integration

- Split `index.ts` / `app.ts` per blocker 1.
- `test/helpers/app.ts`: builds a Hono app with routers mounted behind a stub auth middleware,
  returning a `request()` helper.
- Route suites for `transactions`, `categories`, and `statements`; a unit suite for
  `middleware/auth.ts`.
- Statement upload tests use a small text fixture through the parser path rather than a real PDF.
- **Exit criteria:** every route has at least a happy path plus its validation-failure path;
  the `/stats` aggregation is asserted on known seeded data.

### Phase 4 - Frontend

- Add `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`,
  and `msw` to `packages/web`.
- `packages/web/test/setup.ts` (jest-dom matchers, MSW server lifecycle) and
  `test/handlers.ts` (default API handlers typed against `@finlens/shared`).
- `renderWithProviders` helper wrapping `MemoryRouter`, `SWRConfig` with a fresh provider, and
  the theme/toast/auth providers.
- Hook tests for the six data hooks. Component tests for the higher-logic pieces:
  `ProtectedRoute`, `StatementUploadModal`, `DeleteCategoryModal`, `DeleteStatementModal`,
  `CategoryPicker`, `TransactionsFilters`, `TransactionsPagination`, `Donut`.
- **Exit criteria:** each data hook's loading, success, and error branches are covered, and the
  destructive-confirmation modals are covered.

### Phase 5 - CI and enforcement

- Add a `Test workspace` step to the `ci` job after `Typecheck`, with a `postgres:16` service
  container and `TEST_DATABASE_URL` in the job env.
- Publish coverage as a workflow artifact.
- Introduce coverage thresholds *after* Phases 1-4 land, ratcheted from the measured baseline
  rather than guessed up front. Target floors: `shared` and the pure helpers high (90%+), api
  routes and web hooks moderate (70%+), presentational components unconstrained.
- **Exit criteria:** a PR that breaks a query, a parser heuristic, or a hook's error branch goes
  red before review.

### Phase 6 - Deferred

Playwright E2E over the compose stack (login redirect, statement upload, categorize flow), and
`packages/mcp-server` tool tests on the Phase 2 harness. Both are follow-up work, not part of
this effort.

## 6. Layout

```
vitest.config.ts                          # root, test.projects
packages/shared/src/*.test.ts
packages/db/src/finance-queries.test.ts
packages/api/
  vitest.config.ts
  test/setup.ts                           # env + migrations
  test/helpers/{db,app,factories}.ts
  test/fixtures/*.txt                     # anonymised statement text
  src/**/*.test.ts                        # colocated with source
packages/web/
  vitest.config.ts                        # extends vite.config.ts for the @/ alias
  test/{setup.ts,handlers.ts,render.tsx}
  src/**/*.test.{ts,tsx}                  # colocated with source
```

Backend and frontend tests sit next to the code they test; only shared harness code lives under
`test/`.

## 7. Conventions

- Test names state behaviour, not method names: `rejects a month filter that is not YYYY-MM`.
- No snapshot tests for components. They pass silently through real regressions and get
  regenerated without being read.
- Fixtures are anonymised. No real merchant names, account numbers, or statement PDFs enter the
  repo - the existing files under `data/uploads/` stay out of the test corpus.
- Every test is independent and order-free. Backend tests roll back; frontend tests reset MSW
  handlers and the SWR cache between cases.
- Assert on values, not on call counts, wherever a value is available.

## 8. Flagged during survey - decision needed, not part of this plan

`packages/api/src/routes/transactions.ts` and `routes/categories.ts` contain **zero** references
to `userId`, and the `transactions` and `categories` tables in `packages/db/src/schema.ts` have
**no** `user_id` column - only `sessions`, `accounts`, and `statements` are user-scoped. Every
authenticated user therefore reads and writes the same transactions and categories.

That may be intentional for a single-user deployment. It matters here because tests encode
current behaviour: writing them now pins single-tenancy in place, and adding multi-tenancy later
means revising the suite. Worth deciding before Phase 3 - either confirm single-tenant and note
it in the tests, or scope the data model first.
