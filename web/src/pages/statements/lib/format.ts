import type { StatementListItem } from '../types';

export function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export function formatPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return '-';
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function getStatementStatus(statement: StatementListItem): 'imported' | 'failed' {
  return statement.status === 'failed' || statement.transactionCount === 0 ? 'failed' : 'imported';
}

export function getStatementUserLabel(statement: StatementListItem): string {
  return statement.uploadedByUser?.name ?? `User ${statement.uploadedBy}`;
}

export function getStatementUserInitial(statement: StatementListItem): string {
  return statement.uploadedByUser?.name?.[0]?.toUpperCase() ?? '?';
}

export function getTransactionUnit(count: number): string {
  return count === 1 ? 'tx' : 'txs';
}

export function sortStatementsByCreatedAt(statements: StatementListItem[]): StatementListItem[] {
  return [...statements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
