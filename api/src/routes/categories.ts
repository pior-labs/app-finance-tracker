import { Hono } from 'hono';
import { asc } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import type { AuthVariables } from '../middleware/auth.js';

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
      isDefault: category.isDefault,
      createdAt: category.createdAt
    })),
    meta: {
      count: categories.length
    }
  });
});
