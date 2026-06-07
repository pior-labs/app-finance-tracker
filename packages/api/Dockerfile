FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN pnpm install --frozen-lockfile --filter @finlens/api...

FROM deps AS build
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY packages/shared/src ./packages/shared/src
COPY packages/db/tsconfig.json ./packages/db/tsconfig.json
COPY packages/db/src ./packages/db/src
RUN pnpm --filter @finlens/shared build && pnpm --filter @finlens/db build
WORKDIR /app/packages/api
COPY packages/api/tsconfig.json packages/api/drizzle.config.ts ./
COPY packages/api/drizzle ./drizzle
COPY packages/api/src ./src
RUN pnpm build

FROM base AS runtime
WORKDIR /app/packages/api
ENV NODE_ENV=production
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/api/node_modules ./node_modules
COPY --from=deps /app/packages/api/package.json ./package.json
COPY --from=deps /app/packages/db/node_modules /app/packages/db/node_modules
COPY --from=build /app/packages/shared/package.json /app/packages/shared/package.json
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist
COPY --from=build /app/packages/db/package.json /app/packages/db/package.json
COPY --from=build /app/packages/db/dist /app/packages/db/dist
COPY --from=build /app/packages/api/dist ./dist
COPY --from=build /app/packages/api/drizzle ./drizzle
RUN mkdir -p /app/data/uploads
EXPOSE 3000
CMD ["node", "dist/index.js"]
