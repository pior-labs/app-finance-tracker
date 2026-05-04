export type TransactionType = 'debit' | 'credit';
export type TransactionStatus = 'needs_review' | 'confirmed';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  keywords: string;
  isDefault: boolean;
  createdAt: number;
}

export interface Statement {
  id: number;
  uploadedBy: number;
  filename: string;
  originalFilename: string;
  institution: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  rawText: string | null;
  createdAt: number;
}

export interface Transaction {
  id: number;
  statementId: number;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: TransactionType;
  categoryId: number | null;
  status: TransactionStatus;
  createdAt: number;
}
