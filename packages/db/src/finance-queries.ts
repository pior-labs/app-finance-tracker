import {
  computeMonthBounds,
  type CategorySpending,
  type MerchantSpending,
  type TransactionStatus,
  type TransactionType
} from '@finlens/shared';
import { and, desc, eq, gte, ilike, isNull, lt, or, sql, type SQL } from 'drizzle-orm';
import type { Database } from './index.js';
import * as schema from './schema.js';

const DEFAULT_RESULT_LIMIT = 50;
const MAX_RESULT_LIMIT = 200;
const DEFAULT_MERCHANT_LIMIT = 10;
const MAX_MERCHANT_LIMIT = 50;
const MAX_MERCHANT_LENGTH = 160;
const MAX_SEARCH_LENGTH = 500;

export interface FinancePeriod {
  startMonth: string;
  endMonth?: string;
}

export interface MonthlySpendingSummary {
  month: string;
  totalSpentCents: number;
  transactionCount: number;
  uncategorizedCount: number;
  byCategory: CategorySpending[];
  topMerchants: MerchantSpending[];
}

export interface MonthComparison {
  month: MonthlySpendingSummary;
  comparisonMonth: MonthlySpendingSummary;
  totalSpentChangeCents: number;
  totalSpentChangePercent: number | null;
  transactionCountChange: number;
}

export interface MerchantSpendingSummary extends MerchantSpending {
  period: ResolvedFinancePeriod;
}

export interface FinanceTransaction {
  id: number;
  date: string;
  description: string;
  merchant: string | null;
  amountCents: number;
  type: TransactionType;
  categoryId: number | null;
  categoryName: string | null;
  status: TransactionStatus;
}

export interface TransactionFilters {
  period?: FinancePeriod;
  categoryId?: number;
  uncategorized?: boolean;
  status?: TransactionStatus;
  merchant?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionSearchFilters extends TransactionFilters {
  query: string;
}

export interface TransactionPage {
  data: FinanceTransaction[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ResolvedFinancePeriod {
  startMonth: string;
  endMonth: string;
  startDate: string;
  endDateExclusive: string;
}

function resolvePeriod(period: FinancePeriod): ResolvedFinancePeriod {
  const startBounds = computeMonthBounds(period.startMonth);
  const endMonth = period.endMonth ?? period.startMonth;
  const endBounds = computeMonthBounds(endMonth);

  if (!startBounds || !endBounds) {
    throw new Error('Invalid period. Expected months in YYYY-MM format.');
  }

  if (period.startMonth > endMonth) {
    throw new Error('Invalid period. startMonth must not be after endMonth.');
  }

  return {
    startMonth: period.startMonth,
    endMonth,
    startDate: startBounds.start,
    endDateExclusive: endBounds.endExclusive
  };
}

function periodCondition(period: FinancePeriod): SQL {
  const resolved = resolvePeriod(period);
  return and(
    gte(schema.transactions.date, resolved.startDate),
    lt(schema.transactions.date, resolved.endDateExclusive)
  ) as SQL;
}

function normalizeLimit(value: number | undefined, defaultValue: number, maximum: number): number {
  if (value === undefined) {
    return defaultValue;
  }

  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new Error(`Invalid limit. Expected an integer between 1 and ${maximum}.`);
  }

  return value;
}

function normalizeOffset(value: number | undefined): number {
  if (value === undefined) {
    return 0;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Invalid offset. Expected a non-negative integer.');
  }

  return value;
}

function normalizeRequiredText(value: string, field: string, maximumLength: number): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Invalid ${field}. Expected a non-empty string.`);
  }

  if (normalized.length > maximumLength) {
    throw new Error(`Invalid ${field}. Expected at most ${maximumLength} characters.`);
  }

  return normalized;
}

function buildTransactionConditions(filters: TransactionFilters): SQL[] {
  const conditions: SQL[] = [];

  if (filters.period) {
    conditions.push(periodCondition(filters.period));
  }

  if (filters.categoryId !== undefined) {
    if (!Number.isInteger(filters.categoryId) || filters.categoryId < 1) {
      throw new Error('Invalid categoryId. Expected a positive integer.');
    }
    conditions.push(eq(schema.transactions.categoryId, filters.categoryId));
  }

  if (filters.categoryId !== undefined && filters.uncategorized) {
    throw new Error('Invalid category filters. categoryId and uncategorized cannot both be set.');
  }

  if (filters.uncategorized) {
    conditions.push(isNull(schema.transactions.categoryId));
  }

  if (filters.status) {
    if (filters.status !== 'needs_review' && filters.status !== 'confirmed') {
      throw new Error('Invalid status. Expected needs_review or confirmed.');
    }
    conditions.push(eq(schema.transactions.status, filters.status));
  }

  if (filters.merchant !== undefined) {
    conditions.push(
      ilike(schema.transactions.merchant, `%${normalizeRequiredText(filters.merchant, 'merchant', MAX_MERCHANT_LENGTH)}%`)
    );
  }

  return conditions;
}

function asWhereClause(conditions: SQL[]): SQL | undefined {
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function mapTransaction(transaction: {
  id: number;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: string;
  categoryId: number | null;
  status: string;
  category: { name: string } | null;
}): FinanceTransaction {
  return {
    id: transaction.id,
    date: transaction.date,
    description: transaction.description,
    merchant: transaction.merchant,
    amountCents: transaction.amount,
    type: transaction.type as TransactionType,
    categoryId: transaction.categoryId,
    categoryName: transaction.category?.name ?? null,
    status: transaction.status as TransactionStatus
  };
}

export function createFinanceQueries(db: Database) {
  async function getCategoryBreakdown(period: FinancePeriod): Promise<CategorySpending[]> {
    const rows = await db
      .select({
        categoryId: schema.categories.id,
        category: schema.categories.name,
        transactionCount: sql<number>`count(*)`,
        totalCents:
          sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`
      })
      .from(schema.transactions)
      .innerJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
      .where(periodCondition(period))
      .groupBy(schema.categories.id, schema.categories.name)
      .orderBy(desc(sql`sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end)`));

    return rows.map((row) => ({
      categoryId: Number(row.categoryId),
      category: row.category,
      transactionCount: Number(row.transactionCount),
      totalCents: Number(row.totalCents)
    }));
  }

  async function getTopMerchants(period: FinancePeriod, limit?: number): Promise<MerchantSpending[]> {
    const resultLimit = normalizeLimit(limit, DEFAULT_MERCHANT_LIMIT, MAX_MERCHANT_LIMIT);
    const rows = await db
      .select({
        merchant: schema.transactions.merchant,
        transactionCount: sql<number>`count(*)`,
        totalCents:
          sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`
      })
      .from(schema.transactions)
      .where(and(periodCondition(period), sql`${schema.transactions.merchant} is not null`))
      .groupBy(schema.transactions.merchant)
      .orderBy(desc(sql`sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end)`))
      .limit(resultLimit);

    return rows
      .filter((row): row is typeof row & { merchant: string } => row.merchant !== null)
      .map((row) => ({
        merchant: row.merchant,
        transactionCount: Number(row.transactionCount),
        totalCents: Number(row.totalCents)
      }));
  }

  async function getMonthlySpendingSummary(month: string, merchantLimit?: number): Promise<MonthlySpendingSummary> {
    const period = { startMonth: month };
    const wherePeriod = periodCondition(period);

    const [spendingRow] = await db
      .select({
        totalSpentCents:
          sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`,
        transactionCount: sql<number>`count(*)`
      })
      .from(schema.transactions)
      .where(wherePeriod);

    const [uncategorizedRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.transactions)
      .where(and(wherePeriod, eq(schema.transactions.status, 'needs_review')));

    const [byCategory, topMerchants] = await Promise.all([
      getCategoryBreakdown(period),
      getTopMerchants(period, merchantLimit)
    ]);

    return {
      month,
      totalSpentCents: Number(spendingRow?.totalSpentCents ?? 0),
      transactionCount: Number(spendingRow?.transactionCount ?? 0),
      uncategorizedCount: Number(uncategorizedRow?.count ?? 0),
      byCategory,
      topMerchants
    };
  }

  async function getTransactions(filters: TransactionFilters = {}): Promise<TransactionPage> {
    const limit = normalizeLimit(filters.limit, DEFAULT_RESULT_LIMIT, MAX_RESULT_LIMIT);
    const offset = normalizeOffset(filters.offset);
    const whereClause = asWhereClause(buildTransactionConditions(filters));

    const data = await db.query.transactions.findMany({
      where: whereClause,
      with: {
        category: {
          columns: {
            name: true
          }
        }
      },
      orderBy: [desc(schema.transactions.date), desc(schema.transactions.id)],
      limit,
      offset
    });

    const totalRows =
      whereClause === undefined
        ? await db.select({ count: sql<number>`count(*)` }).from(schema.transactions)
        : await db.select({ count: sql<number>`count(*)` }).from(schema.transactions).where(whereClause);

    return {
      data: data.map(mapTransaction),
      pagination: {
        limit,
        offset,
        total: Number(totalRows[0]?.count ?? 0)
      }
    };
  }

  return {
    async getAvailableMonths(): Promise<string[]> {
      const rows = await db
        .select({ month: sql<string>`substr(${schema.transactions.date}, 1, 7)` })
        .from(schema.transactions)
        .groupBy(sql`substr(${schema.transactions.date}, 1, 7)`)
        .orderBy(desc(sql`substr(${schema.transactions.date}, 1, 7)`));

      return rows.map((row) => row.month).filter((month) => computeMonthBounds(month) !== null);
    },

    getMonthlySpendingSummary,

    async compareMonths(month: string, comparisonMonth: string): Promise<MonthComparison> {
      const [monthSummary, comparisonSummary] = await Promise.all([
        getMonthlySpendingSummary(month),
        getMonthlySpendingSummary(comparisonMonth)
      ]);
      const totalSpentChangeCents = monthSummary.totalSpentCents - comparisonSummary.totalSpentCents;

      return {
        month: monthSummary,
        comparisonMonth: comparisonSummary,
        totalSpentChangeCents,
        totalSpentChangePercent:
          comparisonSummary.totalSpentCents === 0
            ? null
            : (totalSpentChangeCents / comparisonSummary.totalSpentCents) * 100,
        transactionCountChange: monthSummary.transactionCount - comparisonSummary.transactionCount
      };
    },

    getCategoryBreakdown,
    getTopMerchants,

    async getMerchantSpending(merchant: string, period: FinancePeriod): Promise<MerchantSpendingSummary | null> {
      const normalizedMerchant = normalizeRequiredText(merchant, 'merchant', MAX_MERCHANT_LENGTH);
      const resolvedPeriod = resolvePeriod(period);
      const [row] = await db
        .select({
          merchant: sql<string | null>`min(${schema.transactions.merchant})`,
          transactionCount: sql<number>`count(*)`,
          totalCents:
            sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`
        })
        .from(schema.transactions)
        .where(
          and(
            periodCondition(period),
            sql`lower(${schema.transactions.merchant}) = lower(${normalizedMerchant})`
          )
        )
        .limit(1);

      if (!row?.merchant) {
        return null;
      }

      return {
        period: resolvedPeriod,
        merchant: row.merchant,
        transactionCount: Number(row.transactionCount),
        totalCents: Number(row.totalCents)
      };
    },

    getTransactions,

    async searchTransactions(filters: TransactionSearchFilters): Promise<TransactionPage> {
      const query = normalizeRequiredText(filters.query, 'query', MAX_SEARCH_LENGTH);
      const conditions = buildTransactionConditions(filters);
      conditions.push(
        or(
          ilike(schema.transactions.description, `%${query}%`),
          ilike(schema.transactions.merchant, `%${query}%`)
        ) as SQL
      );

      const limit = normalizeLimit(filters.limit, DEFAULT_RESULT_LIMIT, MAX_RESULT_LIMIT);
      const offset = normalizeOffset(filters.offset);
      const whereClause = asWhereClause(conditions) as SQL;
      const data = await db.query.transactions.findMany({
        where: whereClause,
        with: {
          category: {
            columns: {
              name: true
            }
          }
        },
        orderBy: [desc(schema.transactions.date), desc(schema.transactions.id)],
        limit,
        offset
      });
      const totalRows = await db.select({ count: sql<number>`count(*)` }).from(schema.transactions).where(whereClause);

      return {
        data: data.map(mapTransaction),
        pagination: {
          limit,
          offset,
          total: Number(totalRows[0]?.count ?? 0)
        }
      };
    }
  };
}
