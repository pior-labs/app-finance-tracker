import { randomUUID } from 'node:crypto';

export interface Session {
  id: string;
  userId: number;
  expiresAt: number;
}

export const SESSION_COOKIE_NAME = 'finlens_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
export const SESSION_COOKIE_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

const sessions = new Map<string, Session>();

export function createSession(userId: number): Session {
  const session: Session = {
    id: randomUUID(),
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS
  };

  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export function invalidateSession(sessionId: string) {
  sessions.delete(sessionId);
}
