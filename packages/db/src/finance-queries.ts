import { computeMonthBounds, type CategorySpending, type MerchantSpending } from '@finlens/shared';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import type { Database } from './index.js';
import * as schema from './schema.js';

export interface MonthlySpendingSummary {
  month: string;
  totalSpentCents: number;
  transactionCount: number;
  uncategorizedCount: number;
  byCategory: CategorySpending[];
  topMerchants: MerchantSpending[];
}

export function createFinanceQueries(db: Database) {
  return {
    async getAvailableMonths(): Promise<string[]> {
      const rows = await db
        .select({ month: sql<string>`substr(${schema.transactions.date}, 1, 7)` })
        .from(schema.transactions)
        .groupBy(sql`substr(${schema.transactions.date}, 1, 7)`)
        .orderBy(desc(sql`substr(${schema.transactions.date}, 1, 7)`));

      return rows.map((row) => row.month).filter((month) => computeMonthBounds(month) !== null);
    },

    async getMonthlySpendingSummary(month: string, merchantLimit = 10): Promise<MonthlySpendingSummary> {
      const bounds = computeMonthBounds(month);
      if (!bounds) {
        throw new Error('Invalid month. Expected format YYYY-MM.');
      }

      const periodFilter = and(
        gte(schema.transactions.date, bounds.start),
        lt(schema.transactions.date, bounds.endExclusive)
      );

      const [spendingRow] = await db
        .select({
          totalSpentCents:
            sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`,
          transactionCount: sql<number>`count(*)`
        })
        .from(schema.transactions)
        .where(periodFilter);

      const [uncategorizedRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.transactions)
        .where(and(periodFilter, eq(schema.transactions.status, 'needs_review')));

      const categoryRows = await db
        .select({
          categoryId: schema.categories.id,
          category: schema.categories.name,
          transactionCount: sql<number>`count(*)`,
          totalCents:
            sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`
        })
        .from(schema.transactions)
        .innerJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
        .where(periodFilter)
        .groupBy(schema.categories.id, schema.categories.name)
        .orderBy(desc(sql`sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end)`));

      const merchantRows = await db
        .select({
          merchant: schema.transactions.merchant,
          transactionCount: sql<number>`count(*)`,
          totalCents:
            sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`
        })
        .from(schema.transactions)
        .where(and(periodFilter, sql`${schema.transactions.merchant} is not null`))
        .groupBy(schema.transactions.merchant)
        .orderBy(desc(sql`sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end)`))
        .limit(Math.max(1, Math.min(merchantLimit, 50)));

      return {
        month,
        totalSpentCents: Number(spendingRow?.totalSpentCents ?? 0),
        transactionCount: Number(spendingRow?.transactionCount ?? 0),
        uncategorizedCount: Number(uncategorizedRow?.count ?? 0),
        byCategory: categoryRows.map((row) => ({
          categoryId: Number(row.categoryId),
          category: row.category,
          transactionCount: Number(row.transactionCount),
          totalCents: Number(row.totalCents)
        })),
        topMerchants: merchantRows
          .filter((row) => row.merchant !== null)
          .map((row) => ({
            merchant: row.merchant as string,
            transactionCount: Number(row.transactionCount),
            totalCents: Number(row.totalCents)
          }))
      };
    }
  };
}
