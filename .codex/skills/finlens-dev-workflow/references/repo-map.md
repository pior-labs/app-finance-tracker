# Repo Map

## Packages

- `packages/api`: Hono + Drizzle + SQLite backend.
- `packages/web`: React + Vite frontend.
- `packages/shared`: Shared TypeScript types published as `@finlens/shared`.
- `packages/mcp-server`: Placeholder package for later phases.

## Root Commands

- `pnpm dev`: Run API and web in parallel.
- `pnpm dev:api`: Run only API.
- `pnpm dev:web`: Run only web.
- `pnpm build`: Build all packages.
- `pnpm typecheck`: Type-check all packages.
- `pnpm db:migrate`: Run API database migrations.
- `pnpm db:seed`: Seed API database.

## High-Value Files

- `packages/api/src/index.ts`: API bootstrap and route registration.
- `packages/api/src/routes/`: Route handlers.
- `packages/api/src/db/schema.ts`: Drizzle schema.
- `packages/web/src/App.tsx`: App shell and routes.
- `packages/web/src/pages/`: Feature pages.
- `packages/web/src/components/ui/`: Shared UI primitives.
- `packages/shared/src/types.ts`: Shared cross-package types.
