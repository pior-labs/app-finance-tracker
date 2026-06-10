import { formatMoney } from '@finlens/shared';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  MAX_MERCHANT_LIMIT,
  formatCount,
  formatPeriodLabel,
  formatSpendingLine,
  merchantSpendingSchema,
  periodInputShape,
  runTool,
  toolResult,
  type FinanceQueries,
  type Logger
} from './helpers.js';

export function registerMerchantTools(server: McpServer, queries: FinanceQueries, logger: Logger): string[] {
  server.registerTool(
    'get_top_merchants',
    {
      title: 'Get top merchants',
      description:
        'List the merchants with the highest household spending over a month or a range of months. Amounts are integer cents in structured output.',
      inputSchema: {
        ...periodInputShape,
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_MERCHANT_LIMIT)
          .optional()
          .describe('How many merchants to return (default 10).')
      },
      outputSchema: {
        startMonth: z.string(),
        endMonth: z.string(),
        merchants: z.array(merchantSpendingSchema)
      },
      annotations: { readOnlyHint: true }
    },
    async ({ startMonth, endMonth, limit }) =>
      runTool(logger, 'get_top_merchants', async () => {
        const merchants = await queries.getTopMerchants({ startMonth, endMonth }, limit);
        const periodLabel = formatPeriodLabel(startMonth, endMonth);
        const text =
          merchants.length === 0
            ? `No merchant spending found for ${periodLabel}.`
            : [
                `Top merchants for ${periodLabel}:`,
                ...merchants.map((entry) => formatSpendingLine(entry.merchant, entry.totalCents, entry.transactionCount))
              ].join('\n');

        return toolResult(text, {
          startMonth,
          endMonth: endMonth ?? startMonth,
          merchants
        });
      })
  );

  server.registerTool(
    'get_merchant_spending',
    {
      title: 'Get merchant spending',
      description:
        'Get total household spending at one merchant (exact name, case-insensitive) over a month or a range of months. Amounts are integer cents in structured output.',
      inputSchema: {
        merchant: z.string().trim().min(1).max(160).describe('Merchant name as it appears in transactions.'),
        ...periodInputShape
      },
      outputSchema: {
        found: z.boolean(),
        merchant: z.string(),
        startMonth: z.string(),
        endMonth: z.string(),
        transactionCount: z.number().int(),
        totalCents: z.number().int()
      },
      annotations: { readOnlyHint: true }
    },
    async ({ merchant, startMonth, endMonth }) =>
      runTool(logger, 'get_merchant_spending', async () => {
        const summary = await queries.getMerchantSpending(merchant, { startMonth, endMonth });
        const periodLabel = formatPeriodLabel(startMonth, endMonth);

        if (summary === null) {
          return toolResult(
            `No transactions found for merchant "${merchant}" in ${periodLabel}. Try search_transactions for partial name matches.`,
            {
              found: false,
              merchant,
              startMonth,
              endMonth: endMonth ?? startMonth,
              transactionCount: 0,
              totalCents: 0
            }
          );
        }

        return toolResult(
          `${summary.merchant} in ${periodLabel}: ${formatMoney(summary.totalCents)} across ${formatCount(summary.transactionCount, 'transaction')}.`,
          {
            found: true,
            merchant: summary.merchant,
            startMonth,
            endMonth: endMonth ?? startMonth,
            transactionCount: summary.transactionCount,
            totalCents: summary.totalCents
          }
        );
      })
  );

  return ['get_top_merchants', 'get_merchant_spending'];
}
