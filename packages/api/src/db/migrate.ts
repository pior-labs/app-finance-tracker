import path from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../lib/env.js';

const client = postgres(env.databaseUrl, { max: 1 });
const migrationDb = drizzle(client);

await migrate(migrationDb, {
  migrationsFolder: path.resolve(process.cwd(), 'drizzle')
});

await client.end();

console.log('Migrations applied to Postgres database');
