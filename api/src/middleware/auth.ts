import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { getSession } from '../lib/session.js';

const PUBLIC_API_PATHS = new Set(['/api/auth/login', '/health']);

export interface AuthVariables {
  userId: number;
  userEmail: string;
  userName: string;
}

export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  if (PUBLIC_API_PATHS.has(c.req.path)) {
    await next();
    return;
  }

  if (!c.req.path.startsWith('/api/')) {
    await next();
    return;
  }

  const sessionToken = getCookie(c, 'finlens_session');
  const session = getSession(sessionToken);

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const user = await db.query.users.findFirst({ where: eq(schema.users.id, session.userId) });
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  c.set('userName', user.name);

  await next();
};
