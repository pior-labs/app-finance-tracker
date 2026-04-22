import path from 'node:path';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { ensurePathForFile, env, resolveFromApiDir } from '../lib/env.js';

const dbFilePath = resolveFromApiDir(env.databaseUrl);
ensurePathForFile(dbFilePath);

const sqlite = new Database(dbFilePath);
const migrationDb = drizzle(sqlite);

migrate(migrationDb, {
  migrationsFolder: path.resolve(process.cwd(), 'drizzle')
});

sqlite.close();
console.log(`Migrations applied to ${dbFilePath}`);
