export type TransactionType = 'debit' | 'credit';
export type TransactionStatus = 'needs_review' | 'confirmed';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  keywords: string;
  color: string;
  isDefault: boolean;
  isFavorite: boolean;
  favoritedAt: string | null;
  createdAt: string;
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
  categoryName: string | null;
  status: TransactionStatus;
  createdAt: string;
}

export interface TransactionListItem extends Transaction {
  statement: {
    id: number;
    originalFilename: string;
    uploadedBy: number;
    uploadedByUser: UserSummary;
  };
}

export interface Statement {
  id: number;
  uploadedBy: number;
  filename: string;
  originalFilename: string;
  institution: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
}

export interface StatementListItem extends Statement {
  uploadedByUser: UserSummary;
  transactionCount: number;
}

export interface CategorySpending {
  categoryId: number;
  category: string;
  transactionCount: number;
  totalCents: number;
}

export interface MerchantSpending {
  merchant: string;
  transactionCount: number;
  totalCents: number;
}

export interface LatestStatementSummary {
  periodStart: string | null;
  periodEnd: string | null;
  transactionCount: number;
  uploadedByName: string;
}

export interface CategoriesResponse {
  data: Category[];
  meta: { count: number };
}

export interface TransactionsResponse {
  data: TransactionListItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  filters: {
    month: string | null;
    category: string | null;
    status: string | null;
    merchant: string | null;
  };
}

export interface TransactionStatsResponse {
  data: {
    totalSpentCents: number;
    uncategorizedCount: number;
    monthTransactionCount: number;
    totalTransactionCount: number;
    byCategory: CategorySpending[];
    topMerchants: MerchantSpending[];
  };
  meta: {
    month: string;
    availableMonths: string[];
    latestStatement?: LatestStatementSummary;
  };
}

export interface StatementsResponse {
  data: StatementListItem[];
  meta: { count: number };
}
