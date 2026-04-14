import 'dotenv/config';
import path from 'node:path';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client.js';
import { ensureDataDirectories } from '../lib/bootstrap.js';

ensureDataDirectories();

migrate(db, {
  migrationsFolder: path.resolve(process.cwd(), 'src/db/migrations')
});

console.log('Migrations applied.');
