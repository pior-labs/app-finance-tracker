// Container health probe: a stdio MCP server has no port to check, so
// health means "the process environment can reach Postgres".
import { createDatabase } from '@finlens/db';
import { env } from './env.js';

const database = createDatabase(env.databaseUrl);

try {
  await database.ping();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await database.close();
}
