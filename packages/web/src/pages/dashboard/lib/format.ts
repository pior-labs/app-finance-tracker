export { formatMoney, splitMoney } from '@finlens/shared/money';
export { formatMonthLabel, formatShortDate, getCurrentMonth, isValidMonth } from '@finlens/shared/dates';

export function formatStatementPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return 'Latest statement';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} – ${end}`;
  }
  const startLabel = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

export function prettyName(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase());
}
