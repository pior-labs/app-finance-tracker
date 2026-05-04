# Phase 2 — Execution Plan

> **The goal of Phase 2 is focused:** convert FinLens into a pnpm monorepo and ship an MCP server that exposes household finance data safely for conversational querying.

---

## How to Use This Document

Work through the steps in order. Each step has a "Test it" gate. Do not continue if a gate fails. The migration in this phase touches structure, runtime, and deployment, so small checkpoints are what keep risk low.

**Estimated total time:** 1-2 weeks.

---

## Phase 2 Scope (and Non-Goals)

**In scope:**
- Convert root `api/` + `web/` into `packages/api` + `packages/web`
- Add `packages/shared` for cross-package types/contracts
- Add `packages/mcp-server` using the MCP TypeScript SDK
- Expose finance query tools for Claude Desktop
- Run API + web + MCP server together in Docker Compose

**Out of scope:**
- No AI auto-categorization
- No new budgets/reports domain tables
- No changes to household shared-data model
- No auth redesign for the web app

Phase 2 extends access to existing data; it does not redesign Phase 1 behavior.

---

## Target Structure by End of Phase 2

```text
finlens/
├── packages/
│   ├── api/
│   ├── web/
│   ├── shared/
│   │   ├── src/
│   │   │   └── types.ts
│   │   └── package.json
│   └── mcp-server/
│       ├── src/
│       │   ├── index.ts
│       │   ├── db/
│       │   │   └── finance-queries.ts
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

Before changing structure, freeze a known-good baseline.

**Do this:**

1. Run existing API and web smoke checks from current root layout.
2. Validate one end-to-end user flow:
   - login
   - upload one statement
   - categorize one transaction
3. Back up `data/finlens.db` and `data/uploads/`.
4. Record current container behavior (`docker compose up --build`) so regressions are obvious later.

**Test it:** You can still complete the full Phase 1 household workflow, and backup copies of DB/uploads exist.

---

## Step 2 — Convert to pnpm Workspace Monorepo

**Time:** 2-4 hours

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
   - Drizzle config DB path
   - Docker build contexts
   - relative upload/data paths

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

Create `packages/shared` so API and MCP server speak the same contract types.

**Do this:**

1. Create `@finlens/shared` package with TS build + exports.
2. Move shared type definitions from `api/src/lib/types.ts` into `packages/shared/src/types.ts`.
3. Export stable contract types used in responses and MCP structured output.
4. Update API imports to consume `@finlens/shared` instead of local copies.
5. Keep schema ownership in API; shared package holds contracts, not DB implementation.

**Test it:**

```bash
pnpm --filter @finlens/shared build
pnpm --filter @finlens/api typecheck
```

No duplicated type definitions remain between API and MCP-facing code.

---

## Step 4 — Scaffold MCP Server Package

**Time:** 1-2 hours

Set up a standalone process for MCP transport and tool registration.

**Do this:**

1. Create `packages/mcp-server` with:
   - TypeScript config
   - `dev`, `build`, and `start` scripts
2. Install MCP SDK dependency (`@modelcontextprotocol/sdk`) and validation dependency (`zod`).
3. Build `src/index.ts` with MCP server bootstrap and stdio transport.
4. Load env from root `.env` (or package-local override) for DB path and runtime flags.
5. Add structured logging and graceful shutdown handlers.

**Test it:**

```bash
pnpm --filter @finlens/mcp-server dev
```

Process starts cleanly and advertises tool capabilities without crashing.

---

## Step 5 — Implement Read-Only Finance Query Layer

**Time:** 3-5 hours

Keep tool handlers thin by pushing SQL/Drizzle access into a dedicated query module.

**Do this:**

1. Add `src/db/finance-queries.ts` in MCP package.
2. Reuse existing database schema definitions from the API package (single source of truth).
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

## Step 6 — Register MCP Tools

**Time:** 3-5 hours

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

## Step 7 — Claude Desktop Integration

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

## Step 8 — Docker Compose: API + Web + MCP

**Time:** 2-3 hours

Deploy all three processes together in Phase 2 structure.

**Do this:**

1. Update `docker-compose.yml` for monorepo paths.
2. Add `mcp-server` service with shared `data/` volume mount.
3. Ensure API and MCP both point to the same SQLite file path.
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

## Step 9 — Docs, Runbooks, and Hardening

**Time:** 1-2 hours

Capture the new developer workflow so future changes stay fast.

**Do this:**

1. Update `README.md` for workspace commands.
2. Document MCP run commands (local + Docker).
3. Document backup/restore notes for SQLite + uploads.
4. Add troubleshooting notes:
   - DB path mismatches after move
   - workspace filter mistakes
   - Claude Desktop command path issues
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
4. MCP server exposes the 7 planned finance tools with validated inputs and structured outputs.
5. Claude Desktop can connect locally and answer real spending questions accurately.
6. Docker Compose runs API + web + MCP together against the same dataset.
7. Updated documentation reflects the new workflow and runtime model.

---

## Common Pitfalls to Avoid

- Treating MCP as a replacement for API routes. It is an additional interface, not a rewrite.
- Duplicating DB schema logic across packages instead of reusing API schema source.
- Returning unbounded transaction lists from tools (token bloat and poor UX).
- Mixing dollars and cents in tool outputs.
- Breaking relative paths during folder moves (`.env`, Drizzle, Docker contexts).
- Adding write/mutation tools in Phase 2 (scope creep and safety risk).

---

## Implementation Defaults for Phase 2

If no override is requested, use these defaults:

1. **Transport:** stdio MCP server for Claude Desktop local integration.
2. **Tool safety:** read-only tools only.
3. **Date shape:** `YYYY-MM` for month filters.
4. **Money unit:** integer cents in structured output, formatted currency in text output.
5. **Result limits:** default pagination/limits for transaction-returning tools.
