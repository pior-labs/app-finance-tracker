import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { env } from './env.js';
import { createLogger } from './logger.js';

const logger = createLogger(env.logLevel);
const server = new Server(
  {
    name: 'finlens',
    version: '0.1.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [] }));

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info('Shutting down MCP server', { signal });

  try {
    await server.close();
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
    toolsRegistered: 0,
    databaseConfigured: env.databaseUrl.length > 0
  });
}

main().catch((error) => {
  logger.error('MCP server failed to start', {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exitCode = 1;
});
