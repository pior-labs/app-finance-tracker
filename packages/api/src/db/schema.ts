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
  uploadedBy: integer('uploaded_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  institution: text('institution'),
  periodStart: text('period_start'),
  periodEnd: text('period_end'),
  rawText: text('raw_text'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull()
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  keywords: text('keywords').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' })
    .default(false)
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull()
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  statementId: integer('statement_id')
    .notNull()
    .references(() => statements.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  type: text('type').$type<TransactionType>().notNull(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null'
  }),
  confidenceScore: real('confidence_score'),
  status: text('status').$type<TransactionStatus>().notNull().default('needs_review'),
  categorizedBy: text('categorized_by').$type<CategorizedBy>(),
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
  source: text('source').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull()
});
