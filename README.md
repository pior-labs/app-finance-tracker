# FinLens (Phase 1 Scaffold)

This repository is the Phase 1 structural scaffold for FinLens.

## Project Layout

- `api/`: Hono + TypeScript + Drizzle + SQLite backend
- `web/`: React 19 + Vite + Tailwind v4 + shadcn-style UI scaffold
- `docs/`: source specification documents (kept untouched)
- `data/`: gitignored local data (SQLite + uploads)

## Quick Start

1. Copy env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
cd api && pnpm install
cd ../web && pnpm install
```

3. Prepare database and seed:

```bash
cd ../api
pnpm db:migrate
pnpm db:seed
```

4. Run each app:

```bash
# terminal 1
cd api && pnpm dev

# terminal 2
cd web && pnpm dev
```

## Docker (production-like baseline)

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- Web: `http://localhost:8080`

## Current Scope

This scaffold includes:

- Exact Phase 1 database schema (5 tables)
- Session auth baseline (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
- Placeholder route handlers for statements, transactions, categories
- Router + protected pages + placeholder UI components on web

This scaffold intentionally does **not** include fully implemented PDF parsing/upload categorization flows yet.
