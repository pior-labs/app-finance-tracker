import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(process.cwd(), '../.env') });
loadEnv({ path: path.resolve(process.cwd(), '../../.env') });

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function parseTrustedOrigins(betterAuthUrl: string, webPort: number): string[] {
  const configuredOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => origin !== null);

  const defaults = [
    normalizeOrigin(betterAuthUrl),
    normalizeOrigin(`http://localhost:${webPort}`),
    normalizeOrigin(`http://127.0.0.1:${webPort}`),
    normalizeOrigin('http://localhost:8080'),
    normalizeOrigin('http://127.0.0.1:8080')
  ].filter((origin): origin is string => origin !== null);

  return Array.from(new Set([...configuredOrigins, ...defaults]));
}

// Local apps share the standard Vite port one at a time and authenticate
// against the hosted SSO service. The API remains on its own proxied port.
const apiPort = Number(process.env.API_PORT ?? 3001);
const webPort = Number(process.env.WEB_PORT ?? 5173);
const betterAuthUrl = process.env.BETTER_AUTH_URL ?? `http://localhost:${webPort}`;

function requiredCentralAuth(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to delegate authentication to the central SSO provider`);
  }
  return value;
}

export const env = {
  apiPort,
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://finlens:finlens@localhost:5432/finlens_dev',
  uploadDir: process.env.UPLOAD_DIR ?? '../../data/uploads',
  betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? 'change-me-in-production',
  betterAuthUrl,
  betterAuthTrustedOrigins: parseTrustedOrigins(betterAuthUrl, webPort),
  centralAuth: {
    // Provider id must match the OAuth callback path registered with the auth
    // service: /api/auth/oauth2/callback/auth-pior
    providerId: 'auth-pior',
    discoveryUrl: requiredCentralAuth('CENTRAL_AUTH_DISCOVERY_URL'),
    issuer: requiredCentralAuth('CENTRAL_AUTH_ISSUER'),
    clientId: requiredCentralAuth('CENTRAL_AUTH_CLIENT_ID'),
    clientSecret: requiredCentralAuth('CENTRAL_AUTH_CLIENT_SECRET')
  }
};

export function resolveFromApiDir(relativeOrAbsolutePath: string): string {
  if (path.isAbsolute(relativeOrAbsolutePath)) {
    return relativeOrAbsolutePath;
  }

  return path.resolve(process.cwd(), relativeOrAbsolutePath);
}

export function ensurePathForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}
