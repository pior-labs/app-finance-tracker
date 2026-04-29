import { randomUUID } from 'node:crypto';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { db, schema } from '../db/index.js';
import { ensureDir, env, resolveFromApiDir } from '../lib/env.js';
import type { AuthVariables } from '../middleware/auth.js';
import {
  extractPdfText,
  parseBankStatementText,
  parseRbcStatementTable,
  type ParsedStatementRow
} from '../services/pdf-parser.js';

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

function logExtractedStatementText(logContext: string, filename: string, extractedText: string): void {
  console.log(`[${logContext}] Extracted ${extractedText.length} characters from ${filename}`);
  console.log('----- PDF RAW TEXT START -----');
  console.log(extractedText);
  console.log('----- PDF RAW TEXT END -----');
}

function logParsedRows(logContext: string, filename: string, parsedRows: ParsedStatementRow[]): void {
  console.log(`[${logContext}] Parsed ${parsedRows.length} rows from ${filename}`);
  console.log('----- PDF PARSED ROWS START -----');
  console.log(JSON.stringify(parsedRows, null, 2));
  console.log('----- PDF PARSED ROWS END -----');
}

function getStatementPeriodFromRows(rows: ParsedStatementRow[]): { periodStart: string | null; periodEnd: string | null } {
  if (rows.length === 0) {
    return { periodStart: null, periodEnd: null };
  }

  const sortedDates = rows.map((row) => row.transactionDate).sort();
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
      rawText: statement.rawText,
      createdAt: statement.createdAt,
      uploadedByUser: statement.uploadedByUser,
      transactionCount: transactionCountByStatementId.get(statement.id) ?? 0
    })),
    meta: {
      count: statements.length
    }
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
  logExtractedStatementText('statements/upload', sanitizedOriginalFilename, extractedText);
  const parsedRows = parseRbcStatementTable(extractedText);
  logParsedRows('statements/upload', sanitizedOriginalFilename, parsedRows);
  const parsedTransactions = parseBankStatementText(extractedText);
  const { periodStart, periodEnd } = getStatementPeriodFromRows(parsedRows);

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
        amount: transaction.amount,
        type: transaction.type,
        categoryId: null,
        confidenceScore: null,
        status: 'needs_review',
        categorizedBy: null
      }))
    );
  }

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
        rawText: null,
        createdAt: createdStatement.createdAt
      },
      meta: {
        uploadPath: path.relative(resolveFromApiDir('../data'), absoluteFilePath),
        parsedRows: parsedRows.length,
        insertedTransactions: parsedTransactions.length
      }
    },
    201
  );
});

statementsRouter.post('/:id/log', async (c) => {
  const statementId = Number(c.req.param('id'));
  if (Number.isNaN(statementId) || statementId <= 0) {
    return c.json({ error: 'Invalid statement id' }, 400);
  }

  const statement = await db.query.statements.findFirst({
    where: eq(schema.statements.id, statementId)
  });

  if (!statement) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  const uploadRootPath = resolveFromApiDir(env.uploadDir);
  const safeStoredFilename = path.basename(statement.filename);
  const statementFilePath = path.join(uploadRootPath, String(statement.uploadedBy), safeStoredFilename);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(statementFilePath);
  } catch {
    return c.json({ error: 'Statement file not found on disk' }, 404);
  }

  const extractedText = await extractPdfText(fileBuffer);
  logExtractedStatementText('statements/log', statement.originalFilename, extractedText);
  const parsedRows = parseRbcStatementTable(extractedText);
  logParsedRows('statements/log', statement.originalFilename, parsedRows);

  return c.json({
    success: true,
    statementId,
    originalFilename: statement.originalFilename,
    extractedCharacters: extractedText.length,
    parsedRows: parsedRows.length
  });
});

statementsRouter.post('/:id/reprocess', async (c) => {
  const statementId = Number(c.req.param('id'));
  if (Number.isNaN(statementId) || statementId <= 0) {
    return c.json({ error: 'Invalid statement id' }, 400);
  }

  const statement = await db.query.statements.findFirst({
    where: eq(schema.statements.id, statementId)
  });

  if (!statement) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  const forceReplace = c.req.query('force') === 'true';

  const [existingCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.transactions)
    .where(eq(schema.transactions.statementId, statementId));
  const existingTransactions = Number(existingCountRow?.count ?? 0);

  if (existingTransactions > 0 && !forceReplace) {
    return c.json(
      {
        error: 'Statement already has transactions. Reprocess with ?force=true to replace existing rows.',
        statementId,
        existingTransactions
      },
      409
    );
  }

  const uploadRootPath = resolveFromApiDir(env.uploadDir);
  const safeStoredFilename = path.basename(statement.filename);
  const statementFilePath = path.join(uploadRootPath, String(statement.uploadedBy), safeStoredFilename);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(statementFilePath);
  } catch {
    return c.json({ error: 'Statement file not found on disk' }, 404);
  }

  const extractedText = await extractPdfText(fileBuffer);
  const parsedRows = parseRbcStatementTable(extractedText);
  const parsedTransactions = parseBankStatementText(extractedText);
  const { periodStart, periodEnd } = getStatementPeriodFromRows(parsedRows);

  db.transaction((tx) => {
    tx.delete(schema.transactions).where(eq(schema.transactions.statementId, statementId)).run();

    tx
      .update(schema.statements)
      .set({
        periodStart,
        periodEnd,
        rawText: extractedText
      })
      .where(eq(schema.statements.id, statementId))
      .run();

    if (parsedTransactions.length > 0) {
      tx
        .insert(schema.transactions)
        .values(
          parsedTransactions.map((transaction) => ({
            statementId,
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            categoryId: null,
            confidenceScore: null,
            status: 'needs_review',
            categorizedBy: null
          }))
        )
        .run();
    }
  });

  return c.json({
    success: true,
    statementId,
    originalFilename: statement.originalFilename,
    forceReplaced: forceReplace,
    parsedRows: parsedRows.length,
    insertedTransactions: parsedTransactions.length,
    deletedTransactions: existingTransactions,
    periodStart,
    periodEnd
  });
});

statementsRouter.get('/:id/file', async (c) => {
  const statementId = Number(c.req.param('id'));
  if (Number.isNaN(statementId) || statementId <= 0) {
    return c.json({ error: 'Invalid statement id' }, 400);
  }

  const statement = await db.query.statements.findFirst({
    where: eq(schema.statements.id, statementId)
  });

  if (!statement) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  const uploadRootPath = resolveFromApiDir(env.uploadDir);
  const safeStoredFilename = path.basename(statement.filename);
  const statementFilePath = path.join(uploadRootPath, String(statement.uploadedBy), safeStoredFilename);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(statementFilePath);
  } catch {
    return c.json({ error: 'Statement file not found on disk' }, 404);
  }

  const responseBytes = Uint8Array.from(fileBuffer);

  return c.newResponse(responseBytes, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${statement.originalFilename}"`
  });
});

statementsRouter.delete('/:id', async (c) => {
  const statementId = Number(c.req.param('id'));
  if (Number.isNaN(statementId) || statementId <= 0) {
    return c.json({ error: 'Invalid statement id' }, 400);
  }

  const statement = await db.query.statements.findFirst({
    where: eq(schema.statements.id, statementId)
  });

  if (!statement) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  const deletedTransactions = await db
    .delete(schema.transactions)
    .where(eq(schema.transactions.statementId, statementId))
    .returning({ id: schema.transactions.id });

  const deletedStatements = await db
    .delete(schema.statements)
    .where(eq(schema.statements.id, statementId))
    .returning({ id: schema.statements.id });

  if (deletedStatements.length === 0) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  const uploadRootPath = resolveFromApiDir(env.uploadDir);
  const safeStoredFilename = path.basename(statement.filename);
  const statementFilePath = path.join(uploadRootPath, String(statement.uploadedBy), safeStoredFilename);

  let fileDeleted = true;
  try {
    await unlink(statementFilePath);
  } catch {
    fileDeleted = false;
  }

  return c.json({
    success: true,
    statementId,
    deletedTransactions: deletedTransactions.length,
    fileDeleted
  });
});

statementsRouter.get('/:id/transactions', async (c) => {
  const statementId = Number(c.req.param('id'));
  if (Number.isNaN(statementId) || statementId <= 0) {
    return c.json({ error: 'Invalid statement id' }, 400);
  }

  const statement = await db.query.statements.findFirst({
    where: eq(schema.statements.id, statementId)
  });

  if (!statement) {
    return c.json({ error: 'Statement not found' }, 404);
  }

  const statementTransactions = await db.query.transactions.findMany({
    where: eq(schema.transactions.statementId, statementId),
    orderBy: [desc(schema.transactions.date), desc(schema.transactions.id)]
  });

  return c.json({
    data: statementTransactions,
    meta: {
      statementId,
      count: statementTransactions.length
    }
  });
});
