import { Hono } from 'hono';
import { and, desc, eq, gte, isNull, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import type { AuthVariables } from '../middleware/auth.js';

const querySchema = z.object({
  month: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().nonnegative().optional()
});

const patchSchema = z.object({
  category_id: z.number().int().positive().nullable().optional(),
  status: z.enum(['needs_review', 'auto_categorized', 'confirmed']).optional(),
  categorized_by: z.enum(['human', 'ai']).nullable().optional()
});

export const transactionsRouter = new Hono<{ Variables: AuthVariables }>();

function computeMonthBounds(month: string): { start: string; endExclusive: string } | null {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]);
  if (monthIndex < 1 || monthIndex > 12) {
    return null;
  }

  const start = `${String(year).padStart(4, '0')}-${String(monthIndex).padStart(2, '0')}-01`;
  const nextMonthYear = monthIndex === 12 ? year + 1 : year;
  const nextMonth = monthIndex === 12 ? 1 : monthIndex + 1;
  const endExclusive = `${String(nextMonthYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}-01`;

  return { start, endExclusive };
}

transactionsRouter.get('/stats', (c) => {
  return c.json({
    data: {
      totalSpentCents: 0,
      uncategorizedCount: 0,
      byCategory: [] as Array<{ category: string; totalCents: number }>
    },
    meta: {
      placeholder: true,
      message: 'TODO: implement transactions stats query in Phase 1 functional pass.'
    }
  });
});

transactionsRouter.get('/', async (c) => {
  const query = querySchema.safeParse(c.req.query());

  if (!query.success) {
    return c.json({ error: 'Invalid query params', details: query.error.flatten() }, 400);
  }

  const filters = [];
  const categoryFilter = query.data.category;
  const statusFilter = query.data.status;
  const monthFilter = query.data.month;

  if (monthFilter && monthFilter !== 'all') {
    const bounds = computeMonthBounds(monthFilter);
    if (!bounds) {
      return c.json({ error: 'Invalid month filter. Expected format YYYY-MM.' }, 400);
    }

    filters.push(gte(schema.transactions.date, bounds.start));
    filters.push(lt(schema.transactions.date, bounds.endExclusive));
  }

  if (categoryFilter && categoryFilter !== 'all') {
    if (categoryFilter === 'uncategorized') {
      filters.push(isNull(schema.transactions.categoryId));
    } else {
      const parsedCategoryId = Number(categoryFilter);
      if (Number.isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
        return c.json({ error: 'Invalid category filter.' }, 400);
      }
      filters.push(eq(schema.transactions.categoryId, parsedCategoryId));
    }
  }

  if (statusFilter && statusFilter !== 'all') {
    if (!['needs_review', 'auto_categorized', 'confirmed'].includes(statusFilter)) {
      return c.json({ error: 'Invalid status filter.' }, 400);
    }
    filters.push(eq(schema.transactions.status, statusFilter));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;
  const limit = query.data.limit ?? 50;
  const offset = query.data.offset ?? 0;

  const transactions = await db.query.transactions.findMany({
    where: whereClause,
    with: {
      category: {
        columns: {
          id: true,
          name: true
        }
      },
      statement: {
        columns: {
          id: true,
          originalFilename: true,
          uploadedBy: true
        },
        with: {
          uploadedByUser: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: [desc(schema.transactions.date), desc(schema.transactions.id)],
    limit,
    offset
  });

  const totalResult =
    whereClause === undefined
      ? await db.select({ count: sql<number>`count(*)` }).from(schema.transactions)
      : await db.select({ count: sql<number>`count(*)` }).from(schema.transactions).where(whereClause);

  const total = Number(totalResult[0]?.count ?? 0);

  return c.json({
    data: transactions.map((transaction) => ({
      id: transaction.id,
      statementId: transaction.statementId,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name ?? null,
      confidenceScore: transaction.confidenceScore,
      status: transaction.status,
      categorizedBy: transaction.categorizedBy,
      createdAt: transaction.createdAt,
      statement: {
        id: transaction.statement.id,
        originalFilename: transaction.statement.originalFilename,
        uploadedBy: transaction.statement.uploadedBy,
        uploadedByUser: transaction.statement.uploadedByUser
      }
    })),
    pagination: {
      limit,
      offset,
      total
    },
    filters: {
      month: monthFilter ?? null,
      category: categoryFilter ?? null,
      status: statusFilter ?? null
    }
  });
});

transactionsRouter.patch('/:id', async (c) => {
  const transactionId = Number(c.req.param('id'));
  if (Number.isNaN(transactionId) || transactionId <= 0) {
    return c.json({ error: 'Invalid transaction id' }, 400);
  }

  const payload = patchSchema.safeParse(await c.req.json());

  if (!payload.success) {
    return c.json({ error: 'Invalid payload', details: payload.error.flatten() }, 400);
  }

  return c.json(
    {
      error: 'Not implemented',
      transactionId,
      payload: payload.data,
      message: 'TODO: implement transaction patch update in Phase 1 functional pass.'
    },
    501
  );
});
