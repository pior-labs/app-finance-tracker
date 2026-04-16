import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Hono } from 'hono';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { statements, transactions, users } from '../db/schema.js';
import { requireAuth } from '../lib/auth.js';
import { uploadsDir } from '../lib/env.js';

export const statementsRoutes = new Hono();

function sanitizeFilename(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

function asUploadFile(value: string | File | undefined): File | null {
  if (!value) {
    return null;
  }

  return value instanceof File ? value : null;
}

statementsRoutes.get('/', requireAuth, async (c) => {
  const rows = db
    .select({
      id: statements.id,
      uploadedBy: statements.uploadedBy,
      uploadedByName: users.name,
      filename: statements.filename,
      originalFilename: statements.originalFilename,
      institution: statements.institution,
      periodStart: statements.periodStart,
      periodEnd: statements.periodEnd,
      rawText: statements.rawText,
      createdAt: statements.createdAt,
      transactionCount: sql<number>`count(${transactions.id})`
    })
    .from(statements)
    .innerJoin(users, eq(statements.uploadedBy, users.id))
    .leftJoin(transactions, eq(transactions.statementId, statements.id))
    .groupBy(statements.id, users.name)
    .orderBy(desc(statements.createdAt))
    .all()
    .map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      transactionCount: Number(row.transactionCount)
    }));

  return c.json({ statements: rows });
});

statementsRoutes.get('/:id/transactions', requireAuth, async (c) => {
  const statementId = Number(c.req.param('id'));

  if (!Number.isInteger(statementId) || statementId < 1) {
    return c.json({ error: 'Invalid statement id.' }, 400);
  }

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
    .where(eq(transactions.statementId, statementId))
    .orderBy(desc(transactions.date), desc(transactions.id))
    .all()
    .map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString()
    }));

  return c.json({ transactions: rows });
});

statementsRoutes.post('/upload', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.parseBody();
  const file = asUploadFile(
    (body.file as string | File | undefined) ??
      (body.statement as string | File | undefined) ??
      undefined
  );

  if (!file) {
    return c.json({ error: 'No PDF file found in field "file".' }, 400);
  }

  const isPdfFile =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfFile) {
    return c.json({ error: 'Only PDF uploads are supported.' }, 400);
  }

  const safeFilename = sanitizeFilename(file.name);
  const storedFilename = `${Date.now()}-${randomUUID()}-${safeFilename}`;
  const userUploadsDir = path.join(uploadsDir, String(user.id));

  await fs.mkdir(userUploadsDir, { recursive: true });

  const destinationPath = path.join(userUploadsDir, storedFilename);
  const content = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(destinationPath, content);

  const insertResult = db
    .insert(statements)
    .values({
      uploadedBy: user.id,
      filename: storedFilename,
      originalFilename: file.name,
      rawText: null,
      institution: null,
      periodStart: null,
      periodEnd: null
    })
    .run();

  return c.json(
    {
      statement: {
        id: Number(insertResult.lastInsertRowid),
        uploadedBy: user.id,
        filename: storedFilename,
        originalFilename: file.name,
        createdAt: new Date().toISOString()
      }
    },
    201
  );
});
