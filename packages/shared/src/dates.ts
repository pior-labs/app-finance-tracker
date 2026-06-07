export interface MonthBounds {
  start: string;
  endExclusive: string;
}

export function getCurrentMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function isValidMonth(value: string | null): value is string {
  if (value === null) {
    return false;
  }

  return computeMonthBounds(value) !== null;
}

export function computeMonthBounds(month: string): MonthBounds | null {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]);
  if (monthIndex < 1 || monthIndex > 12) {
    return null;
  }

  const start = `${String(year).padStart(4, '0')}-${String(monthIndex).padStart(2, '0')}-01`;
  const nextMonthYear = monthIndex === 12 ? year + 1 : year;
  const nextMonth = monthIndex === 12 ? 1 : monthIndex + 1;
  const endExclusive = `${String(nextMonthYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}-01`;

  return { start, endExclusive };
}

export function formatMonthLabel(month: string, locale?: string): string {
  const bounds = computeMonthBounds(month);
  if (!bounds) {
    return month;
  }

  const [year, monthNumber] = month.split('-');
  return new Date(Number(year), Number(monthNumber) - 1, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric'
  });
}

export function formatShortDate(date: string, locale?: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}
