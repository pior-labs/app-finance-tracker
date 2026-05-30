export interface Category {
  id: number;
  name: string;
  color: string;
  isFavorite?: boolean;
  favoritedAt?: string | null;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: 'debit' | 'credit';
}

export interface ConfirmedItem {
  txId: number;
  merchant: string;
  category: string;
  categoryColor: string;
  amount: number;
  type: 'debit' | 'credit';
  at: number;
}

export interface UndoAction {
  txId: number;
  categoryId: number;
  transaction: Transaction;
}

export interface CategoriesResponse {
  data: Category[];
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: {
    total: number;
  };
}

export interface TransactionStatsResponse {
  data: {
    totalTransactionCount: number;
  };
}
