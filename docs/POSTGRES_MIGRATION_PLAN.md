# Postgres Container Migration Plan

## Summary

Move FinLens from SQLite/`better-sqlite3` to Postgres over Docker, using a fresh database with no SQLite data migration. The app will connect to an already-running Postgres container through an internal external Docker network, with production credentials stored only in the server's untracked `.env`.

## Key Changes

- Replace SQLite Drizzle wiring with Postgres:
  - Use `postgres` and `drizzle-orm/postgres-js`.
  - Update `api/src/db/index.ts` and `api/src/db/migrate.ts` to connect via `DATABASE_URL`.
  - Update Better Auth Drizzle adapter provider from `sqlite` to `postgresql`.
- Convert schema from `sqlite-core` to `pg-core`:
  - Use `pgTable`, `serial`, `integer`, `text`, `boolean`, and `timestamp with time zone`.
  - Keep HTTP response shapes effectively unchanged.
  - Keep `amount` as integer cents.
  - Keep transaction/statement dates as text for current filtering/formatting behavior.
- Replace SQLite migrations:
  - Treat Postgres as a fresh database.
  - Remove or replace SQLite-specific migration SQL and Drizzle metadata.
  - Generate a new Postgres baseline migration from the converted schema.
- Update dependencies:
  - Add `postgres`.
  - Remove `better-sqlite3` and `@types/better-sqlite3`.
- Update env/docs:
  - Change `DATABASE_URL` from a SQLite file path to a Postgres URI, for example `postgresql://finlens:<password>@postgres:5432/finlens`.
  - Keep `UPLOAD_DIR` as filesystem storage for uploaded PDFs.
  - Update `.env.example`, `README.md`, and Docker notes.

## Docker And Deployment

- Do not add a Postgres service to this repo's compose file.
- Use external Docker network `finlens_private`.
- Attach the existing Postgres container to that network with alias `postgres`.
- Attach `api` and `web` services to `finlens_private`; keep Postgres internal-only with no published `5432` port.
- Store production `DATABASE_URL` in the Debian server's untracked `.env`.
- Keep migrations manual:
  - Add production-friendly scripts or document direct commands that run compiled files, for example `node dist/db/migrate.js`.
  - Run migrate before seed/start on first Postgres deployment.
  - Run seed once to create the two configured users and default categories.

## Test Plan

- Local static checks:
  - `cd api && pnpm install`
  - `cd api && pnpm typecheck`
  - `cd api && pnpm build`
- Migration validation against Postgres:
  - Confirm Postgres container is reachable at `postgres:5432` from the app network.
  - Run the compiled migration command inside the API container.
  - Run seed once and verify users/categories exist.
- App smoke test:
  - `docker compose up --build`
  - Log in with seeded users.
  - Upload a statement PDF.
  - Verify dashboard, statements, transactions, categories, categorization, delete, and reparse flows still work.

## Assumptions

- Existing SQLite data will not be migrated.
- Postgres database name is `finlens`, user is `finlens`, network alias is `postgres`, and Docker network is `finlens_private`.
- The Postgres container already exists or will be managed outside this repo.
- Database credentials remain outside Git in the server `.env`.
- Postgres remains internal to Docker; no host or LAN port exposure.
