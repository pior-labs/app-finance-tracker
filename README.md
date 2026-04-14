# FinLens (Phase 1 Scaffold)

FinLens is a self-hosted personal finance tracker monorepo.

## Structure

- `packages/api` - Hono + Drizzle + SQLite backend
- `packages/web` - React + Vite frontend shell
- `packages/shared` - shared TypeScript types (`@finlens/shared`)
- `packages/mcp-server` - empty placeholder for Phase 3
- `data` - SQLite DB + uploaded PDFs (gitignored)

## Quick start

1. Copy env file:
   - `cp .env.example .env`
2. Install dependencies:
   - `pnpm install`
3. Run DB migration + seed:
   - `pnpm db:migrate`
   - `pnpm db:seed`
4. Start both apps:
   - `pnpm dev`

### Default Phase 1 users

- `alex@finlens.local` / `finlens123`
- `jamie@finlens.local` / `finlens123`

## Docker (dev)

- `docker compose up`

## Notes

- Phase 1 only: no AI/RAG/agent/LLM/vector features are configured.
