import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { db, schema } from '../db/index.js';
import { ensureDir, env, resolveFromApiDir } from '../lib/env.js';
import type { AuthVariables } from '../middleware/auth.js';
import { extractPdfText, parseBankStatementText } from '../services/pdf-parser.js';

export const statementsRouter = new Hono<{ Variables: AuthVariables }>();

function isFileLike(value: unknown): value is { name: string; type: string; arrayBuffer: () => Promise<ArrayBuffer> } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'name' in value &&
    typeof value.name === 'string' &&
    'arrayBuffer' in value &&
    typeof value.arrayBuffer === 'function'
  );
}

function getFirstFile(bodyValue: unknown): { name: string; type: string; arrayBuffer: () => Promise<ArrayBuffer> } | null {
  if (isFileLike(bodyValue)) {
    return bodyValue;
  }

  if (Array.isArray(bodyValue)) {
    for (const value of bodyValue) {
      if (isFileLike(value)) {
        return value;
      }
    }
  }

  return null;
}

function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getStatementPeriodFromTransactions(
  transactions: { date: string }[]
): { periodStart: string | null; periodEnd: string | null } {
  if (transactions.length === 0) {
    return { periodStart: null, periodEnd: null };
  }

  const sortedDates = transactions.map((transaction) => transaction.date).sort();

  return {
    periodStart: sortedDates[0],
    periodEnd: sortedDates[sortedDates.length - 1]
  };
}

statementsRouter.get('/', async (c) => {
  const statements = await db.query.statements.findMany({
    with: {
      uploadedByUser: {
        columns: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: [desc(schema.statements.createdAt)]
  });

  const statementIds = statements.map((statement) => statement.id);
  const transactionCounts =
    statementIds.length > 0
      ? await db
          .select({
            statementId: schema.transactions.statementId,
            count: sql<number>`count(*)`
          })
          .from(schema.transactions)
          .where(inArray(schema.transactions.statementId, statementIds))
          .groupBy(schema.transactions.statementId)
      : [];

  const transactionCountByStatementId = new Map(
    transactionCounts.map((item) => [item.statementId, Number(item.count)])
  );

  return c.json({
    data: statements.map((statement) => ({
      id: statement.id,
      uploadedBy: statement.uploadedBy,
      filename: statement.filename,
      originalFilename: statement.originalFilename,
      institution: statement.institution,
      periodStart: statement.periodStart,
      periodEnd: statement.periodEnd,
      createdAt: statement.createdAt,
      uploadedByUser: statement.uploadedByUser,
      transactionCount: transactionCountByStatementId.get(statement.id) ?? 0
    })),
    meta: {
      count: statements.length
    }
  });
});

statementsRouter.get('/:id/transactions', async (c) => {
  const statementId = Number(c.req.param('id'));

  if (!Number.isFinite(statementId) || statementId <= 0) {
    return c.json({ error: 'Invalid statement id' }, 400);
  }

  const statement = await db.query.statements.findFirst({
    where: eq(schema.statements.id, statementId)
  });

  if (!statement) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  const transactions = await db.query.transactions.findMany({
    where: eq(schema.transactions.statementId, statementId),
    with: {
      category: {
        columns: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [desc(schema.transactions.date), desc(schema.transactions.id)]
  });

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
      createdAt: transaction.createdAt
    }))
  });
});

statementsRouter.post('/upload', async (c) => {
  const userId = c.get('userId');
  const form = await c.req.parseBody();
  const uploadedFile = getFirstFile(form.file);

  if (!uploadedFile) {
    return c.json({ error: 'Missing file. Expected multipart field `file`.' }, 400);
  }

  const originalFilename = uploadedFile.name || 'statement.pdf';
  const isPdfMimeType = uploadedFile.type === 'application/pdf';
  const isPdfExtension = originalFilename.toLowerCase().endsWith('.pdf');

  if (!isPdfMimeType && !isPdfExtension) {
    return c.json({ error: 'Only PDF uploads are supported.' }, 400);
  }

  const sanitizedOriginalFilename = sanitizeFilename(path.basename(originalFilename));
  const storedFilename = `${Date.now()}-${randomUUID()}-${sanitizedOriginalFilename}`;
  const uploadRootPath = resolveFromApiDir(env.uploadDir);
  const userUploadPath = path.join(uploadRootPath, String(userId));
  const absoluteFilePath = path.join(userUploadPath, storedFilename);

  ensureDir(userUploadPath);

  const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
  await writeFile(absoluteFilePath, fileBuffer);

  const extractedText = await extractPdfText(fileBuffer);
  const parsedTransactions = parseBankStatementText(extractedText);
  const { periodStart, periodEnd } = getStatementPeriodFromTransactions(parsedTransactions);

  const [createdStatement] = await db
    .insert(schema.statements)
    .values({
      uploadedBy: userId,
      filename: storedFilename,
      originalFilename: sanitizedOriginalFilename,
      periodStart,
      periodEnd,
      rawText: extractedText
    })
    .returning();

  if (parsedTransactions.length > 0) {
    await db.insert(schema.transactions).values(
      parsedTransactions.map((transaction) => ({
        statementId: createdStatement.id,
        date: transaction.date,
        description: transaction.description,
        merchant: transaction.merchant,
        amount: transaction.amount,
        type: transaction.type,
        categoryId: null,
        status: 'needs_review'
      }))
    );
  }

  const [insertedCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.transactions)
    .where(and(eq(schema.transactions.statementId, createdStatement.id)));

  return c.json(
    {
      data: {
        id: createdStatement.id,
        uploadedBy: createdStatement.uploadedBy,
        filename: createdStatement.filename,
        originalFilename: createdStatement.originalFilename,
        institution: createdStatement.institution,
        periodStart: createdStatement.periodStart,
        periodEnd: createdStatement.periodEnd,
        createdAt: createdStatement.createdAt
      },
      meta: {
        insertedTransactions: Number(insertedCountRow?.count ?? 0)
      }
    },
    201
  );
});

statementsRouter.delete('/:id', async (c) => {
  const statementId = Number(c.req.param('id'));

  if (!Number.isFinite(statementId) || statementId <= 0) {
    return c.json({ error: 'Invalid statement id' }, 400);
  }

  const statement = await db.query.statements.findFirst({
    where: eq(schema.statements.id, statementId)
  });

  if (!statement) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  await db.transaction(async (tx) => {
    await tx.delete(schema.transactions).where(eq(schema.transactions.statementId, statementId));
    await tx.delete(schema.statements).where(eq(schema.statements.id, statementId));
  });

  return c.json({ success: true });
});

statementsRouter.post('/:id/reparse', async (c) => {
  const statementId = Number(c.req.param('id'));

  if (!Number.isFinite(statementId) || statementId <= 0) {
    return c.json({ error: 'Invalid statement id' }, 400);
  }

  const statement = await db.query.statements.findFirst({
    where: eq(schema.statements.id, statementId)
  });

  if (!statement) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  const rawText = statement.rawText?.trim();
  if (!rawText) {
    return c.json({ error: 'Statement cannot be re-parsed because no raw text is stored.' }, 400);
  }

  const parsedTransactions = parseBankStatementText(rawText);
  const { periodStart, periodEnd } = getStatementPeriodFromTransactions(parsedTransactions);

  await db.transaction(async (tx) => {
    await tx.delete(schema.transactions).where(eq(schema.transactions.statementId, statementId));

    if (parsedTransactions.length > 0) {
      await tx.insert(schema.transactions).values(
        parsedTransactions.map((transaction) => ({
          statementId,
          date: transaction.date,
          description: transaction.description,
          merchant: transaction.merchant,
          amount: transaction.amount,
          type: transaction.type,
          categoryId: null,
          status: 'needs_review'
        }))
      );
    }

    await tx
      .update(schema.statements)
      .set({
        periodStart,
        periodEnd
      })
      .where(eq(schema.statements.id, statementId));
  });

  return c.json({
    data: {
      id: statementId,
      periodStart,
      periodEnd
    },
    meta: {
      insertedTransactions: parsedTransactions.length
    }
  });
});
