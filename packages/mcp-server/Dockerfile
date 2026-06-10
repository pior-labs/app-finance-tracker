FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/mcp-server/package.json ./packages/mcp-server/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN pnpm install --frozen-lockfile --filter @finlens/mcp-server...

FROM deps AS build
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY packages/shared/src ./packages/shared/src
COPY packages/db/tsconfig.json ./packages/db/tsconfig.json
COPY packages/db/src ./packages/db/src
RUN pnpm --filter @finlens/shared build && pnpm --filter @finlens/db build
WORKDIR /app/packages/mcp-server
COPY packages/mcp-server/tsconfig.json ./
COPY packages/mcp-server/src ./src
RUN pnpm build

FROM base AS runtime
WORKDIR /app/packages/mcp-server
ENV NODE_ENV=production
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/mcp-server/node_modules ./node_modules
COPY --from=deps /app/packages/mcp-server/package.json ./package.json
COPY --from=deps /app/packages/db/node_modules /app/packages/db/node_modules
COPY --from=build /app/packages/shared/package.json /app/packages/shared/package.json
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist
COPY --from=build /app/packages/db/package.json /app/packages/db/package.json
COPY --from=build /app/packages/db/dist /app/packages/db/dist
COPY --from=build /app/packages/mcp-server/dist ./dist
CMD ["node", "dist/index.js"]
