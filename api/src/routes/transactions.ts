import { Hono } from 'hono';
import { z } from 'zod';
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

transactionsRouter.get('/', (c) => {
  const query = querySchema.safeParse(c.req.query());

  if (!query.success) {
    return c.json({ error: 'Invalid query params', details: query.error.flatten() }, 400);
  }

  return c.json({
    data: [],
    pagination: {
      limit: query.data.limit ?? 50,
      offset: query.data.offset ?? 0,
      total: 0
    },
    filters: {
      month: query.data.month ?? null,
      category: query.data.category ?? null,
      status: query.data.status ?? null
    },
    meta: {
      placeholder: true,
      message: 'TODO: implement transactions listing with filters in Phase 1 functional pass.'
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
