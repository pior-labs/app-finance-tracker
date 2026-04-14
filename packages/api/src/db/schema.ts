import type {
  CategorizedBy,
  TransactionStatus,
  TransactionType
} from '@finlens/shared';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull()
});

export const statements = sqliteTable('statements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  uploadDate: integer('upload_date', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
  institution: text('institution'),
  statementPeriodStart: text('statement_period_start'),
  statementPeriodEnd: text('statement_period_end'),
  rawText: text('raw_text')
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  keywords: text('keywords').notNull(),
  userDefined: integer('user_defined', { mode: 'boolean' })
    .default(false)
    .notNull()
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  statementId: integer('statement_id')
    .notNull()
    .references(() => statements.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  type: text('type').$type<TransactionType>().notNull(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null'
  }),
  confidenceScore: real('confidence_score'),
  status: text('status').$type<TransactionStatus>().notNull().default('needs_review'),
  categorizedBy: text('categorized_by')
    .$type<CategorizedBy>()
    .notNull()
    .default('human'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull()
});

export const categoryExamples = sqliteTable('category_examples', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  transactionDescription: text('transaction_description').notNull(),
  notes: text('notes'),
  source: text('source').notNull()
});
