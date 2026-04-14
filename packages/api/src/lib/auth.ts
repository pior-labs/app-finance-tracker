import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { env } from './env.js';
import {
  createSession,
  getSession,
  invalidateSession,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  type Session
} from './session.js';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString()
  };
}

export async function readSignedSessionId(
  cookieHeaderContext: Parameters<typeof getSignedCookie>[0]
): Promise<string | null> {
  const cookieValue = await getSignedCookie(
    cookieHeaderContext,
    env.SESSION_SECRET,
    SESSION_COOKIE_NAME
  );

  if (!cookieValue) {
    return null;
  }

  return cookieValue;
}

export async function setSessionCookie(
  cookieHeaderContext: Parameters<typeof setSignedCookie>[0],
  userId: number
): Promise<Session> {
  const session = createSession(userId);

  await setSignedCookie(
    cookieHeaderContext,
    SESSION_COOKIE_NAME,
    session.id,
    env.SESSION_SECRET,
    {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS
    }
  );

  return session;
}

export function clearSessionCookie(
  cookieHeaderContext: Parameters<typeof deleteCookie>[0],
  sessionId: string | null
) {
  if (sessionId) {
    invalidateSession(sessionId);
  }

  deleteCookie(cookieHeaderContext, SESSION_COOKIE_NAME, {
    path: '/'
  });
}

export const requireAuth = createMiddleware(async (c, next) => {
  const signedSessionId = await readSignedSessionId(c);

  if (!signedSessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = getSession(signedSessionId);

  if (!session) {
    clearSessionCookie(c, signedSessionId);
    return c.json({ error: 'Session expired' }, 401);
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
    .where(eq(users.id, session.userId))
    .get();

  if (!user) {
    clearSessionCookie(c, signedSessionId);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('session', session);
  c.set('user', toPublicUser(user));

  await next();
});
