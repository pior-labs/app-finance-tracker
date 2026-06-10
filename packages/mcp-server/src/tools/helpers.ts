import type { createFinanceQueries } from '@finlens/db';
import { formatMoney, formatMonthLabel } from '@finlens/shared';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { createLogger } from '../logger.js';

export type FinanceQueries = ReturnType<typeof createFinanceQueries>;
export type Logger = ReturnType<typeof createLogger>;

export const MAX_TRANSACTION_LIMIT = 200;
export const MAX_MERCHANT_LIMIT = 50;

export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected a month in YYYY-MM format, e.g. 2026-03.')
  .describe('Month in YYYY-MM format, e.g. 2026-03.');

export const periodInputShape = {
  startMonth: monthSchema.describe('First month of the period in YYYY-MM format.'),
  endMonth: monthSchema
    .optional()
    .describe('Last month of the period in YYYY-MM format (inclusive). Defaults to startMonth.')
};

export const categorySpendingSchema = z.object({
  categoryId: z.number().int(),
  category: z.string(),
  transactionCount: z.number().int(),
  totalCents: z.number().int()
});

export const merchantSpendingSchema = z.object({
  merchant: z.string(),
  transactionCount: z.number().int(),
  totalCents: z.number().int()
});

export const monthlySummarySchema = z.object({
  month: z.string(),
  totalSpentCents: z.number().int(),
  transactionCount: z.number().int(),
  uncategorizedCount: z.number().int(),
  byCategory: z.array(categorySpendingSchema),
  topMerchants: z.array(merchantSpendingSchema)
});

export const transactionSchema = z.object({
  id: z.number().int(),
  date: z.string(),
  description: z.string(),
  merchant: z.string().nullable(),
  amountCents: z.number().int(),
  type: z.enum(['debit', 'credit']),
  categoryId: z.number().int().nullable(),
  categoryName: z.string().nullable(),
  status: z.enum(['needs_review', 'confirmed'])
});

export const paginationSchema = z.object({
  limit: z.number().int(),
  offset: z.number().int(),
  total: z.number().int()
});

export function toolResult(text: string, structured: Record<string, unknown>): CallToolResult {
  return {
    content: [{ type: 'text', text }],
    structuredContent: structured
  };
}

export function toolError(message: string): CallToolResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true
  };
}

export async function runTool(
  logger: Logger,
  tool: string,
  run: () => Promise<CallToolResult>
): Promise<CallToolResult> {
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error while running the tool.';
    logger.warn('Tool call failed', { tool, error: message });
    return toolError(message);
  }
}

export function formatPeriodLabel(startMonth: string, endMonth?: string): string {
  if (!endMonth || endMonth === startMonth) {
    return formatMonthLabel(startMonth);
  }

  return `${formatMonthLabel(startMonth)} to ${formatMonthLabel(endMonth)}`;
}

export function formatCount(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

export function formatSpendingLine(label: string, totalCents: number, transactionCount: number): string {
  return `- ${label}: ${formatMoney(totalCents)} (${formatCount(transactionCount, 'transaction')})`;
}
