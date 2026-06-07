import type { Transaction } from '@finlens/shared/types';

export type {
  CategorySpending,
  MerchantSpending,
  TransactionStatsResponse as DashboardStatsResponse
} from '@finlens/shared/types';

export type RecentTransaction = Pick<Transaction, 'id' | 'date' | 'merchant' | 'description' | 'amount'>;
