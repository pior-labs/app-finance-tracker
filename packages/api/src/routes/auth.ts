import bcrypt from 'bcrypt';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import {
  clearSessionCookie,
  readSignedSessionId,
  requireAuth,
  setSessionCookie,
  toPublicUser
} from '../lib/auth.js';

interface LoginPayload {
  email?: string;
  password?: string;
}

export const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  const body = (await c.req.json().catch(() => null)) as LoginPayload | null;

  if (!body?.email || !body?.password) {
    return c.json({ error: 'Email and password are required.' }, 400);
  }

  const user = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.email, body.email.toLowerCase().trim()))
    .get();

  if (!user) {
    return c.json({ error: 'Invalid credentials.' }, 401);
  }

  const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);

  if (!isPasswordValid) {
    return c.json({ error: 'Invalid credentials.' }, 401);
  }

  await setSessionCookie(c, user.id);

  return c.json({ user: toPublicUser(user) });
});

authRoutes.post('/logout', async (c) => {
  const sessionId = await readSignedSessionId(c);
  clearSessionCookie(c, sessionId);

  return c.json({ ok: true });
});

authRoutes.get('/me', requireAuth, async (c) => {
  return c.json({ user: c.get('user') });
});
