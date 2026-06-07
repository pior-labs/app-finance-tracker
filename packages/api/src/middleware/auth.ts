import type { MiddlewareHandler } from 'hono';
import { auth } from '../lib/auth.js';

export interface AuthVariables {
  userId: number;
  userEmail: string;
  userName: string;
}

export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  if (!c.req.path.startsWith('/api/')) {
    await next();
    return;
  }

  if (c.req.path.startsWith('/api/auth/')) {
    await next();
    return;
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const parsedId = Number(session.user.id);
  if (!Number.isFinite(parsedId)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', parsedId);
  c.set('userEmail', session.user.email);
  c.set('userName', session.user.name);

  await next();
};
