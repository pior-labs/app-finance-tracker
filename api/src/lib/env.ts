import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(process.cwd(), '../.env') });

export const env = {
  apiPort: Number(process.env.API_PORT ?? 3000),
  sessionSecret: process.env.SESSION_SECRET ?? 'change-me-in-production',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  databaseUrl: process.env.DATABASE_URL ?? '../data/finlens.db',
  uploadDir: process.env.UPLOAD_DIR ?? '../data/uploads'
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
