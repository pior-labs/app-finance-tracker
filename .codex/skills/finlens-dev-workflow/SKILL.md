---
name: finlens-dev-workflow
description: FinLens monorepo setup and day-to-day development workflow for pnpm workspace packages (api, web, shared). Use when starting local development, running builds or type checks, seeding or migrating the SQLite database, or quickly locating the right package and command for implementation/debugging tasks.
---

# FinLens Dev Workflow

## Overview

Use this skill to run the project locally and choose the right command path quickly.

## Run The Project

1. Start from repo root.
2. Run `cp .env.example .env` if `.env` does not exist.
3. Run `pnpm install`.
4. Run `pnpm db:migrate` and `pnpm db:seed`.
5. Run `pnpm dev` to start API and web together.

## Run One Package

1. Run API only with `pnpm dev:api`.
2. Run web only with `pnpm dev:web`.
3. Run all builds with `pnpm build`.
4. Run workspace type checks with `pnpm typecheck`.

## Use Workspace Filters

1. Use `pnpm --filter @finlens/api <script>` for backend-scoped tasks.
2. Use `pnpm --filter @finlens/web <script>` for frontend-scoped tasks.
3. Use `pnpm --filter @finlens/shared <script>` for shared package tasks.

## Navigate The Repo

1. Read `references/repo-map.md` for package ownership and common file locations.
2. Start changes in `packages/shared` when API and web contracts both change.
3. Keep data files under `data/` out of git commits.
