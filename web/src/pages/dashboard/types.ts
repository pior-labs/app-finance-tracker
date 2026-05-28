export interface CategorySpending {
  categoryId?: number;
  category: string;
  transactionCount?: number;
  totalCents: number;
}

export interface MerchantSpending {
  merchant: string;
  totalCents: number;
  transactionCount?: number;
}

export interface DashboardStatsResponse {
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
    availableMonths?: string[];
    latestStatement?: {
      periodStart: string | null;
      periodEnd: string | null;
      transactionCount: number;
      uploadedByName: string;
    };
  };
}

export interface RecentTransaction {
  id: number;
  date: string;
  merchant: string | null;
  description: string;
  amount: number;
}
