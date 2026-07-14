import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { genericOAuth } from 'better-auth/plugins';
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
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: env.centralAuth.providerId,
          discoveryUrl: env.centralAuth.discoveryUrl,
          issuer: env.centralAuth.issuer,
          requireIssuerValidation: true,
          clientId: env.centralAuth.clientId,
          clientSecret: env.centralAuth.clientSecret,
          scopes: ['openid', 'profile', 'email', 'offline_access'],
          pkce: true,
          accessType: 'offline',
          mapProfileToUser: (profile) => ({
            name: profile.name,
            email: profile.email,
            emailVerified: Boolean(profile.email_verified)
          })
        }
      ]
    })
  ],
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
    modelName: 'accounts',
    accountLinking: {
      enabled: true,
      // Central Auth is the trusted identity authority for Pior Labs. Matching
      // verified emails should attach SSO to the existing Finance user so its
      // historical data remains associated with the same local user id.
      trustedProviders: [env.centralAuth.providerId]
    }
  },
  verification: {
    modelName: 'verifications'
  }
});
