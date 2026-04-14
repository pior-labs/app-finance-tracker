export type TransactionType = 'debit' | 'credit';
export type TransactionStatus =
  | 'auto_categorized'
  | 'needs_review'
  | 'confirmed';
export type CategorizedBy = 'ai' | 'human';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Statement {
  id: number;
  userId: number;
  filename: string;
  uploadDate: string;
  institution: string | null;
  statementPeriodStart: string | null;
  statementPeriodEnd: string | null;
  rawText: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  keywords: string;
  userDefined: boolean;
}

export interface Transaction {
  id: number;
  statementId: number;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: number | null;
  confidenceScore: number | null;
  status: TransactionStatus;
  categorizedBy: CategorizedBy;
  createdAt: string;
}
