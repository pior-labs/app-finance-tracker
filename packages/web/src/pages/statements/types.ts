import type { StatementListItem as SharedStatementListItem, Transaction } from '@finlens/shared/types';

export interface StatementListItem extends SharedStatementListItem {
  status?: 'imported' | 'failed';
}

export type StatementsResponse = Omit<import('@finlens/shared/types').StatementsResponse, 'data'> & {
  data: StatementListItem[];
};

export interface StatementTransactionsResponse {
  data: Array<Pick<Transaction, 'id' | 'date'>>;
}

export interface ReparseStatementResponse {
  meta?: {
    insertedTransactions?: number;
  };
}
