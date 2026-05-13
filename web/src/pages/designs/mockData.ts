export interface MockCategory {
  name: string;
  cents: number;
}

export interface MockMerchant {
  name: string;
  cents: number;
  count: number;
}

export interface MockUncategorized {
  id: number;
  date: string;
  merchant: string;
  amount: number;
}

export const mock = {
  month: 'May 2026',
  totalSpentCents: 428743,
  totalTransactions: 142,
  uncategorizedCount: 12,
  categorizedPct: 91,
  statement: {
    period: 'Apr 28 — May 12',
    transactionCount: 142,
    uploadedBy: 'Piotr',
  },
  byCategory: [
    { name: 'Groceries', cents: 112412 },
    { name: 'Housing', cents: 89100 },
    { name: 'Shopping', cents: 62388 },
    { name: 'Dining', cents: 61205 },
    { name: 'Transport', cents: 48740 },
    { name: 'Subscriptions', cents: 28471 },
    { name: 'Entertainment', cents: 21500 },
    { name: 'Travel', cents: 5127 },
  ] as MockCategory[],
  topMerchants: [
    { name: 'Whole Foods', cents: 41280, count: 9 },
    { name: 'Uber', cents: 18712, count: 14 },
    { name: 'Amazon', cents: 15640, count: 7 },
    { name: 'Starbucks', cents: 9420, count: 22 },
    { name: 'Netflix', cents: 1899, count: 1 },
  ] as MockMerchant[],
  recentUncategorized: [
    { id: 1, date: '05/11', merchant: 'STRIPE PAYMENT', amount: 18900 },
    { id: 2, date: '05/09', merchant: 'ATM WITHDRAW NW31', amount: 6000 },
    { id: 3, date: '05/07', merchant: 'SQ *BLUE BOTTLE', amount: 3450 },
  ] as MockUncategorized[],
};

export function money(cents: number, opts: { showCents?: boolean; symbol?: string } = {}): string {
  const { showCents = true, symbol = '$' } = opts;
  const v = Math.abs(cents) / 100;
  return `${symbol}${v.toLocaleString(undefined, {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })}`;
}
