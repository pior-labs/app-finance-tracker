import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { statements, transactions } from '../db/schema.js';
import { requireAuth } from '../lib/auth.js';

export const transactionsRoutes = new Hono();

transactionsRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user');

  const rows = db
    .select({
      id: transactions.id,
      statementId: transactions.statementId,
      date: transactions.date,
      description: transactions.description,
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      confidenceScore: transactions.confidenceScore,
      status: transactions.status,
      categorizedBy: transactions.categorizedBy,
      createdAt: transactions.createdAt
    })
    .from(transactions)
    .innerJoin(statements, eq(transactions.statementId, statements.id))
    .where(eq(statements.userId, user.id))
    .orderBy(desc(transactions.date))
    .all()
    .map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString()
    }));

  return c.json({ transactions: rows });
});
