import { Hono } from 'hono';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import type { AuthVariables } from '../middleware/auth.js';

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #6b8db5.');

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(250).optional(),
  keywords: z.string().trim().max(500).optional(),
  color: colorSchema.optional(),
  isFavorite: z.boolean().optional()
});

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(250).optional(),
    keywords: z.string().trim().max(500).optional(),
    color: colorSchema.optional(),
    isFavorite: z.boolean().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required.'
  });

export const categoriesRouter = new Hono<{ Variables: AuthVariables }>();

categoriesRouter.get('/', async (c) => {
  const categories = await db.query.categories.findMany({
    orderBy: [asc(schema.categories.name)]
  });

  return c.json({
    data: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      keywords: category.keywords,
      color: category.color,
      isDefault: category.isDefault,
      isFavorite: category.isFavorite,
      createdAt: category.createdAt
    })),
    meta: {
      count: categories.length
    }
  });
});

categoriesRouter.post('/', async (c) => {
  const parsed = createSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) {
    return c.json({ error: 'Invalid payload', details: parsed.error.flatten() }, 400);
  }

  const payload = parsed.data;
  const existing = await db.query.categories.findFirst({
    where: eq(schema.categories.name, payload.name)
  });
  if (existing) {
    return c.json({ error: 'Category name already exists.' }, 409);
  }

  const [created] = await db
    .insert(schema.categories)
    .values({
      name: payload.name,
      description: payload.description ?? '',
      keywords: payload.keywords ?? '',
      color: payload.color ?? '#6b8db5',
      isDefault: false,
      isFavorite: payload.isFavorite ?? false
    })
    .returning();

  return c.json(
    {
      data: {
        id: created.id,
        name: created.name,
        description: created.description,
        keywords: created.keywords,
        color: created.color,
        isDefault: created.isDefault,
        isFavorite: created.isFavorite,
        createdAt: created.createdAt
      }
    },
    201
  );
});

categoriesRouter.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'Invalid category id.' }, 400);
  }

  const parsed = updateSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) {
    return c.json({ error: 'Invalid payload', details: parsed.error.flatten() }, 400);
  }

  const current = await db.query.categories.findFirst({
    where: eq(schema.categories.id, id)
  });
  if (!current) {
    return c.json({ error: 'Category not found.' }, 404);
  }

  if (parsed.data.name && parsed.data.name !== current.name) {
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.name, parsed.data.name)
    });
    if (existing) {
      return c.json({ error: 'Category name already exists.' }, 409);
    }
  }

  const [updated] = await db
    .update(schema.categories)
    .set({
      name: parsed.data.name ?? current.name,
      description: parsed.data.description ?? current.description,
      keywords: parsed.data.keywords ?? current.keywords,
      color: parsed.data.color ?? current.color,
      isFavorite: parsed.data.isFavorite ?? current.isFavorite
    })
    .where(eq(schema.categories.id, id))
    .returning();

  return c.json({
    data: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      keywords: updated.keywords,
      color: updated.color,
      isDefault: updated.isDefault,
      isFavorite: updated.isFavorite,
      createdAt: updated.createdAt
    }
  });
});

categoriesRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'Invalid category id.' }, 400);
  }

  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.id, id)
  });
  if (!category) {
    return c.json({ error: 'Category not found.' }, 404);
  }
  if (category.name.toLowerCase() === 'other') {
    return c.json({ error: 'Cannot delete the Other category.' }, 400);
  }

  const fallbackCategory = await db.query.categories.findFirst({
    where: eq(schema.categories.name, 'Other')
  });
  if (!fallbackCategory) {
    return c.json({ error: 'Fallback category "Other" is missing.' }, 500);
  }

  await db
    .update(schema.transactions)
    .set({ categoryId: fallbackCategory.id })
    .where(eq(schema.transactions.categoryId, id));

  await db.delete(schema.categories).where(eq(schema.categories.id, id));

  return c.json({ ok: true });
});
