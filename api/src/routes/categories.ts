import { Hono } from 'hono';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import type { AuthVariables } from '../middleware/auth.js';

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  keywords: z.string().trim().min(1).max(1000)
});

const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().min(1).max(500).optional(),
    keywords: z.string().trim().min(1).max(1000).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Provide at least one field to update.'
  });

const categoryTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().nonnegative().optional()
});

export const categoriesRouter = new Hono<{ Variables: AuthVariables }>();

categoriesRouter.get('/', async (c) => {
  const [categories, counts] = await Promise.all([
    db.query.categories.findMany({
      orderBy: [asc(schema.categories.name)]
    }),
    db
      .select({
        categoryId: schema.transactions.categoryId,
        transactionCount: sql<number>`count(*)`
      })
      .from(schema.transactions)
      .where(sql`${schema.transactions.categoryId} is not null`)
      .groupBy(schema.transactions.categoryId)
  ]);

  const countsByCategoryId = new Map<number, number>();
  for (const row of counts) {
    if (typeof row.categoryId === 'number') {
      countsByCategoryId.set(row.categoryId, Number(row.transactionCount ?? 0));
    }
  }

  return c.json({
    data: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      keywords: category.keywords,
      isDefault: category.isDefault,
      createdAt: category.createdAt,
      transactionCount: countsByCategoryId.get(category.id) ?? 0
    })),
    meta: {
      count: categories.length
    }
  });
});

categoriesRouter.post('/', async (c) => {
  const payload = createCategorySchema.safeParse(await c.req.json());

  if (!payload.success) {
    return c.json({ error: 'Invalid payload', details: payload.error.flatten() }, 400);
  }

  const existing = await db.query.categories.findFirst({
    where: eq(schema.categories.name, payload.data.name)
  });

  if (existing) {
    return c.json({ error: 'A category with this name already exists.' }, 409);
  }

  const [created] = await db
    .insert(schema.categories)
    .values({
      name: payload.data.name,
      description: payload.data.description,
      keywords: payload.data.keywords,
      isDefault: false
    })
    .returning();

  return c.json(
    {
      data: {
        id: created.id,
        name: created.name,
        description: created.description,
        keywords: created.keywords,
        isDefault: created.isDefault,
        createdAt: created.createdAt,
        transactionCount: 0
      }
    },
    201
  );
});

categoriesRouter.patch('/:id', async (c) => {
  const categoryId = Number(c.req.param('id'));

  if (Number.isNaN(categoryId) || categoryId <= 0) {
    return c.json({ error: 'Invalid category id' }, 400);
  }

  const payload = updateCategorySchema.safeParse(await c.req.json());

  if (!payload.success) {
    return c.json({ error: 'Invalid payload', details: payload.error.flatten() }, 400);
  }

  const existing = await db.query.categories.findFirst({
    where: eq(schema.categories.id, categoryId)
  });

  if (!existing) {
    return c.json({ error: 'Category not found' }, 404);
  }

  if (payload.data.name && payload.data.name !== existing.name) {
    const duplicate = await db.query.categories.findFirst({
      where: eq(schema.categories.name, payload.data.name)
    });

    if (duplicate) {
      return c.json({ error: 'A category with this name already exists.' }, 409);
    }
  }

  const [updated] = await db
    .update(schema.categories)
    .set({
      name: payload.data.name ?? existing.name,
      description: payload.data.description ?? existing.description,
      keywords: payload.data.keywords ?? existing.keywords
    })
    .where(eq(schema.categories.id, categoryId))
    .returning();

  const [countRow] = await db
    .select({ transactionCount: sql<number>`count(*)` })
    .from(schema.transactions)
    .where(eq(schema.transactions.categoryId, categoryId));

  return c.json({
    data: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      keywords: updated.keywords,
      isDefault: updated.isDefault,
      createdAt: updated.createdAt,
      transactionCount: Number(countRow?.transactionCount ?? 0)
    }
  });
});

categoriesRouter.delete('/:id', async (c) => {
  const categoryId = Number(c.req.param('id'));

  if (Number.isNaN(categoryId) || categoryId <= 0) {
    return c.json({ error: 'Invalid category id' }, 400);
  }

  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.id, categoryId)
  });

  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }

  if (category.isDefault) {
    return c.json({ error: 'Default categories cannot be deleted.' }, 400);
  }

  await db
    .update(schema.transactions)
    .set({
      categoryId: null,
      status: 'needs_review',
      categorizedBy: null
    })
    .where(eq(schema.transactions.categoryId, categoryId));

  await db.delete(schema.categories).where(eq(schema.categories.id, categoryId));

  return c.body(null, 204);
});

categoriesRouter.get('/:id/transactions', async (c) => {
  const categoryId = Number(c.req.param('id'));

  if (Number.isNaN(categoryId) || categoryId <= 0) {
    return c.json({ error: 'Invalid category id' }, 400);
  }

  const query = categoryTransactionsQuerySchema.safeParse(c.req.query());

  if (!query.success) {
    return c.json({ error: 'Invalid query params', details: query.error.flatten() }, 400);
  }

  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.id, categoryId)
  });

  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }

  const limit = query.data.limit ?? 50;
  const offset = query.data.offset ?? 0;

  const [rows, totalRows] = await Promise.all([
    db.query.transactions.findMany({
      where: eq(schema.transactions.categoryId, categoryId),
      with: {
        statement: {
          columns: {
            id: true,
            originalFilename: true
          }
        }
      },
      orderBy: [desc(schema.transactions.date), desc(schema.transactions.id)],
      limit,
      offset
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.transactions)
      .where(eq(schema.transactions.categoryId, categoryId))
  ]);

  return c.json({
    data: rows.map((transaction) => ({
      id: transaction.id,
      statementId: transaction.statementId,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      categorizedBy: transaction.categorizedBy,
      statement: {
        id: transaction.statement.id,
        originalFilename: transaction.statement.originalFilename
      }
    })),
    pagination: {
      limit,
      offset,
      total: Number(totalRows[0]?.count ?? 0)
    },
    category: {
      id: category.id,
      name: category.name
    }
  });
});
