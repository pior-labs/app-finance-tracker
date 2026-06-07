import { createDatabase, schema } from '@finlens/db';
import { env } from '../lib/env.js';

const database = createDatabase(env.databaseUrl);

export const db = database.db;
export { schema };

export function closeDb(): Promise<void> {
  return database.close();
}
