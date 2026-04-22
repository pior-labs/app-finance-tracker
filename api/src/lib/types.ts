export type TransactionType = 'debit' | 'credit';
export type TransactionStatus = 'needs_review' | 'auto_categorized' | 'confirmed';
export type CategorizedBy = 'human' | 'ai';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  keywords: string;
  isDefault: boolean;
  createdAt: string;
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
  createdAt: string;
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
  categorizedBy: CategorizedBy | null;
  createdAt: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}
