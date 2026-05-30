export interface StatementListItem {
  id: number;
  uploadedBy: number;
  filename: string;
  originalFilename: string;
  institution: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
  uploadedByUser: {
    id: number;
    name: string;
    email: string;
  };
  transactionCount: number;
  status?: 'imported' | 'failed';
}

export interface StatementsResponse {
  data: StatementListItem[];
}

export interface StatementTransactionsResponse {
  data: Array<{
    id: number;
    date: string;
  }>;
}

export interface ReparseStatementResponse {
  meta?: {
    insertedTransactions?: number;
  };
}
