import { PAGE_SIZE } from './constants';
import { formatMonthLabel } from '@finlens/shared/dates';
import { formatMoney } from '@finlens/shared/money';
import type { Category, SelectOption } from '../types';

export { formatShortDate, getCurrentMonth, isValidMonth } from '@finlens/shared/dates';
export { formatMonthLabel };

export function formatAmount(cents: number): string {
  return formatMoney(cents, { signed: true });
}

export function prettyName(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase());
}

export function buildTransactionQuery({
  month,
  category,
  status,
  merchant,
  offset,
}: {
  month: string;
  category: string;
  status: string;
  merchant: string;
  offset: number;
}): string {
  const params = new URLSearchParams();
  params.set('limit', String(PAGE_SIZE));
  params.set('offset', String(offset));
  if (month !== 'all') params.set('month', month);
  if (category !== 'all') params.set('category', category);
  if (status !== 'all') params.set('status', status);
  if (merchant.trim()) params.set('merchant', merchant.trim());
  return `/api/transactions?${params.toString()}`;
}

export function buildCategoryFilterOptions(categories: Category[]): SelectOption[] {
  return [
    { value: 'all', label: 'All categories' },
    { value: 'uncategorized', label: 'Uncategorized' },
    ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
  ];
}

export function buildRowCategoryOptions(categories: Category[]): SelectOption[] {
  return [
    { value: 'uncategorized', label: 'Uncategorized' },
    ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
  ];
}

export function buildMonthOptions(availableMonths: string[]): SelectOption[] {
  const options = Array.from(new Set(availableMonths))
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: formatMonthLabel(value) }));
  return [{ value: 'all', label: 'All transactions' }, ...options];
}

export function buildCategoryColorMap(categories: Category[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const cat of categories) map.set(cat.id, cat.color);
  return map;
}

export function getErrorMessage(...errors: unknown[]): string | null {
  for (const error of errors) {
    if (error instanceof Error && error.name === 'AbortError') continue;
    if (error instanceof Error) return error.message;
  }
  return null;
}
