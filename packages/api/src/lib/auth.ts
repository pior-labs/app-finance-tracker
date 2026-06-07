import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { db, schema } from '../db/index.js';
import { env } from './env.js';

export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  trustedOrigins: env.betterAuthTrustedOrigins,
  secret: env.betterAuthSecret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications
    }
  }),
  emailAndPassword: {
    enabled: true
  },
  advanced: {
    database: {
      generateId: 'serial'
    }
  },
  user: {
    modelName: 'users'
  },
  session: {
    modelName: 'sessions'
  },
  account: {
    modelName: 'accounts'
  },
  verification: {
    modelName: 'verifications'
  }
});
