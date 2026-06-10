import type { FinanceTransaction, TransactionFilters, TransactionPage } from '@finlens/db';
import { formatMoney } from '@finlens/shared';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  MAX_TRANSACTION_LIMIT,
  monthSchema,
  paginationSchema,
  runTool,
  toolResult,
  transactionSchema,
  type FinanceQueries,
  type Logger
} from './helpers.js';

const transactionFilterShape = {
  startMonth: monthSchema.optional().describe('First month of the period in YYYY-MM format.'),
  endMonth: monthSchema
    .optional()
    .describe('Last month of the period in YYYY-MM format (inclusive). Requires startMonth.'),
  categoryId: z.number().int().min(1).optional().describe('Only transactions in this category.'),
  uncategorized: z.boolean().optional().describe('Only transactions without a category. Cannot be combined with categoryId.'),
  status: z.enum(['needs_review', 'confirmed']).optional().describe('Only transactions with this review status.'),
  merchant: z.string().trim().min(1).max(160).optional().describe('Only transactions whose merchant contains this text.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_TRANSACTION_LIMIT)
    .optional()
    .describe(`How many transactions to return (default 50, max ${MAX_TRANSACTION_LIMIT}).`),
  offset: z.number().int().min(0).optional().describe('How many matching transactions to skip, for pagination.')
};

const transactionPageOutputShape = {
  data: z.array(transactionSchema),
  pagination: paginationSchema
};

interface TransactionFilterArgs {
  startMonth?: string;
  endMonth?: string;
  categoryId?: number;
  uncategorized?: boolean;
  status?: 'needs_review' | 'confirmed';
  merchant?: string;
  limit?: number;
  offset?: number;
}

function toQueryFilters(args: TransactionFilterArgs): TransactionFilters {
  if (args.endMonth !== undefined && args.startMonth === undefined) {
    throw new Error('Invalid period. endMonth requires startMonth.');
  }

  return {
    period: args.startMonth ? { startMonth: args.startMonth, endMonth: args.endMonth } : undefined,
    categoryId: args.categoryId,
    uncategorized: args.uncategorized,
    status: args.status,
    merchant: args.merchant,
    limit: args.limit,
    offset: args.offset
  };
}

function formatTransactionLine(transaction: FinanceTransaction): string {
  const merchant = transaction.merchant ?? transaction.description;
  const category = transaction.categoryName ?? 'uncategorized';
  return `- ${transaction.date} | ${formatMoney(transaction.amountCents, { signed: true })} | ${merchant} | ${category} (${transaction.status})`;
}

function formatPageText(page: TransactionPage, emptyMessage: string): string {
  if (page.data.length === 0) {
    return emptyMessage;
  }

  const first = page.pagination.offset + 1;
  const last = page.pagination.offset + page.data.length;
  return [
    `Showing transactions ${first}-${last} of ${page.pagination.total} matching:`,
    ...page.data.map(formatTransactionLine)
  ].join('\n');
}

export function registerTransactionTools(server: McpServer, queries: FinanceQueries, logger: Logger): string[] {
  server.registerTool(
    'get_transactions',
    {
      title: 'List transactions',
      description:
        'List household transactions, newest first, optionally filtered by month range, category, review status, or merchant. Paginated; amounts are integer cents in structured output (negative amounts are credits/refunds).',
      inputSchema: transactionFilterShape,
      outputSchema: transactionPageOutputShape,
      annotations: { readOnlyHint: true }
    },
    async (args) =>
      runTool(logger, 'get_transactions', async () => {
        const page = await queries.getTransactions(toQueryFilters(args));
        return toolResult(formatPageText(page, 'No transactions found matching these filters.'), { ...page });
      })
  );

  server.registerTool(
    'search_transactions',
    {
      title: 'Search transactions',
      description:
        'Search household transactions by free text across descriptions and merchant names, newest first, with the same optional filters as get_transactions. Paginated; amounts are integer cents in structured output.',
      inputSchema: {
        query: z.string().trim().min(1).max(500).describe('Text to match against transaction descriptions and merchants.'),
        ...transactionFilterShape
      },
      outputSchema: transactionPageOutputShape,
      annotations: { readOnlyHint: true }
    },
    async ({ query, ...filters }) =>
      runTool(logger, 'search_transactions', async () => {
        const page = await queries.searchTransactions({ ...toQueryFilters(filters), query });
        return toolResult(formatPageText(page, `No transactions found matching "${query}".`), { ...page });
      })
  );

  return ['get_transactions', 'search_transactions'];
}
