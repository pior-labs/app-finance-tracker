export interface MockCategory {
  name: string;
  amount: number;
  count: number;
  share: number;
}

export interface MockTxn {
  merchant: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
}

const rawCategories = [
  { name: 'Travel', amount: 1062.0, count: 8 },
  { name: 'Groceries', amount: 812.45, count: 24 },
  { name: 'Restaurants', amount: 543.2, count: 18 },
  { name: 'Shopping', amount: 478.1, count: 12 },
  { name: 'Transport', amount: 389.55, count: 22 },
  { name: 'Utilities', amount: 284.0, count: 5 },
  { name: 'Subscriptions', amount: 187.0, count: 9 },
  { name: 'Health', amount: 131.99, count: 4 }
];

const total = rawCategories.reduce((s, c) => s + c.amount, 0);

export const MOCK = {
  month: 'April 2026',
  spent: 4287.32,
  prevSpent: 3941.5,
  income: 8400,
  saved: 4112.68,
  transactions: 142,
  needsReview: 7,
  household: ['Piotr', 'Andrea'],
  categories: rawCategories.map((c) => ({ ...c, share: c.amount / total })) as MockCategory[],
  recent: [
    { merchant: 'Air Canada', category: 'Travel', amount: -642.18, date: 'Apr 28', note: 'YUL → LIS' },
    { merchant: 'Whole Foods Market', category: 'Groceries', amount: -184.32, date: 'Apr 27' },
    { merchant: 'Shell', category: 'Transport', amount: -68.4, date: 'Apr 26' },
    { merchant: 'Cinéma Imperial', category: 'Restaurants', amount: -52.1, date: 'Apr 25' },
    { merchant: 'Netflix', category: 'Subscriptions', amount: -19.99, date: 'Apr 24' },
    { merchant: 'Costco Wholesale', category: 'Groceries', amount: -298.74, date: 'Apr 23' },
    { merchant: 'Uber', category: 'Transport', amount: -22.15, date: 'Apr 22' },
    { merchant: 'Apple Store', category: 'Shopping', amount: -129.0, date: 'Apr 21' },
    { merchant: 'Hydro-Québec', category: 'Utilities', amount: -184.5, date: 'Apr 20' }
  ] as MockTxn[],
  series: [
    120, 95, 180, 60, 220, 175, 40, 95, 310, 80, 120, 65, 95, 410, 130, 220, 78, 65, 90, 250, 110,
    180, 95, 30, 130, 175, 80, 220, 95, 150
  ]
};

export function fmt(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function fmtShort(n: number): string {
  return Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
