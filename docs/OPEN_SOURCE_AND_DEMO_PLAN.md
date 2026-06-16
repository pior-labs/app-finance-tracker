# Open-Source Release & Hosted Demo — Execution Plan

> **Goal:** publish FinLens as an MIT-licensed open-source project and stand up a
> public, self-hosted demo seeded with realistic filler data that visitors can
> explore safely.

**Status:** Planned as of 2026-06-15, following completion of Phase 2 (monorepo +
read-only MCP server). This is the natural extension of Phase 2 Step 10 (Docs,
Runbooks, Hardening).

---

## Decisions Locked

| Decision | Choice | Rationale |
| --- | --- | --- |
| License | **MIT** | Maximum adoption; simplest for a self-hosted app. |
| Demo hosting | **Cheap VPS** | Full control via the existing `docker-compose.yml`; lowest cost. |
| Demo safety | **`DEMO_MODE` read-only + periodic reset** | App has open signup + a shared-data model, so writes must be blocked and data refreshed on a schedule. |

---

## Why the Demo Needs Special Handling

Two properties of the current app make a naive public demo unsafe:

1. **Open signup.** `packages/api/src/lib/auth.ts` enables
   `emailAndPassword`, so anyone can register.
2. **Shared-data model.** Every authenticated user reads and *mutates the same
   rows* (household model). One visitor can delete categories, edit
   transactions, or upload a junk PDF and break the demo for everyone.

The mitigation is a `DEMO_MODE` flag that rejects all writes, plus a scheduled
job that re-seeds filler data so the demo always looks current and self-heals.

---

## Current Baseline (Verified 2026-06-15)

- Git history is **clean** — no `.env`, `.env.prod`, or secret files were ever
  committed. Only `.env.example` (placeholders) is tracked.
- `.gitignore` already excludes `.env`, `.env.prod`, `node_modules/`, `dist/`,
  and `data/*`.
- **No `LICENSE` file exists yet.**
- The repo bundles third-party agent tooling under `.agents/` (skills such as
  `ui-ux-pro-max`, `vercel-react-best-practices`) and `.codex/` that carry their
  own licenses and should not be redistributed.
- `packages/api/src/db/seed.ts` seeds **2 users + 18 default categories only** —
  **no transactions**. A demo needs a separate transaction-generating seed.
- `docker-compose.yml` defines `api`, `web`, and `mcp-server`. The `mcp-server`
  is stdio/internal-only and is **not needed** for a web demo.

---

## Part A — Open-Source Preparation

### Step A1 — Add the MIT License

**Do this:**

1. Add a root `LICENSE` file (MIT, copyright holder + 2026).
2. Add a license line/badge to `README.md`.

**Test it:** `LICENSE` exists at the repo root and GitHub recognizes it as MIT.

---

### Step A2 — Remove Non-Redistributable Tooling

**Do this:**

1. Remove `.agents/` and `.codex/` from the repo.
2. Trim `.claude/` to only project-shared config worth publishing (e.g.
   `CLAUDE.md`); drop local/personal settings.
3. Add these paths to `.gitignore` so they don't return.

**Test it:** `git ls-files | grep -E '^\.agents/|^\.codex/'` returns nothing.

---

### Step A3 — Final Secret Sweep

**Do this:**

1. Run `gitleaks detect --no-banner` (or `git secrets --scan-history`).
2. Confirm the real `.env` and `.env.prod` (which hold the household's actual
   emails/passwords) remain untracked.
3. Confirm `.env.example` only contains placeholders.

**Test it:** Scanner reports no findings; `git ls-files | grep -E '\.env$|\.env\.prod'`
returns nothing.

---

### Step A4 — Polish for Public Consumption

**Do this:**

1. README: add a **Demo** section (link placeholder), screenshots, and a note to
   generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32` (the example
   still says `change-me-in-production`).
2. Add a short `CONTRIBUTING.md` and a description/topics on the GitHub repo.
3. Confirm `.env.example` documents every required variable.

**Test it:** A new reader can follow the README from clone to running app without
guesswork.

---

## Part B — Demo Data & Safety

### Step B1 — Demo Seed Script

Create realistic filler data so the dashboard and MCP tools have something to show.

**Do this:**

1. Add `packages/api/src/db/seed-demo.ts` and a `db:seed:demo` script (root +
   api package).
2. Generate the 2 demo users + the existing 18 categories, then **4–6 months of
   transactions** across realistic merchants drawn from the category keywords
   (Loblaws, Tim Hortons, Shell, Netflix, Air Canada, etc.).
3. Anchor the data to the **current month** so the demo always looks live.
4. Include a healthy mix: income deposits, recurring subscriptions, variable
   discretionary spend, and some uncategorized rows to show that workflow.

**Test it:** After `pnpm db:seed:demo`, the dashboard renders populated charts and
`GET /api/transactions/stats` returns non-zero totals that match the MCP
`get_spending_summary` output.

---

### Step B2 — `DEMO_MODE` Write Guard

**Do this:**

1. Add `DEMO_MODE` (boolean) to `packages/api/src/lib/env.ts`.
2. Add API middleware that, when `DEMO_MODE` is on, rejects all mutating requests
   (POST/PUT/PATCH/DELETE for uploads, transactions, categories) with a friendly
   `403` and a clear "read-only demo" message. Keep auth/login working.
3. Surface a dismissible **"Read-only demo"** banner in the web UI when the flag
   is on (expose it via a config/health endpoint or build arg).
4. Post the shared demo credentials on the login screen / README.

**Test it:** With `DEMO_MODE=true`, login works, browsing works, and every write
attempt returns the read-only message. With the flag off, the app behaves
normally.

---

### Step B3 — Scheduled Reset

**Do this:**

1. Add `scripts/reset-demo.sh` that truncates the finance tables (transactions,
   statements, uploads) and re-runs `db:seed:demo`.
2. Install a **systemd timer** (or cron) on the VPS to run it every few hours.
3. Clear the `UPLOAD_DIR` contents during reset to bound disk usage.

**Test it:** Manually running the reset restores a clean, current dataset; the
timer fires on schedule (`systemctl list-timers`).

---

## Part C — VPS Deployment

### Step C1 — Demo Compose Override

**Do this:**

1. Add `docker-compose.demo.yml` that **drops the `mcp-server` service** and adds
   a Postgres service (or points `DATABASE_URL` at a managed/local Postgres).
2. Set `DEMO_MODE=true` and demo seed-user env vars.
3. Keep the API/web ports bound behind the reverse proxy, not exposed directly.

**Test it:** `docker compose -f docker-compose.yml -f docker-compose.demo.yml up --build`
brings up web + API + Postgres only.

---

### Step C2 — Reverse Proxy + HTTPS

**Do this:**

1. Put **Caddy** (automatic TLS) or nginx + certbot in front of the web/API
   containers on your domain.
2. Set `BETTER_AUTH_URL` / `BETTER_AUTH_TRUSTED_ORIGINS` to the public domain.
3. Generate a strong `BETTER_AUTH_SECRET` for the demo box.

**Test it:** The demo domain serves over HTTPS, login succeeds, and dashboard
data loads.

---

### Step C3 — Wire Up the Reset Timer

**Do this:**

1. Point the Step B3 timer at the deployed stack (run the seed inside the API
   container, e.g. `docker compose ... exec api pnpm db:seed:demo`).
2. Verify a full reset cycle end-to-end on the live box.

**Test it:** After a scheduled reset, the public demo shows fresh current-month
data and any test mutations are gone.

---

## Acceptance Criteria

Release + demo are complete when all are true:

1. Repo is public with an MIT `LICENSE` and no non-redistributable tooling.
2. A final secret scan is clean; real env files remain untracked.
3. README lets a newcomer self-host from scratch.
4. `pnpm db:seed:demo` produces realistic, current-month filler data.
5. `DEMO_MODE` blocks all writes and the UI shows a read-only banner.
6. A scheduled reset keeps the demo fresh and self-healing.
7. The demo is reachable over HTTPS on the VPS with shared credentials posted.

---

## Pitfalls to Avoid

- Flipping the repo public **before** adding the license or removing `.agents/`.
- Shipping a demo with writes enabled on a shared-data model (junk + breakage).
- Forgetting to clear `UPLOAD_DIR` on reset (disk fills over time).
- Leaving `mcp-server` in the demo deployment (unused, stdio-only).
- Reusing the household's real `BETTER_AUTH_SECRET` or seed passwords on the
  public box.
- Anchoring demo data to fixed past dates so the demo looks stale.
