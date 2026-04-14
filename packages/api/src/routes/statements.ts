import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { statements } from '../db/schema.js';
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
  const user = c.get('user');

  const rows = db
    .select({
      id: statements.id,
      userId: statements.userId,
      filename: statements.filename,
      uploadDate: statements.uploadDate,
      institution: statements.institution,
      statementPeriodStart: statements.statementPeriodStart,
      statementPeriodEnd: statements.statementPeriodEnd,
      rawText: statements.rawText
    })
    .from(statements)
    .where(eq(statements.userId, user.id))
    .orderBy(desc(statements.uploadDate))
    .all()
    .map((row) => ({
      ...row,
      uploadDate: row.uploadDate.toISOString()
    }));

  return c.json({ statements: rows });
});

statementsRoutes.post('/upload', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.parseBody();
  const file = asUploadFile((body.statement as string | File | undefined) ?? undefined);

  if (!file) {
    return c.json({ error: 'No PDF file found in field "statement".' }, 400);
  }

  const isPdfFile =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfFile) {
    return c.json({ error: 'Only PDF uploads are supported.' }, 400);
  }

  const safeFilename = sanitizeFilename(file.name);
  const storedFilename = `${Date.now()}-${randomUUID()}-${safeFilename}`;
  const destinationPath = path.join(uploadsDir, storedFilename);

  const content = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(destinationPath, content);

  const insertResult = db
    .insert(statements)
    .values({
      userId: user.id,
      filename: storedFilename,
      rawText: null,
      institution: null,
      statementPeriodStart: null,
      statementPeriodEnd: null
    })
    .run();

  return c.json(
    {
      statement: {
        id: Number(insertResult.lastInsertRowid),
        filename: storedFilename,
        uploadDate: new Date().toISOString()
      }
    },
    201
  );
});
