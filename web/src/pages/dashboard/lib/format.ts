export function formatMoney(cents: number, { showCents = true }: { showCents?: boolean } = {}): string {
  const value = Math.abs(cents) / 100;
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })}`;
}

export function splitMoney(cents: number): { whole: string; cents: string } {
  const value = Math.abs(cents) / 100;
  const [whole, cent = '00'] = value
    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split('.');
  return { whole, cents: cent };
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function isValidMonth(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}$/.test(value);
}

export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-');
  const parsed = new Date(Number(year), Number(monthNumber) - 1, 1);
  if (Number.isNaN(parsed.getTime())) return month;
  return parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

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
