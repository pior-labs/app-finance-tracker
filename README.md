# FinLens (Phase 1)

FinLens is a self-hosted personal finance tracker for two users.

## Project Layout

- `api/`: Hono + TypeScript + Drizzle + SQLite backend
- `web/`: React 19 + Vite + Tailwind v4 + shadcn-style UI scaffold
- `docs/`: source specification documents
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
pnpm db:generate
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

## Docker

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- Web: `http://localhost:8080`
