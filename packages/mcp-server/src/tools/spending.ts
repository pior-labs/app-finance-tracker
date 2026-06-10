import type { MonthlySpendingSummary } from '@finlens/db';
import { formatMoney, formatMonthLabel } from '@finlens/shared';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  MAX_MERCHANT_LIMIT,
  formatCount,
  formatSpendingLine,
  monthSchema,
  monthlySummarySchema,
  runTool,
  toolResult,
  type FinanceQueries,
  type Logger
} from './helpers.js';

function formatSummaryText(summary: MonthlySpendingSummary): string {
  const label = formatMonthLabel(summary.month);

  if (summary.transactionCount === 0) {
    return `No transactions recorded for ${label}.`;
  }

  const lines = [
    `${label}: ${formatMoney(summary.totalSpentCents)} spent across ${formatCount(summary.transactionCount, 'transaction')} (${summary.uncategorizedCount} needing review).`
  ];

  if (summary.byCategory.length > 0) {
    lines.push('', 'By category:');
    lines.push(
      ...summary.byCategory.map((entry) => formatSpendingLine(entry.category, entry.totalCents, entry.transactionCount))
    );
  }

  if (summary.topMerchants.length > 0) {
    lines.push('', 'Top merchants:');
    lines.push(
      ...summary.topMerchants.map((entry) => formatSpendingLine(entry.merchant, entry.totalCents, entry.transactionCount))
    );
  }

  return lines.join('\n');
}

function formatChange(cents: number, percent: number | null): string {
  const direction = cents === 0 ? 'unchanged' : cents > 0 ? 'up' : 'down';
  if (cents === 0) {
    return direction;
  }

  const percentText = percent === null ? 'no spending in comparison month' : `${Math.abs(percent).toFixed(1)}%`;
  return `${direction} ${formatMoney(Math.abs(cents))} (${percentText})`;
}

export function registerSpendingTools(server: McpServer, queries: FinanceQueries, logger: Logger): string[] {
  server.registerTool(
    'get_spending_summary',
    {
      title: 'Get spending summary',
      description:
        'Get the household spending summary for one month: total spent, transaction count, uncategorized count, spending by category, and top merchants. Amounts are integer cents in structured output.',
      inputSchema: {
        month: monthSchema,
        merchantLimit: z
          .number()
          .int()
          .min(1)
          .max(MAX_MERCHANT_LIMIT)
          .optional()
          .describe('How many top merchants to include (default 10).')
      },
      outputSchema: monthlySummarySchema.shape,
      annotations: { readOnlyHint: true }
    },
    async ({ month, merchantLimit }) =>
      runTool(logger, 'get_spending_summary', async () => {
        const summary = await queries.getMonthlySpendingSummary(month, merchantLimit);
        return toolResult(formatSummaryText(summary), { ...summary });
      })
  );

  server.registerTool(
    'compare_months',
    {
      title: 'Compare two months',
      description:
        'Compare household spending between two months: totals, transaction counts, and the change between them. Amounts are integer cents in structured output.',
      inputSchema: {
        month: monthSchema.describe('Month to evaluate, in YYYY-MM format.'),
        comparisonMonth: monthSchema.describe('Month to compare against, in YYYY-MM format.')
      },
      outputSchema: {
        month: monthlySummarySchema,
        comparisonMonth: monthlySummarySchema,
        totalSpentChangeCents: z.number().int(),
        totalSpentChangePercent: z.number().nullable(),
        transactionCountChange: z.number().int()
      },
      annotations: { readOnlyHint: true }
    },
    async ({ month, comparisonMonth }) =>
      runTool(logger, 'compare_months', async () => {
        const comparison = await queries.compareMonths(month, comparisonMonth);
        const monthLabel = formatMonthLabel(month);
        const comparisonLabel = formatMonthLabel(comparisonMonth);
        const text = [
          `${monthLabel} vs ${comparisonLabel}:`,
          `- Total spent: ${formatMoney(comparison.month.totalSpentCents)} vs ${formatMoney(comparison.comparisonMonth.totalSpentCents)} — ${formatChange(comparison.totalSpentChangeCents, comparison.totalSpentChangePercent)}`,
          `- Transactions: ${comparison.month.transactionCount} vs ${comparison.comparisonMonth.transactionCount} (${comparison.transactionCountChange >= 0 ? '+' : ''}${comparison.transactionCountChange})`,
          `- Needing review: ${comparison.month.uncategorizedCount} vs ${comparison.comparisonMonth.uncategorizedCount}`
        ].join('\n');

        return toolResult(text, { ...comparison });
      })
  );

  return ['get_spending_summary', 'compare_months'];
}
