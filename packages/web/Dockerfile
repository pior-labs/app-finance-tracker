FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/mcp-server/package.json ./packages/mcp-server/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/web/package.json ./packages/web/package.json
# @pior-labs/design-system is pulled from GitHub Packages; the token is
# mounted as a build secret so it never persists in an image layer.
RUN --mount=type=secret,id=node_auth_token \
    NODE_AUTH_TOKEN="$(cat /run/secrets/node_auth_token)" \
    pnpm install --frozen-lockfile --filter @finlens/web...

FROM deps AS build
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY packages/shared/src ./packages/shared/src
RUN pnpm --filter @finlens/shared build
WORKDIR /app/packages/web
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY packages/web/tsconfig.json packages/web/index.html packages/web/vite.config.ts packages/web/components.json ./
COPY packages/web/src ./src
RUN pnpm build

FROM caddy:2-alpine AS runtime
COPY packages/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/packages/web/dist /srv
EXPOSE 80
