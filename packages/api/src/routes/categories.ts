import { Hono } from 'hono';
import { asc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { categories } from '../db/schema.js';
import { requireAuth } from '../lib/auth.js';

export const categoriesRoutes = new Hono();

categoriesRoutes.get('/', requireAuth, async (c) => {
  const allCategories = db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      keywords: categories.keywords,
      isDefault: categories.isDefault,
      createdAt: categories.createdAt
    })
    .from(categories)
    .orderBy(asc(categories.name))
    .all()
    .map((category) => ({
      ...category,
      createdAt: category.createdAt.toISOString()
    }));

  return c.json({ categories: allCategories });
});
