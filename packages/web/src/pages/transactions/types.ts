export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface CategoryResponse {
  data: Category[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface TransactionListItem {
  id: number;
  statementId: number;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: 'debit' | 'credit';
  categoryId: number | null;
  categoryName: string | null;
  status: 'needs_review' | 'confirmed';
}

export interface TransactionsResponse {
  data: TransactionListItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface TransactionUpdatePayload extends TransactionListItem {
  createdAt: string;
}

export interface StatsResponse {
  meta: {
    month: string;
    availableMonths: string[];
  };
}

export type TransactionStatus = TransactionListItem['status'];

export interface TransactionFilters {
  month: string;
  category: string;
  status: string;
  merchant: string;
  offset: number;
}
