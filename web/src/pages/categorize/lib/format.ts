export function formatMoney(cents: number): string {
  const value = Math.abs(cents) / 100;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function splitMoney(cents: number): { whole: string; cents: string } {
  const value = Math.abs(cents) / 100;
  const [whole, cent = '00'] = value
    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split('.');
  return { whole, cents: cent };
}

export function prettyName(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase());
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function lighten(hex: string, amount = 0.75): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

export function removeFirstMatch<T>(items: T[], predicate: (item: T) => boolean): T[] {
  const index = items.findIndex(predicate);
  if (index === -1) return items;
  return [...items.slice(0, index), ...items.slice(index + 1)];
}
