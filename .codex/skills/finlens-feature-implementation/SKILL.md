---
name: finlens-feature-implementation
description: End-to-end feature implementation workflow for FinLens across React web, Hono API, Drizzle schema/migrations, and shared TypeScript contracts. Use when adding or modifying features that touch more than one package, including new routes, new pages, new shared types, or API/UI behavior changes that require coordinated validation.
---

# FinLens Feature Implementation

## Overview

Use this skill to deliver features safely across `packages/api`, `packages/web`, and `packages/shared`.

## Plan The Change

1. Identify which packages are impacted: `api`, `web`, `shared`.
2. Read `references/feature-checklist.md` and choose the matching change path.
3. Define data contract changes before coding UI behavior.

## Implement In The Right Order

1. Update `packages/shared/src/types.ts` when payload or model shapes change.
2. Update API schema/routes in `packages/api`.
3. Apply database migration/seed adjustments when schema changes.
4. Update UI pages/components in `packages/web`.
5. Ensure imports and aliases match package config (for web, `@/` maps to `src/`).

## Validate Before Finalizing

1. Run `pnpm typecheck`.
2. Run `pnpm build`.
3. Run feature-specific smoke checks in the browser and API endpoints.
4. Re-run `pnpm db:migrate` and `pnpm db:seed` when DB shape changes.

## Keep Changes Reviewable

1. Keep edits scoped to impacted packages.
2. Avoid mixing unrelated refactors with feature delivery.
3. Call out assumptions when endpoint contracts are inferred.
