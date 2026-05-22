import { Hono } from 'hono';
import { and, desc, eq, gte, isNull, like, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import type { AuthVariables } from '../middleware/auth.js';

const querySchema = z.object({
  month: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  merchant: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().nonnegative().optional()
});

const statsQuerySchema = z.object({
  month: z.string().optional()
});

const patchSchema = z.object({
  category_id: z.number().int().positive().nullable().optional(),
  status: z.enum(['needs_review', 'confirmed']).optional()
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

transactionsRouter.get('/stats', async (c) => {
  const query = statsQuerySchema.safeParse(c.req.query());

  if (!query.success) {
    return c.json({ error: 'Invalid query params', details: query.error.flatten() }, 400);
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const month = query.data.month ?? currentMonth;
  const bounds = computeMonthBounds(month);

  if (!bounds) {
    return c.json({ error: 'Invalid month filter. Expected format YYYY-MM.' }, 400);
  }

  const [spendingRow] = await db
    .select({
      totalSpentCents:
        sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`
    })
    .from(schema.transactions)
    .where(and(gte(schema.transactions.date, bounds.start), lt(schema.transactions.date, bounds.endExclusive)));

  const [uncategorizedRow] = await db
    .select({ uncategorizedCount: sql<number>`count(*)` })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.status, 'needs_review'),
        gte(schema.transactions.date, bounds.start),
        lt(schema.transactions.date, bounds.endExclusive)
      )
    );

  const [monthTransactionCountRow] = await db
    .select({ monthTransactionCount: sql<number>`count(*)` })
    .from(schema.transactions)
    .where(and(gte(schema.transactions.date, bounds.start), lt(schema.transactions.date, bounds.endExclusive)));

  const [transactionCountRow] = await db
    .select({ totalTransactionCount: sql<number>`count(*)` })
    .from(schema.transactions);

  const availableMonthRows = await db
    .select({ month: sql<string>`substr(${schema.transactions.date}, 1, 7)` })
    .from(schema.transactions)
    .groupBy(sql`substr(${schema.transactions.date}, 1, 7)`)
    .orderBy(desc(sql`substr(${schema.transactions.date}, 1, 7)`));

  const byCategoryRows = await db
    .select({
      categoryId: schema.categories.id,
      category: schema.categories.name,
      transactionCount: sql<number>`count(*)`,
      totalCents:
        sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`
    })
    .from(schema.transactions)
    .innerJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
    .where(and(gte(schema.transactions.date, bounds.start), lt(schema.transactions.date, bounds.endExclusive)))
    .groupBy(schema.categories.id, schema.categories.name)
    .orderBy(desc(sql`sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end)`));

  const byMerchantRows = await db
    .select({
      merchant: schema.transactions.merchant,
      transactionCount: sql<number>`count(*)`,
      totalCents:
        sql<number>`coalesce(sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end), 0)`
    })
    .from(schema.transactions)
    .where(
      and(
        gte(schema.transactions.date, bounds.start),
        lt(schema.transactions.date, bounds.endExclusive),
        sql`${schema.transactions.merchant} is not null`
      )
    )
    .groupBy(schema.transactions.merchant)
    .orderBy(desc(sql`sum(case when ${schema.transactions.amount} > 0 then ${schema.transactions.amount} else 0 end)`))
    .limit(10);

  const [latestStatementRow] = await db
    .select({
      id: schema.statements.id,
      periodStart: schema.statements.periodStart,
      periodEnd: schema.statements.periodEnd,
      uploadedByName: schema.users.name
    })
    .from(schema.statements)
    .innerJoin(schema.users, eq(schema.statements.uploadedBy, schema.users.id))
    .orderBy(desc(schema.statements.createdAt))
    .limit(1);

  let latestStatement: {
    periodStart: string | null;
    periodEnd: string | null;
    transactionCount: number;
    uploadedByName: string;
  } | undefined;

  if (latestStatementRow) {
    const [statementTxCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.transactions)
      .where(eq(schema.transactions.statementId, latestStatementRow.id));

    latestStatement = {
      periodStart: latestStatementRow.periodStart,
      periodEnd: latestStatementRow.periodEnd,
      transactionCount: Number(statementTxCountRow?.count ?? 0),
      uploadedByName: latestStatementRow.uploadedByName
    };
  }

  return c.json({
    data: {
      totalSpentCents: Number(spendingRow?.totalSpentCents ?? 0),
      uncategorizedCount: Number(uncategorizedRow?.uncategorizedCount ?? 0),
      monthTransactionCount: Number(monthTransactionCountRow?.monthTransactionCount ?? 0),
      totalTransactionCount: Number(transactionCountRow?.totalTransactionCount ?? 0),
      byCategory: byCategoryRows.map((row) => ({
        categoryId: Number(row.categoryId),
        category: row.category,
        transactionCount: Number(row.transactionCount ?? 0),
        totalCents: Number(row.totalCents ?? 0)
      })),
      topMerchants: byMerchantRows
        .filter((row) => row.merchant)
        .map((row) => ({
          merchant: row.merchant as string,
          transactionCount: Number(row.transactionCount ?? 0),
          totalCents: Number(row.totalCents ?? 0)
        }))
    },
    meta: {
      month,
      availableMonths: availableMonthRows.map((row) => row.month).filter((availableMonth) => availableMonth.length === 7),
      latestStatement
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
  const merchantFilter = query.data.merchant;

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
      if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) {
        return c.json({ error: 'Invalid category filter.' }, 400);
      }
      filters.push(eq(schema.transactions.categoryId, parsedCategoryId));
    }
  }

  if (statusFilter && statusFilter !== 'all') {
    if (!['needs_review', 'confirmed'].includes(statusFilter)) {
      return c.json({ error: 'Invalid status filter.' }, 400);
    }

    filters.push(eq(schema.transactions.status, statusFilter));
  }

  if (merchantFilter && merchantFilter !== 'all') {
    filters.push(like(sql`lower(${schema.transactions.merchant})`, `%${merchantFilter.toLowerCase()}%`));
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
      merchant: transaction.merchant,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name ?? null,
      status: transaction.status,
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
      status: statusFilter ?? null,
      merchant: merchantFilter ?? null
    }
  });
});

transactionsRouter.patch('/:id', async (c) => {
  const transactionId = Number(c.req.param('id'));
  if (!Number.isFinite(transactionId) || transactionId <= 0) {
    return c.json({ error: 'Invalid transaction id' }, 400);
  }

  const payload = patchSchema.safeParse(await c.req.json());

  if (!payload.success) {
    return c.json({ error: 'Invalid payload', details: payload.error.flatten() }, 400);
  }

  if (Object.keys(payload.data).length === 0) {
    return c.json({ error: 'Empty payload. Provide at least one updatable field.' }, 400);
  }

  if (payload.data.category_id !== undefined && payload.data.category_id !== null) {
    const category = await db.query.categories.findFirst({
      where: eq(schema.categories.id, payload.data.category_id)
    });

    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }
  }

  const updateData: Partial<typeof schema.transactions.$inferInsert> = {};
  if (payload.data.category_id !== undefined) {
    updateData.categoryId = payload.data.category_id;
  }
  if (payload.data.status !== undefined) {
    updateData.status = payload.data.status;
  }

  const updatedRows = await db
    .update(schema.transactions)
    .set(updateData)
    .where(eq(schema.transactions.id, transactionId))
    .returning({ id: schema.transactions.id });

  if (updatedRows.length === 0) {
    return c.json({ error: 'Transaction not found' }, 404);
  }

  const updatedTransaction = await db.query.transactions.findFirst({
    where: eq(schema.transactions.id, transactionId),
    with: {
      category: {
        columns: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!updatedTransaction) {
    return c.json({ error: 'Transaction not found' }, 404);
  }

  return c.json({
    data: {
      id: updatedTransaction.id,
      statementId: updatedTransaction.statementId,
      date: updatedTransaction.date,
      description: updatedTransaction.description,
      merchant: updatedTransaction.merchant,
      amount: updatedTransaction.amount,
      type: updatedTransaction.type,
      categoryId: updatedTransaction.categoryId,
      categoryName: updatedTransaction.category?.name ?? null,
      status: updatedTransaction.status,
      createdAt: updatedTransaction.createdAt
    }
  });
});

transactionsRouter.delete('/:id', async (c) => {
  const transactionId = Number(c.req.param('id'));
  if (!Number.isFinite(transactionId) || transactionId <= 0) {
    return c.json({ error: 'Invalid transaction id' }, 400);
  }

  const deletedRows = await db
    .delete(schema.transactions)
    .where(eq(schema.transactions.id, transactionId))
    .returning({ id: schema.transactions.id });

  if (deletedRows.length === 0) {
    return c.json({ error: 'Transaction not found' }, 404);
  }

  return c.json({
    data: {
      id: deletedRows[0].id
    }
  });
});
