import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const nowMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(nowMs).$onUpdate(() => new Date())
});

export const sessions = sqliteTable(
  'sessions',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$onUpdate(() => new Date()),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)]
);

export const accounts = sqliteTable(
  'accounts',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$onUpdate(() => new Date())
  },
  (table) => [index('accounts_user_id_idx').on(table.userId)]
);

export const verifications = sqliteTable(
  'verifications',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(nowMs).$onUpdate(() => new Date())
  },
  (table) => [index('verifications_identifier_idx').on(table.identifier)]
);

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  keywords: text('keywords').notNull().default(''),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(true),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs)
});

export const statements = sqliteTable('statements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uploadedBy: integer('uploaded_by')
    .notNull()
    .references(() => users.id),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  institution: text('institution'),
  periodStart: text('period_start'),
  periodEnd: text('period_end'),
  rawText: text('raw_text'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs)
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  statementId: integer('statement_id')
    .notNull()
    .references(() => statements.id),
  date: text('date').notNull(),
  description: text('description').notNull(),
  merchant: text('merchant'),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  status: text('status').notNull().default('needs_review'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs)
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  statements: many(statements)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));

export const statementRelations = relations(statements, ({ one, many }) => ({
  uploadedByUser: one(users, {
    fields: [statements.uploadedBy],
    references: [users.id]
  }),
  transactions: many(transactions)
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  statement: one(statements, {
    fields: [transactions.statementId],
    references: [statements.id]
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id]
  })
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions)
}));
