# FinLens (Phase 2 Active)

FinLens is a self-hosted personal finance tracker for two users.

Phase 1 is complete. The current work is Phase 2: converting the app into a pnpm monorepo and adding a read-only MCP server for conversational finance queries.

## Project Layout

- `packages/api/`: Hono + TypeScript + Drizzle + Postgres backend
- `packages/web/`: React 19 + Vite + Tailwind v4 + shadcn-style UI scaffold
- `docs/`: source specification documents
- `data/`: gitignored local upload storage

## Quick Start

1. Copy env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a local Postgres database:

```bash
sudo -u postgres createdb -O <your-postgres-user> finlens_dev
```

4. Prepare database and seed:

```bash
pnpm db:migrate
pnpm db:seed
```

5. Run the apps:

```bash
pnpm dev
```

Run one app with `pnpm dev:api` or `pnpm dev:web`.

## Docker

Production Docker expects `DATABASE_URL` to point at a Postgres container reachable from the API container, for example `postgresql://finlens:<password>@postgres:5432/finlens`.

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- Web: `http://localhost:8080`
