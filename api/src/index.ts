import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { authMiddleware, type AuthVariables } from './middleware/auth.js';
import { env, ensureDir, resolveFromApiDir } from './lib/env.js';
import { authRouter } from './routes/auth.js';
import { categoriesRouter } from './routes/categories.js';
import { statementsRouter } from './routes/statements.js';
import { transactionsRouter } from './routes/transactions.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', logger());
app.use('/api/*', authMiddleware);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/api/auth', authRouter);
app.route('/api/statements', statementsRouter);
app.route('/api/transactions', transactionsRouter);
app.route('/api/categories', categoriesRouter);

app.notFound((c) => c.json({ error: 'Route not found' }, 404));

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: 'Internal server error' }, 500);
});

const uploadDirPath = resolveFromApiDir(env.uploadDir);
ensureDir(uploadDirPath);

serve(
  {
    fetch: app.fetch,
    port: env.apiPort
  },
  (info) => {
    console.log(`FinLens API listening on http://localhost:${info.port}`);
  }
);
