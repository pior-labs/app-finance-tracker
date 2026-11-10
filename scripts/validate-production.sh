#!/usr/bin/env bash
set -euo pipefail
required=(
  DATABASE_URL
  BETTER_AUTH_SECRET
  BETTER_AUTH_URL
  BETTER_AUTH_TRUSTED_ORIGINS
  CENTRAL_AUTH_DISCOVERY_URL
  CENTRAL_AUTH_ISSUER
  CENTRAL_AUTH_CLIENT_ID
  CENTRAL_AUTH_CLIENT_SECRET
)

for name in "${required[@]}"; do
  value="$(grep -E "^${name}=" .env | tail -n 1 | cut -d= -f2-)"
  if [ -z "$value" ]; then
    echo "Missing required setting in FINLENS_ENV: $name"
    exit 1
  fi
done
database_url="$(grep -E '^DATABASE_URL=' .env | tail -n 1 | cut -d= -f2-)"
database_host="$(printf '%s\n' "$database_url" | sed -E 's#^postgres(ql)?://([^/@]+@)?([^/:?]+).*#\3#')"

if [ -z "$database_host" ] || [ "$database_host" = "$database_url" ]; then
  echo "DATABASE_URL must be a Postgres connection URL"
  exit 1
fi

if [ "$database_host" = "localhost" ] || [ "$database_host" = "127.0.0.1" ]; then
  echo "DATABASE_URL points at $database_host, which is the API container during deploy. Use the Postgres container hostname or network alias."
  exit 1
fi

echo "Using production database host: $database_host"
