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

export interface MockTxToReview {
  id: number;
  date: string;
  merchant: string;
  rawDescription: string;
  amount: number;
  type: 'debit' | 'credit';
  card: string;
  location?: string;
  suggested?: string;
}

export interface MockConfirmed {
  merchant: string;
  category: string;
  amount: number;
  when: string;
}

export const categorizeMock = {
  totalTransactions: 142,
  totalUncategorized: 12,
  alreadyCategorized: 130,
  queue: [
    {
      id: 101,
      date: 'Mon May 18',
      merchant: 'SQ *Blue Bottle',
      rawDescription: 'SQ *BLUE BOTTLE COFFEE — OAKLAND CA 94612',
      amount: 685,
      type: 'debit',
      card: 'Visa ··4421',
      location: 'Oakland, CA',
      suggested: 'Dining',
    },
    {
      id: 102,
      date: 'Sun May 17',
      merchant: 'Whole Foods Mkt',
      rawDescription: 'WHOLE FOODS MKT #10342 — BERKELEY CA',
      amount: 8412,
      type: 'debit',
      card: 'Visa ··4421',
      location: 'Berkeley, CA',
      suggested: 'Groceries',
    },
    {
      id: 103,
      date: 'Sat May 16',
      merchant: 'Stripe Payment',
      rawDescription: 'STRIPE PAYMENT — REF 8H21KK PA',
      amount: 18900,
      type: 'credit',
      card: 'Bank transfer',
      suggested: 'Income',
    },
    {
      id: 104,
      date: 'Fri May 15',
      merchant: 'Uber Trip',
      rawDescription: 'UBER *TRIP HELP.UBER.COM',
      amount: 1842,
      type: 'debit',
      card: 'Visa ··4421',
      location: 'San Francisco, CA',
      suggested: 'Transport',
    },
  ] as MockTxToReview[],
  favorites: [
    'Groceries',
    'Dining',
    'Transport',
    'Subscriptions',
    'Shopping',
    'Housing',
    'Entertainment',
    'Travel',
    'Health',
    'Income',
  ],
  allCategories: [
    'Groceries', 'Dining', 'Transport', 'Subscriptions', 'Shopping', 'Housing',
    'Entertainment', 'Travel', 'Health', 'Income', 'Utilities', 'Insurance',
    'Education', 'Gifts', 'Charity', 'Fees', 'Taxes', 'Cash', 'Transfer', 'Other',
  ],
  justConfirmed: [
    { merchant: 'Netflix', category: 'Subscriptions', amount: 1899, when: 'just now' },
    { merchant: 'Trader Joe’s', category: 'Groceries', amount: 4112, when: '12s ago' },
    { merchant: 'Lyft Ride', category: 'Transport', amount: 942, when: '30s ago' },
    { merchant: 'Spotify', category: 'Subscriptions', amount: 999, when: '1m ago' },
  ] as MockConfirmed[],
};

export function money(cents: number, opts: { showCents?: boolean; symbol?: string } = {}): string {
  const { showCents = true, symbol = '$' } = opts;
  const v = Math.abs(cents) / 100;
  return `${symbol}${v.toLocaleString(undefined, {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })}`;
}
