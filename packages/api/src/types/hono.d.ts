import type { PublicUser } from '../lib/auth.js';
import type { Session } from '../lib/session.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: PublicUser;
    session: Session;
  }
}
