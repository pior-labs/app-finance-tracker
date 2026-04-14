import path from 'node:path';

const dbPath = process.env.DB_PATH ?? '../../data/finlens.db';
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'replace-me-in-env',
  DB_PATH: dbPath,
  CORS_ORIGINS: corsOrigin.split(',').map((entry) => entry.trim()).filter(Boolean)
};

export const dbFilePath = path.resolve(process.cwd(), env.DB_PATH);
export const dataDir = path.dirname(dbFilePath);
export const uploadsDir = path.join(dataDir, 'uploads');
