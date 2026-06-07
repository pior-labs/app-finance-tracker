import type {
  CategoriesResponse,
  Category,
  Transaction,
  TransactionListItem,
  TransactionStatsResponse,
  TransactionStatus
} from '@finlens/shared/types';

export type { Category, TransactionListItem, TransactionStatus };

export type CategoryResponse = CategoriesResponse;

export interface SelectOption {
  value: string;
  label: string;
}

export type { TransactionsResponse } from '@finlens/shared/types';

export type TransactionUpdatePayload = Transaction;

export type StatsResponse = Pick<TransactionStatsResponse, 'meta'>;

export interface TransactionFilters {
  month: string;
  category: string;
  status: string;
  merchant: string;
  offset: number;
}
