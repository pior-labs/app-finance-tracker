import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../lib/env.js';
import * as schema from './schema.js';

const client = postgres(env.databaseUrl);

export const db = drizzle(client, { schema });
export { schema };

export function closeDb(): Promise<void> {
  return client.end();
}
