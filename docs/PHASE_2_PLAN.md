# Phase 2 — Execution Plan

> **The goal of Phase 2 is focused:** convert FinLens into a pnpm monorepo and ship an MCP server that exposes household finance data safely for conversational querying.

**Status:** Phase 2 is now active as of 2026-06-05. Phase 1 is considered complete enough to freeze as the baseline before structural changes.

---

## How to Use This Document

Work through the steps in order. Each step has a "Test it" gate. Do not continue if a gate fails. The migration in this phase touches structure, runtime, and deployment, so small checkpoints are what keep risk low.

**Estimated total time:** 1-2 weeks.

---

## Phase 2 Scope (and Non-Goals)

**In scope:**
- Convert root `api/` + `web/` into `packages/api` + `packages/web`
- Add `packages/shared` for cross-package types/contracts and pure formatting/date helpers
- Add `packages/db` for the shared Drizzle/Postgres schema, database client factory, and read-only finance query helpers
- Add `packages/mcp-server` using the MCP TypeScript SDK
- Expose finance query tools for Claude Desktop
- Run API + web + MCP server together in Docker Compose against the existing external Postgres setup

**Out of scope:**
- No AI auto-categorization
- No new budgets/reports domain tables
- No changes to household shared-data model
- No auth redesign for the web app
- No SQLite support or SQLite data migration

Phase 2 extends access to existing data; it does not redesign Phase 1 behavior.

---

## Current Baseline After Phase 1

The original Phase 2 draft assumed the Phase 1 database would still be SQLite. The current app has already migrated to Postgres, so Phase 2 should preserve that reality.

- API is Hono + TypeScript + Drizzle using `drizzle-orm/postgres-js`.
- Database connection comes from `DATABASE_URL`.
- Docker Compose expects Postgres to be managed outside this repo and reachable on the external `finlens_private` network with alias `postgres`.
- Uploaded PDFs remain filesystem-backed through `UPLOAD_DIR`.
- Existing root layout is still `api/` and `web/`, each with its own `pnpm-lock.yaml`.
- Phase 1 user workflows are implemented: login, dashboard, statements, transactions, categories, and manual categorization.

---

## Target Structure by End of Phase 2

```text
finlens/
├── packages/
│   ├── api/
│   ├── web/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── dates.ts
│   │   │   └── money.ts
│   │   └── package.json
│   ├── db/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── finance-queries.ts
│   │   └── package.json
│   └── mcp-server/
│       ├── src/
│       │   ├── index.ts
│       │   └── tools/
│       │       ├── spending.ts
│       │       ├── transactions.ts
│       │       ├── merchants.ts
│       │       └── categories.ts
│       └── package.json
├── docs/
│   ├── PROJECT_SPEC_V3.md
│   ├── PHASE_1_PLAN_V3.md
│   └── PHASE_2_PLAN_V3.md
├── pnpm-workspace.yaml
├── package.json
└── docker-compose.yml
```

---

## Step 1 — Lock the Phase 1 Baseline

**Time:** 30-60 minutes

**Status:** Complete on 2026-06-06. See [`PHASE_2_BASELINE.md`](./PHASE_2_BASELINE.md).

Before changing structure, freeze a known-good baseline.

**Do this:**

1. Run existing API and web smoke checks from current root layout.
2. Validate one end-to-end user flow:
   - login
   - upload one statement
   - categorize one transaction
3. Back up the current Postgres database and `data/uploads/`.
4. Record current container behavior (`docker compose up --build`) so regressions are obvious later.

**Test it:** You can still complete the full Phase 1 household workflow, and backup copies of the database/uploads exist.

---

## Step 2 — Convert to pnpm Workspace Monorepo

**Time:** 2-4 hours

**Status:** Complete on 2026-06-06. The root workspace, local runtime, database
scripts, Docker images, and Phase 1 household workflow were validated after the
move.

Move from per-folder package management to one workspace.

**Do this:**

1. Add root `pnpm-workspace.yaml` covering `packages/*`.
2. Add root `package.json` with workspace scripts:
   - `dev`
   - `build`
   - `typecheck`
   - package-scoped helpers (`dev:api`, `dev:web`, `dev:mcp`)
3. Move folders:
   - `api/` → `packages/api/`
   - `web/` → `packages/web/`
4. Remove per-package lockfiles and generate one root `pnpm-lock.yaml`.
5. Fix path-sensitive config:
   - env file references
   - Drizzle config and migration output paths
   - Docker build contexts
   - relative upload/data paths
   - `DATABASE_URL` handling for local and Docker runtimes

**Test it:**

```bash
pnpm install
pnpm --filter @finlens/api typecheck
pnpm --filter @finlens/web typecheck
pnpm --filter @finlens/api dev
pnpm --filter @finlens/web dev
```

Both apps should start and behave exactly as in Phase 1.

---

## Step 3 — Extract Shared Contracts

**Time:** 1-2 hours

**Status:** Complete on 2026-06-06. Shared finance contracts and pure date/money
helpers now live in `@finlens/shared` and are consumed by both API and web.

Create `packages/shared` so API and MCP server speak the same contract language.

**Do this:**

1. Create `@finlens/shared` package with TS build + exports.
2. Move shared type definitions from `api/src/lib/types.ts` into `packages/shared/src/types.ts`.
3. Add pure helpers for date periods and money formatting where the API and MCP output should agree.
4. Export stable contract types used in API responses and MCP structured output.
5. Update API imports to consume `@finlens/shared` instead of local copies.
6. Keep this package free of database clients and runtime side effects.

**Test it:**

```bash
pnpm --filter @finlens/shared build
pnpm --filter @finlens/api typecheck
```

No duplicated type definitions remain between API and MCP-facing code.

---

## Step 4 — Extract Shared Database Package

**Time:** 2-4 hours

**Status:** Complete on 2026-06-06. The schema, Postgres client factory, and
initial read-only finance query vocabulary now live in `@finlens/db`; API-owned
migration and seed scripts remain operational.

Create `packages/db` so the API and MCP server share one Drizzle/Postgres schema and one query vocabulary without making the MCP server depend on the API process.

**Do this:**

1. Create `@finlens/db` package with TS build + exports.
2. Move `api/src/db/schema.ts` into `packages/db/src/schema.ts`.
3. Move or wrap the Postgres client setup in `packages/db/src/index.ts`.
4. Keep API-specific scripts such as migration and seed in the API package unless they become easier to share later.
5. Add `packages/db/src/finance-queries.ts` with read-only analytics queries used by the MCP tools.
6. Update API imports to consume schema/client exports from `@finlens/db`.

**Test it:**

```bash
pnpm --filter @finlens/db build
pnpm --filter @finlens/api typecheck
```

API behavior should remain unchanged, and the database schema should have one source of truth.

---

## Step 5 — Scaffold MCP Server Package

**Time:** 1-2 hours

**Status:** Complete on 2026-06-07. The standalone stdio MCP process loads root
or package-local environment configuration, advertises tool capabilities, emits
structured logs to stderr, and shuts down cleanly on termination signals.

Set up a standalone process for MCP transport and tool registration.

**Do this:**

1. Create `packages/mcp-server` with:
   - TypeScript config
   - `dev`, `build`, and `start` scripts
2. Install MCP SDK dependency (`@modelcontextprotocol/sdk`) and validation dependency (`zod`).
3. Build `src/index.ts` with MCP server bootstrap and stdio transport.
4. Load env from root `.env` (or package-local override) for `DATABASE_URL` and runtime flags.
5. Add structured logging and graceful shutdown handlers.

**Test it:**

```bash
pnpm --filter @finlens/mcp-server dev
```

Process starts cleanly and advertises tool capabilities without crashing.

---

## Step 6 — Implement Read-Only Finance Query Layer

**Time:** 3-5 hours

**Status:** Complete on 2026-06-07. `@finlens/db` now provides validated,
bounded read-only queries for summaries, comparisons, category and merchant
analytics, and transaction listing/search. Real-data smoke checks matched the
existing stats aggregate and covered no-data and invalid-limit behavior.

Keep tool handlers thin by pushing SQL/Drizzle access into a dedicated query module.

**Do this:**

1. Implement the read-only query module in `@finlens/db`.
2. Reuse the shared Drizzle schema from `@finlens/db/src/schema.ts`.
3. Implement read-only query functions for:
   - monthly spending summary
   - category breakdown
   - top merchants
   - merchant spending over period
   - filtered transaction listing/search
   - month-over-month comparison
4. Standardize date handling (`YYYY-MM`) and cents formatting.
5. Add guardrails:
   - max result limits
   - input validation
   - explicit empty-result handling

**Test it:**

Run query module smoke checks against real local DB data and verify totals match `GET /api/transactions/stats`.

---

## Step 7 — Register MCP Tools

**Time:** 3-5 hours

**Status:** Complete on 2026-06-09. All seven read-only tools are registered
with zod-validated inputs, paired text + structured JSON outputs, read-only
annotations, and normalized `isError` handling. An stdio MCP client smoke
script (`pnpm --filter @finlens/mcp-server smoke`, after a build) verified
valid, invalid, and no-data calls for every tool against real local data.

Expose query layer through well-designed MCP tool contracts.

**Tool set for Phase 2:**

1. `get_spending_summary`
2. `compare_months`
3. `get_category_breakdown`
4. `get_top_merchants`
5. `get_merchant_spending`
6. `get_transactions`
7. `search_transactions`

**Do this:**

1. Create tool files by domain (`spending.ts`, `transactions.ts`, `merchants.ts`, `categories.ts`).
2. Validate tool inputs with `zod`.
3. Return both:
   - human-readable text content
   - structured JSON payload for clients that use structured output
4. Enforce read-only behavior (no mutation tools in Phase 2).
5. Normalize errors into MCP-friendly responses (`isError: true` for recoverable tool failures).

**Test it:**

Use an MCP inspector/client to call each tool with:
- valid inputs
- invalid inputs
- no-data periods

All tools should respond deterministically with clear payload shape.

---

## Step 8 — Claude Desktop Integration

**Time:** 1-2 hours

Wire local MCP server into Claude Desktop and verify real conversational usage.

**Do this:**

1. Add Claude Desktop MCP config entry (local stdio command).
2. Ensure command resolves workspace package correctly.
3. Run real prompts:
   - "How much did we spend on groceries last month?"
   - "What are our top 5 merchants this year?"
   - "Show uncategorized transactions from March 2026."
4. Cross-check at least 3 answers against API/DB values.

**Test it:** Claude Desktop returns accurate, grounded answers from FinLens data.

---

## Step 9 — Docker Compose: API + Web + MCP

**Time:** 2-3 hours

**Status:** Complete on 2026-06-09. The `mcp-server` service runs alongside API
and web with the same `env_file` and `finlens_private` network, no published
ports, and health checks on all three services. The full stack was validated
against a Postgres container on `finlens_private` (alias `postgres`) restored
from live data: web and login worked end to end, and the Step 7 MCP smoke
suite passed against the server running inside the container. The optional
`DOCKER_DATABASE_URL` compose variable overrides `DATABASE_URL` for container
runs without changing local development configuration.

**Do this:**

1. Update `docker-compose.yml` for monorepo paths.
2. Add `mcp-server` service with the same `env_file` and `finlens_private` network access as the API.
3. Ensure API and MCP both point to the same Postgres `DATABASE_URL`.
4. Keep MCP process internal-only unless an HTTP transport is intentionally added later.
5. Add health checks/log visibility so runtime issues are easy to diagnose.

**Test it:**

```bash
docker compose up --build
```

- web reachable
- API healthy
- MCP container starts and remains stable
- finance queries return expected data when run from MCP client

---

## Step 10 — Docs, Runbooks, and Hardening

**Time:** 1-2 hours

Capture the new developer workflow so future changes stay fast.

**Do this:**

1. Update `README.md` for workspace commands.
2. Document MCP run commands (local + Docker).
3. Document backup/restore notes for Postgres + uploads.
4. Add troubleshooting notes:
   - `DATABASE_URL` mismatches after move
   - workspace filter mistakes
   - Claude Desktop command path issues
   - Docker network/alias issues for external Postgres
5. Record clear boundaries:
   - API handles user-facing app/auth
   - MCP server handles read-only conversational analytics

**Test it:** A clean machine can follow docs and run API, web, and MCP without guesswork.

---

## Full Phase 2 Acceptance Test

Phase 2 is complete when all are true:

1. Project is a working pnpm workspace monorepo under `packages/`.
2. Existing Phase 1 app behavior still works (no regression in upload/categorization flow).
3. `@finlens/shared` is the single source for cross-package contracts.
4. `@finlens/db` is the single source for Drizzle/Postgres schema and shared read-only finance queries.
5. MCP server exposes the 7 planned finance tools with validated inputs and structured outputs.
6. Claude Desktop can connect locally and answer real spending questions accurately.
7. Docker Compose runs API + web + MCP together against the same Postgres dataset.
8. Updated documentation reflects the new workflow and runtime model.

---

## Common Pitfalls to Avoid

- Treating MCP as a replacement for API routes. It is an additional interface, not a rewrite.
- Duplicating DB schema logic across packages instead of using `@finlens/db`.
- Returning unbounded transaction lists from tools (token bloat and poor UX).
- Mixing dollars and cents in tool outputs.
- Breaking relative paths during folder moves (`.env`, Drizzle, Docker contexts).
- Accidentally reintroducing SQLite assumptions into docs, scripts, or Docker config.
- Adding write/mutation tools in Phase 2 (scope creep and safety risk).

---

## Implementation Defaults for Phase 2

If no override is requested, use these defaults:

1. **Transport:** stdio MCP server for Claude Desktop local integration.
2. **Tool safety:** read-only tools only.
3. **Date shape:** `YYYY-MM` for month filters.
4. **Money unit:** integer cents in structured output, formatted currency in text output.
5. **Result limits:** default pagination/limits for transaction-returning tools.
