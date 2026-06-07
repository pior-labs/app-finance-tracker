import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(process.cwd(), '../.env') });
loadEnv({ path: path.resolve(process.cwd(), '../../.env') });

const environmentSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://finlens:finlens@localhost:5432/finlens_dev'),
  MCP_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

const environment = environmentSchema.parse(process.env);

export const env = {
  databaseUrl: environment.DATABASE_URL,
  logLevel: environment.MCP_LOG_LEVEL
};
