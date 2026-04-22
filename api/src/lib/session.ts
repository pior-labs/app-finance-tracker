import crypto from 'node:crypto';

interface SessionData {
  userId: number;
  createdAt: number;
}

const sessions = new Map<string, SessionData>();

export function createSession(userId: number): string {
  const token = crypto.randomUUID();
  sessions.set(token, { userId, createdAt: Date.now() });
  return token;
}

export function getSession(token: string | undefined): SessionData | null {
  if (!token) {
    return null;
  }

  return sessions.get(token) ?? null;
}

export function destroySession(token: string | undefined): void {
  if (!token) {
    return;
  }

  sessions.delete(token);
}
