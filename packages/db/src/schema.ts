import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date());

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const sessions = pgTable(
  'sessions',
  {
    id: serial('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)]
);

export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index('accounts_user_id_idx').on(table.userId)]
);

export const verifications = pgTable(
  'verifications',
  {
    id: serial('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index('verifications_identifier_idx').on(table.identifier)]
);

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  keywords: text('keywords').notNull().default(''),
  color: text('color').notNull().default('#6b8db5'),
  isDefault: boolean('is_default').notNull().default(true),
  isFavorite: boolean('is_favorite').notNull().default(false),
  favoritedAt: timestamp('favorited_at', { withTimezone: true }),
  createdAt: createdAt()
});

export const statements = pgTable(
  'statements',
  {
    id: serial('id').primaryKey(),
    uploadedBy: integer('uploaded_by')
      .notNull()
      .references(() => users.id),
    filename: text('filename').notNull(),
    originalFilename: text('original_filename').notNull(),
    institution: text('institution'),
    periodStart: text('period_start'),
    periodEnd: text('period_end'),
    rawText: text('raw_text'),
    createdAt: createdAt()
  },
  (table) => [index('statements_created_at_idx').on(table.createdAt)]
);

export const transactions = pgTable(
  'transactions',
  {
    id: serial('id').primaryKey(),
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
    createdAt: createdAt()
  },
  (table) => [
    index('transactions_status_date_id_idx').on(table.status, table.date, table.id),
    index('transactions_date_id_idx').on(table.date, table.id),
    index('transactions_date_merchant_idx').on(table.date, table.merchant),
    index('transactions_statement_id_idx').on(table.statementId),
    index('transactions_category_id_idx').on(table.categoryId)
  ]
);

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
