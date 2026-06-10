import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  categorySpendingSchema,
  formatPeriodLabel,
  formatSpendingLine,
  periodInputShape,
  runTool,
  toolResult,
  type FinanceQueries,
  type Logger
} from './helpers.js';

export function registerCategoryTools(server: McpServer, queries: FinanceQueries, logger: Logger): string[] {
  server.registerTool(
    'get_category_breakdown',
    {
      title: 'Get category breakdown',
      description:
        'Break down household spending by category over a month or a range of months, sorted by amount spent. Amounts are integer cents in structured output.',
      inputSchema: periodInputShape,
      outputSchema: {
        startMonth: z.string(),
        endMonth: z.string(),
        categories: z.array(categorySpendingSchema)
      },
      annotations: { readOnlyHint: true }
    },
    async ({ startMonth, endMonth }) =>
      runTool(logger, 'get_category_breakdown', async () => {
        const categories = await queries.getCategoryBreakdown({ startMonth, endMonth });
        const periodLabel = formatPeriodLabel(startMonth, endMonth);
        const text =
          categories.length === 0
            ? `No categorized spending found for ${periodLabel}.`
            : [
                `Spending by category for ${periodLabel}:`,
                ...categories.map((entry) => formatSpendingLine(entry.category, entry.totalCents, entry.transactionCount))
              ].join('\n');

        return toolResult(text, {
          startMonth,
          endMonth: endMonth ?? startMonth,
          categories
        });
      })
  );

  return ['get_category_breakdown'];
}
