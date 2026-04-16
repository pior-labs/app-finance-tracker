import type { CategorizedBy, TransactionStatus } from '@finlens/shared';
import { Hono } from 'hono';
import {
  and,
  count,
  desc,
  eq,
  gte,
  isNull,
  lt,
  sql
} from 'drizzle-orm';
import { db } from '../db/client.js';
import { categories, statements, transactions, users } from '../db/schema.js';
import { requireAuth } from '../lib/auth.js';

export const transactionsRoutes = new Hono();

const STATUS_VALUES: TransactionStatus[] = [
  'needs_review',
  'confirmed',
  'auto_categorized'
];
const CATEGORIZED_BY_VALUES: CategorizedBy[] = ['human', 'ai'];

function parseMonthBounds(month: string): { start: string; end: string } | null {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return null;
  }

  const [yearString, monthString] = month.split('-');
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

function currentMonthBounds() {
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const bounds = parseMonthBounds(month);

  if (!bounds) {
    throw new Error('Failed to calculate current month bounds.');
  }

  return { ...bounds, month };
}

transactionsRoutes.get('/', requireAuth, async (c) => {
  const month = c.req.query('month');
  const category = c.req.query('category');
  const status = c.req.query('status');
  const limit = Math.min(Math.max(Number(c.req.query('limit') ?? '50') || 50, 1), 200);
  const offset = Math.max(Number(c.req.query('offset') ?? '0') || 0, 0);

  const filters = [];

  if (month) {
    const bounds = parseMonthBounds(month);

    if (!bounds) {
      return c.json({ error: 'Invalid month. Use YYYY-MM.' }, 400);
    }

    filters.push(gte(transactions.date, bounds.start));
    filters.push(lt(transactions.date, bounds.end));
  }

  if (category) {
    if (category === 'uncategorized') {
      filters.push(isNull(transactions.categoryId));
    } else {
      const categoryId = Number(category);

      if (!Number.isInteger(categoryId) || categoryId < 1) {
        return c.json({ error: 'Invalid category filter.' }, 400);
      }

      filters.push(eq(transactions.categoryId, categoryId));
    }
  }

  if (status) {
    if (!STATUS_VALUES.includes(status as TransactionStatus)) {
      return c.json({ error: 'Invalid status filter.' }, 400);
    }

    filters.push(eq(transactions.status, status as TransactionStatus));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const rows = db
    .select({
      id: transactions.id,
      statementId: transactions.statementId,
      date: transactions.date,
      description: transactions.description,
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      confidenceScore: transactions.confidenceScore,
      status: transactions.status,
      categorizedBy: transactions.categorizedBy,
      uploaderName: users.name,
      createdAt: transactions.createdAt
    })
    .from(transactions)
    .innerJoin(statements, eq(transactions.statementId, statements.id))
    .innerJoin(users, eq(statements.uploadedBy, users.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(whereClause)
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(limit)
    .offset(offset)
    .all()
    .map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString()
    }));

  const totalRow = db
    .select({ total: count() })
    .from(transactions)
    .where(whereClause)
    .get();

  const total = totalRow?.total ?? 0;

  return c.json({
    transactions: rows,
    pagination: {
      total,
      limit,
      offset
    }
  });
});

interface PatchTransactionPayload {
  category_id?: number | null;
  status?: TransactionStatus;
  categorized_by?: CategorizedBy | null;
}

transactionsRoutes.patch('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'));

  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'Invalid transaction id.' }, 400);
  }

  const body = (await c.req.json().catch(() => null)) as PatchTransactionPayload | null;

  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Invalid payload.' }, 400);
  }

  const updates: {
    categoryId?: number | null;
    status?: TransactionStatus;
    categorizedBy?: CategorizedBy | null;
  } = {};

  if (Object.prototype.hasOwnProperty.call(body, 'category_id')) {
    if (body.category_id === null) {
      updates.categoryId = null;
    } else {
      const categoryId = Number(body.category_id);

      if (!Number.isInteger(categoryId) || categoryId < 1) {
        return c.json({ error: 'Invalid category_id.' }, 400);
      }

      const category = db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, categoryId))
        .get();

      if (!category) {
        return c.json({ error: 'Category not found.' }, 404);
      }

      updates.categoryId = categoryId;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    if (!body.status || !STATUS_VALUES.includes(body.status)) {
      return c.json({ error: 'Invalid status.' }, 400);
    }

    updates.status = body.status;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'categorized_by')) {
    if (body.categorized_by === null) {
      updates.categorizedBy = null;
    } else if (!body.categorized_by || !CATEGORIZED_BY_VALUES.includes(body.categorized_by)) {
      return c.json({ error: 'Invalid categorized_by.' }, 400);
    } else {
      updates.categorizedBy = body.categorized_by;
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No updatable fields provided.' }, 400);
  }

  const result = db
    .update(transactions)
    .set(updates)
    .where(eq(transactions.id, id))
    .run();

  if (result.changes < 1) {
    return c.json({ error: 'Transaction not found.' }, 404);
  }

  const transaction = db
    .select({
      id: transactions.id,
      statementId: transactions.statementId,
      date: transactions.date,
      description: transactions.description,
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      confidenceScore: transactions.confidenceScore,
      status: transactions.status,
      categorizedBy: transactions.categorizedBy,
      uploaderName: users.name,
      createdAt: transactions.createdAt
    })
    .from(transactions)
    .innerJoin(statements, eq(transactions.statementId, statements.id))
    .innerJoin(users, eq(statements.uploadedBy, users.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.id, id))
    .get();

  if (!transaction) {
    return c.json({ error: 'Transaction not found.' }, 404);
  }

  return c.json({
    transaction: {
      ...transaction,
      createdAt: transaction.createdAt.toISOString()
    }
  });
});

transactionsRoutes.get('/stats', requireAuth, async (c) => {
  const requestedMonth = c.req.query('month');
  const defaultMonth = currentMonthBounds();
  const bounds = requestedMonth ? parseMonthBounds(requestedMonth) : defaultMonth;

  if (!bounds) {
    return c.json({ error: 'Invalid month. Use YYYY-MM.' }, 400);
  }

  const month = requestedMonth ?? defaultMonth.month;

  const totalSpendingRow = db
    .select({
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'debit'),
        gte(transactions.date, bounds.start),
        lt(transactions.date, bounds.end)
      )
    )
    .get();

  const uncategorizedCountRow = db
    .select({ total: count() })
    .from(transactions)
    .where(
      and(
        isNull(transactions.categoryId),
        gte(transactions.date, bounds.start),
        lt(transactions.date, bounds.end)
      )
    )
    .get();

  const spendingByCategoryRows = db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      totalAmount: sql<number>`coalesce(sum(${transactions.amount}), 0)`
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.type, 'debit'),
        gte(transactions.date, bounds.start),
        lt(transactions.date, bounds.end)
      )
    )
    .groupBy(categories.id)
    .orderBy(desc(sql`coalesce(sum(${transactions.amount}), 0)`))
    .all()
    .map((row) => ({
      ...row,
      totalAmount: Number(row.totalAmount)
    }));

  const totalSpendingCents = Number(totalSpendingRow?.total ?? 0);
  const uncategorizedCount = uncategorizedCountRow?.total ?? 0;

  return c.json({
    month,
    totalSpendingCents,
    uncategorizedCount,
    spendingByCategory: spendingByCategoryRows
  });
});
