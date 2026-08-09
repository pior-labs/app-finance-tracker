# FinLens

FinLens is a self-hosted personal finance tracker built for household use and deployed as part of the Pior Labs platform.

## Status

FinLens is active and deployed. Its migration to the shared Pior Labs platform foundation is complete:

- PostgreSQL is the production data store.
- The application uses the shared Pior Labs design system.
- Central authentication is provided by `pior-labs/service-auth` over OAuth 2.1 / OpenID Connect.
- Production traffic is routed through the shared containerized Caddy edge.
- The web and API services use shared platform Docker networks and stable service aliases.
- A read-only MCP server provides a conversational interface to finance data without exposing a network port.

The production application is reached at `https://finance.szarans.ca`. Split-horizon DNS allows the same hostname to work on the trusted local network and over Tailscale.

## Architecture

| Component | Technology | Responsibility |
| --- | --- | --- |
| Web | React 19, Vite, Tailwind CSS, Pior Labs design system | User interface |
| API | Hono, TypeScript | Application API and session integration |
| Database | PostgreSQL, Drizzle ORM | Finance data and migrations |
| Auth | Better Auth client integration + Pior Labs Auth | Central SSO |
| MCP | TypeScript MCP server | Read-only finance queries for trusted MCP clients |
| Edge | Caddy | HTTPS and hostname routing |

Production authentication is delegated to the Pior Labs Auth service. The canonical production OIDC issuer is:

```text
https://auth.szarans.ca/api/auth
```

## Project layout

- `packages/api/` — Hono + TypeScript API, authentication integration, migrations, and application services
- `packages/db/` — shared Drizzle schema, PostgreSQL client factory, and finance queries
- `packages/web/` — React 19 + Vite frontend using the shared Pior Labs design system
- `packages/shared/` — shared finance contracts and pure date/money helpers
- `packages/mcp-server/` — internal read-only MCP server
- `docs/` — application specifications and supporting documentation
- `data/` — gitignored local upload storage

## Local development

### Prerequisites

- Node.js
- pnpm
- PostgreSQL
- a local or reachable Pior Labs Auth instance for the full SSO flow

### Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a local PostgreSQL database and update `DATABASE_URL` in `.env` for that database.

4. Apply migrations and seed local data:

```bash
pnpm db:migrate
pnpm db:seed
```

5. Start the application:

```bash
pnpm dev
```

The default local configuration uses:

- Finance API: `http://localhost:3001`
- Finance web: `http://localhost:5174`

Run individual components with:

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:mcp
```

## Docker

Build and start the application stack with:

```bash
docker compose up --build
```

The Compose stack includes the API, web application, and MCP server. Loopback-only host bindings are retained for local diagnostics and deployment compatibility; normal production browser traffic enters through the shared Caddy edge.

### Platform networking

The production web and API services join the external `pior_edge` Docker network with stable aliases:

- `finance-web:80`
- `finance-api:3000`

The API and MCP server also join the private `pior_data` network used to reach platform database infrastructure.

The MCP server does not join `pior_edge` and exposes no network port.

## Production platform contract

Production operation depends on infrastructure maintained outside this public repository:

- Caddy routing and TLS configuration are maintained by the private `platform-deploy` repository.
- PostgreSQL database and role provisioning are managed by the platform deployment layer.
- OAuth/OIDC identity is provided by `service-auth`.
- Cloudflare supports authoritative DNS and ACME DNS-01 certificate validation.
- Tailscale provides private remote access.
- Split-horizon DNS keeps the canonical `finance.szarans.ca` URL consistent across LAN and Tailscale clients.

Application source, migrations, containers, health checks, and release validation remain owned by this repository.

## MCP server

FinLens includes an internal read-only MCP server for trusted conversational finance queries.

The production container uses stdio transport and intentionally publishes no port. A compatible MCP client can attach to the running container with the configured Docker execution path. This keeps the MCP interface private while allowing finance data to participate in the wider Pior Labs assistant architecture later.

## Security and scope

FinLens is a private household application rather than a public multi-tenant finance service. Application access is intended for trusted LAN clients and authenticated Tailscale devices. Production credentials, private addresses, and operational secrets are not stored in this public repository.
