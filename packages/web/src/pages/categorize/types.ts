import type {
  CategoriesResponse,
  Category,
  TransactionListItem as SharedTransactionListItem,
  TransactionType
} from '@finlens/shared/types';

export type { Category };

export type Transaction = Pick<
  SharedTransactionListItem,
  'id' | 'date' | 'description' | 'merchant' | 'amount' | 'type' | 'statement'
>;

export interface ConfirmedItem {
  txId: number;
  merchant: string;
  category: string;
  categoryColor: string;
  amount: number;
  type: TransactionType;
  at: number;
}

export interface UndoAction {
  txId: number;
  categoryId: number;
  transaction: Transaction;
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: {
    total: number;
  };
}

export type { CategoriesResponse };

export type TransactionStatsResponse = Pick<import('@finlens/shared/types').TransactionStatsResponse, 'data'>;
