# Phase 2 — Phase 1 Baseline Record

**Recorded:** 2026-06-06
**Branch:** `feature/mcp-server`
**Scope:** Phase 2 execution plan, Step 1 only

## Package Checks

The existing root-layout packages pass their smoke checks:

```text
api: pnpm typecheck — pass
api: pnpm build     — pass
web: pnpm typecheck — pass
web: pnpm build     — pass
```

The web production build completed with 1,857 transformed modules.

## Household Workflow

The complete Phase 1 workflow passed against the local-development API connected
to the local Postgres database:

```text
health check             — pass
login                    — pass
load categories          — pass (19 categories)
upload statement         — pass (77 transactions parsed)
categorize transaction   — pass (status confirmed)
delete test statement    — pass
```

The generated test upload was removed after the workflow completed. Existing
database records and uploads were left intact.

## Backups

Backups were created before the household workflow under the gitignored runtime
data directory:

```text
data/backups/phase-2-step-1-2026-06-06/postgres.dump
data/backups/phase-2-step-1-2026-06-06/uploads.tar.gz
```

Validation:

```text
postgres.dump  — pg_restore list readable, 89 entries, 40K
uploads.tar.gz — tar archive readable, 9 entries, 1.1M
```

SHA-256:

```text
95508f6e1d41b41969b510975a3900ff66e41da8009e3bd5028d001ae600a960  postgres.dump
0c99eb74d047d2adbff07a95dbb1b1a1891980a5a9ee70ed98b32af7d19cb081  uploads.tar.gz
```

## Docker Compose Baseline

`docker compose up --build` successfully builds both images. The declared
external `finlens_private` network must exist before startup.

After creating that network, both containers start and the public health check
returns HTTP 200. Authenticated API requests fail because the current local
`.env` points `DATABASE_URL` at `localhost`; inside the API container,
`localhost` is the container itself rather than the external Postgres service.

This is the known local-versus-Docker configuration boundary to preserve and
account for during Step 2. No Compose or runtime configuration was changed in
Step 1.
