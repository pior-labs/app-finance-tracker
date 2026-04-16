# Feature Checklist

## API Only Change

1. Edit route handlers in `packages/api/src/routes/`.
2. Update validation/auth wiring if needed in `packages/api/src/lib/`.
3. Run `pnpm --filter @finlens/api typecheck` if available, then `pnpm typecheck`.

## Web Only Change

1. Edit page/layout/component files under `packages/web/src/`.
2. Keep UI primitives in `packages/web/src/components/ui/` reusable.
3. Run `pnpm --filter @finlens/web build`.

## Shared Contract Change

1. Update shared types in `packages/shared/src/types.ts`.
2. Propagate usage updates in API and web.
3. Run `pnpm typecheck` from root.

## Database Schema Change

1. Update `packages/api/src/db/schema.ts`.
2. Create/apply migration through existing DB scripts.
3. Re-seed as needed and verify affected routes.

## Full-Stack Feature Change

1. Update shared types first.
2. Implement API endpoint behavior.
3. Implement web consumption and rendering.
4. Validate with `pnpm typecheck` and `pnpm build`.
