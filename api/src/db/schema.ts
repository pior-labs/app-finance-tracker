import { relations, sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  keywords: text('keywords').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
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
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  statementId: integer('statement_id')
    .notNull()
    .references(() => statements.id),
  date: text('date').notNull(),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  confidenceScore: real('confidence_score'),
  status: text('status').notNull().default('needs_review'),
  categorizedBy: text('categorized_by'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const categoryExamples = sqliteTable('category_examples', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  transactionDescription: text('transaction_description').notNull(),
  notes: text('notes'),
  source: text('source').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const userRelations = relations(users, ({ many }) => ({
  statements: many(statements)
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
  transactions: many(transactions),
  examples: many(categoryExamples)
}));
