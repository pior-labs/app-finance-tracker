import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requireAuth } from './lib/auth.js';
import { authRoutes } from './routes/auth.js';
import { categoriesRoutes } from './routes/categories.js';
import { statementsRoutes } from './routes/statements.js';
import { transactionsRoutes } from './routes/transactions.js';
import { bootstrapApp } from './lib/bootstrap.js';
import { env } from './lib/env.js';

await bootstrapApp();

const app = new Hono();

app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      if (!origin) {
        return env.CORS_ORIGINS[0] ?? '';
      }

      return env.CORS_ORIGINS.includes(origin) ? origin : '';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

app.use('/api/*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    await next();
    return;
  }

  if (c.req.path === '/api/auth/login') {
    await next();
    return;
  }

  await requireAuth(c, next);
});

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/api/auth', authRoutes);
app.route('/api/categories', categoriesRoutes);
app.route('/api/transactions', transactionsRoutes);
app.route('/api/statements', statementsRoutes);

app.get('/api', (c) =>
  c.json({
    name: 'FinLens API',
    phase: 'phase-1-skeleton'
  })
);

serve(
  {
    fetch: app.fetch,
    port: env.PORT
  },
  (info) => {
    console.log(`FinLens API running on http://localhost:${info.port}`);
  }
);
