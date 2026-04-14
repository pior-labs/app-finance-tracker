import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { dbFilePath } from '../lib/env.js';
import * as schema from './schema.js';

fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });

export const sqlite = new Database(dbFilePath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
