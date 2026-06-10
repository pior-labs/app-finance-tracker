import { createDatabase, createFinanceQueries } from '@finlens/db';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { env } from './env.js';
import { createLogger } from './logger.js';
import { registerCategoryTools } from './tools/categories.js';
import { registerMerchantTools } from './tools/merchants.js';
import { registerSpendingTools } from './tools/spending.js';
import { registerTransactionTools } from './tools/transactions.js';

const logger = createLogger(env.logLevel);
const server = new McpServer({
  name: 'finlens',
  version: '0.1.0'
});

const database = createDatabase(env.databaseUrl);
const queries = createFinanceQueries(database.db);

const registeredTools = [
  ...registerSpendingTools(server, queries, logger),
  ...registerCategoryTools(server, queries, logger),
  ...registerMerchantTools(server, queries, logger),
  ...registerTransactionTools(server, queries, logger)
];

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info('Shutting down MCP server', { signal });

  try {
    await server.close();
    await database.close();
    process.exitCode = 0;
  } catch (error) {
    logger.error('Failed to shut down MCP server cleanly', {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('MCP server started', {
    transport: 'stdio',
    toolsRegistered: registeredTools.length,
    tools: registeredTools,
    databaseConfigured: env.databaseUrl.length > 0
  });
}

main().catch((error) => {
  logger.error('MCP server failed to start', {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exitCode = 1;
});
