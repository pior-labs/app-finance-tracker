import bcrypt from 'bcrypt';
import { Hono } from 'hono';
import { deleteCookie, setCookie, getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { createSession, destroySession } from '../lib/session.js';
import type { AuthVariables } from '../middleware/auth.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const authRouter = new Hono<{ Variables: AuthVariables }>();

authRouter.post('/login', async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: 'Invalid request payload', details: parsed.error.flatten() }, 400);
  }

  const user = await db.query.users.findFirst({ where: eq(schema.users.email, parsed.data.email) });

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const sessionToken = createSession(user.id);

  setCookie(c, 'finlens_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  });

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

authRouter.post('/logout', (c) => {
  const sessionToken = getCookie(c, 'finlens_session');
  destroySession(sessionToken);
  deleteCookie(c, 'finlens_session', { path: '/' });

  return c.json({ success: true });
});

authRouter.get('/me', (c) => {
  const userId = c.get('userId');
  const userEmail = c.get('userEmail');
  const userName = c.get('userName');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({
    user: {
      id: userId,
      email: userEmail,
      name: userName
    }
  });
});
