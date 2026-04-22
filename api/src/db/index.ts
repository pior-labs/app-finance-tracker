import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { ensurePathForFile, env, resolveFromApiDir } from '../lib/env.js';
import * as schema from './schema.js';

const dbFilePath = resolveFromApiDir(env.databaseUrl);
ensurePathForFile(dbFilePath);

const sqlite = new Database(dbFilePath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
