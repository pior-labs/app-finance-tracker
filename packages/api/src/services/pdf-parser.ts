import { PDFParse } from 'pdf-parse';
import type { FinancialInstitution, StatementAccountType, TransactionType } from '@finlens/shared';

export interface ParsedTransaction {
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: TransactionType;
}

export interface ParsedBankStatement {
  institution: FinancialInstitution | null;
  accountType: StatementAccountType;
  transactions: ParsedTransaction[];
}

export class StatementParseError extends Error {}

export interface ParsedStatementRow {
  transactionDate: string;
  postingDate: string;
  activity: string;
  description: string;
  amount: number;
}

const MONTH_INDEX_BY_ABBREV: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12
};

const LEGACY_TABLE_HEADER = 'TRANSACTION POSTING ACTIVITY DESCRIPTION AMOUNT ($)';
const CURRENT_TABLE_HEADER = 'DATE ACTIVITY DESCRIPTION AMOUNT ($)';
const ROW_START_REGEX =
  /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2})\s+(.+)$/;
const CIBC_ROW_START_REGEX = new RegExp(ROW_START_REGEX.source, 'i');
const AMOUNT_REGEX = /^-?\$\d{1,3}(?:,\d{3})*\.\d{2}$/;
const PAGE_BREAK_REGEX = /^--\s+\d+\s+of\s+\d+\s+--$/;
const REFERENCE_NUMBER_REGEX = /^\d{16,25}$/;

const MERCHANT_PREFIXES = [
  'POS PURCHASE -',
  'INTERAC PURCHASE -',
  'PRE-AUTHORIZED -',
  'PRE AUTHORIZED -',
  'DEBIT PURCHASE -',
  'PURCHASE -',
  'PAYMENT TO -',
  'E-TRANSFER TO -',
  'E-TRANSFER FROM -'
];

const MERCHANT_STOP_WORDS = new Set([
  'TORONTO',
  'ONTARIO',
  'ON',
  'CANADA',
  'QC',
  'QUEBEC',
  'AB',
  'ALBERTA',
  'BC',
  'VANCOUVER',
  'CALGARY',
  'MONTREAL'
]);

const MERCHANT_SUFFIX_STOP_WORDS = new Set([
  'ENG',
  'EN',
  'ENGLISH',
  'ONLINE',
  'WEB',
  'ECOM',
  'ECOMMERCE',
  'WWW',
  'CA',
  'CAN',
  'US',
  'USA',
  'UK',
  'GB',
  'GBR'
]);

function isStandaloneNumericToken(value: string): boolean {
  return /^\d+$/.test(value);
}

function normalizeMerchantToken(value: string): string {
  return value.replace(/^[^A-Za-z0-9&]+|[^A-Za-z0-9.&'-]+$/g, '');
}

function isLikelyDescriptorId(value: string): boolean {
  const compact = value.replace(/[^A-Za-z0-9]/g, '');

  if (compact.length < 6) {
    return false;
  }

  return /[A-Za-z]/.test(compact) && /\d/.test(compact);
}

function extractDomainBase(value: string): string | null {
  const match = value.match(/^([A-Za-z0-9-]+)\.(?:[A-Za-z0-9-]+\.)*(?:com|ca|net|org|io|co|app|ai)$/i);
  if (!match) {
    return null;
  }

  return match[1] ?? null;
}

type StatementPeriod = {
  startMonth: number;
  endMonth: number;
  startYear: number;
  endYear: number;
};

type PendingRow = {
  transactionMonth: string;
  transactionDay: number;
  postingMonth: string;
  postingDay: number;
  details: string[];
};

function parseStatementPeriod(rawText: string): StatementPeriod | null {
  const periodMatch = rawText.match(
    /STATEMENT FROM\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2})(?:,\s*(\d{4}))?\s+TO\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2}),\s*(\d{4})/
  );

  if (!periodMatch) {
    return null;
  }

  const [, startMonthAbbrev, , startYearRaw, endMonthAbbrev, , endYearRaw] = periodMatch;
  const startMonth = MONTH_INDEX_BY_ABBREV[startMonthAbbrev];
  const endMonth = MONTH_INDEX_BY_ABBREV[endMonthAbbrev];
  const endYear = Number(endYearRaw);
  const startYear = startYearRaw ? Number(startYearRaw) : startMonth > endMonth ? endYear - 1 : endYear;

  return { startMonth, endMonth, startYear, endYear };
}

function inferYearForMonth(month: number, period: StatementPeriod | null): number {
  if (!period) {
    return new Date().getUTCFullYear();
  }

  const crossesYearBoundary = period.startMonth > period.endMonth;
  if (!crossesYearBoundary) {
    return period.endYear;
  }

  return month >= period.startMonth ? period.startYear : period.endYear;
}

function toIsoDate(monthAbbrev: string, day: number, period: StatementPeriod | null): string {
  const month = MONTH_INDEX_BY_ABBREV[monthAbbrev];
  const year = inferYearForMonth(month, period);

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseAmountCents(amountRaw: string): number {
  const negative = amountRaw.startsWith('-');
  const normalized = amountRaw.replace(/[$,-]/g, '');
  const [wholePart, decimalPart] = normalized.split('.');
  const cents = Number(wholePart) * 100 + Number(decimalPart);
  return negative ? -cents : cents;
}

function shouldIgnoreDetailLine(line: string): boolean {
  if (!line || PAGE_BREAK_REGEX.test(line)) {
    return true;
  }

  const normalized = line.replace(/\s+/g, ' ').trim();

  if (
    normalized === LEGACY_TABLE_HEADER ||
    normalized === CURRENT_TABLE_HEADER ||
    normalized === 'TRANSACTION' ||
    normalized === 'POSTING' ||
    normalized === 'DATE' ||
    normalized === 'DATE DATE'
  ) {
    return true;
  }

  if (
    normalized.includes('RBC') ||
    normalized.includes('STATEMENT FROM ') ||
    /\d+\s+OF\s+\d+/.test(normalized) ||
    normalized.includes('(continued)')
  ) {
    return true;
  }

  return false;
}

function normalizeTextLines(rawText: string): string[] {
  return rawText.split(/\r?\n/).map((line) => line.trim());
}

export function extractMerchantName(rawDescription: string): string | null {
  let value = rawDescription.replace(/\s+/g, ' ').trim();

  if (!value) {
    return null;
  }

  for (const prefix of MERCHANT_PREFIXES) {
    if (value.toUpperCase().startsWith(prefix)) {
      value = value.slice(prefix.length).trim();
      break;
    }
  }

  const cleaned = value
    .replace(/\b#\d+\b/g, ' ')
    .replace(/\b\d{3,}\b/g, ' ')
    .replace(/[*/|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return null;
  }

  const words = cleaned.split(' ');
  const merchantWords: string[] = [];

  for (const rawWord of words) {
    const word = normalizeMerchantToken(rawWord);

    if (!word) {
      continue;
    }

    if (MERCHANT_STOP_WORDS.has(word.toUpperCase()) && merchantWords.length > 0) {
      break;
    }

    if (isStandaloneNumericToken(word)) {
      continue;
    }

    if (MERCHANT_SUFFIX_STOP_WORDS.has(word.toUpperCase()) && merchantWords.length > 0) {
      break;
    }

    if (isLikelyDescriptorId(word)) {
      continue;
    }

    const domainBase = extractDomainBase(word);
    if (domainBase) {
      if (merchantWords.length === 0 && domainBase.length >= 2) {
        merchantWords.push(domainBase);
      }

      break;
    }

    merchantWords.push(word);

    if (merchantWords.length >= 5) {
      break;
    }
  }

  const merchant = merchantWords.join(' ').trim();

  if (!merchant || merchant.length < 2) {
    return null;
  }

  return merchant
    .toLowerCase()
    .split(' ')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function parseRbcStatementTable(rawText: string): ParsedStatementRow[] {
  const lines = normalizeTextLines(rawText);
  const period = parseStatementPeriod(rawText);

  const rows: ParsedStatementRow[] = [];
  let inTable = false;
  let pending: PendingRow | null = null;

  for (const line of lines) {
    const compact = line.replace(/\s+/g, ' ').trim();

    if (!compact) {
      continue;
    }

    if (compact === LEGACY_TABLE_HEADER || compact === CURRENT_TABLE_HEADER) {
      inTable = true;
      continue;
    }

    if (!inTable) {
      continue;
    }

    if (compact.startsWith('TOTAL ACCOUNT BALANCE')) {
      inTable = false;
      pending = null;
      continue;
    }

    if (shouldIgnoreDetailLine(compact)) {
      continue;
    }

    const rowStart = compact.match(ROW_START_REGEX);
    if (rowStart) {
      pending = {
        transactionMonth: rowStart[1],
        transactionDay: Number(rowStart[2]),
        postingMonth: rowStart[3],
        postingDay: Number(rowStart[4]),
        details: [rowStart[5]]
      };
      continue;
    }

    if (!pending) {
      continue;
    }

    if (AMOUNT_REGEX.test(compact)) {
      const activity = pending.details[0] ?? '';
      const description = pending.details
        .slice(1)
        .filter((detailLine) => !REFERENCE_NUMBER_REGEX.test(detailLine.replace(/\s+/g, '')))
        .join(' ');

      rows.push({
        transactionDate: toIsoDate(pending.transactionMonth, pending.transactionDay, period),
        postingDate: toIsoDate(pending.postingMonth, pending.postingDay, period),
        activity,
        description,
        amount: parseAmountCents(compact)
      });

      pending = null;
      continue;
    }

    pending.details.push(compact);
  }

  return rows;
}

export async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const parsed = await parser.getText();
    return parsed.text.trim();
  } finally {
    await parser.destroy();
  }
}

function parseCibcTransactions(rawText: string): ParsedTransaction[] {
  const periodMatch = rawText.match(/Transactions from\s+([A-Za-z]+)\s+\d{1,2}(?:,\s*(\d{4}))?\s+to\s+([A-Za-z]+)\s+\d{1,2},\s*(\d{4})/i);
  if (!periodMatch) throw new StatementParseError('CIBC statement period could not be read.');
  const startMonth = MONTH_INDEX_BY_ABBREV[periodMatch[1].slice(0, 3).toUpperCase()];
  const endMonth = MONTH_INDEX_BY_ABBREV[periodMatch[3].slice(0, 3).toUpperCase()];
  if (!startMonth || !endMonth) throw new StatementParseError('CIBC statement period contains an invalid month.');
  const endYear = Number(periodMatch[4]);
  const period: StatementPeriod = {
    startMonth,
    endMonth,
    endYear,
    startYear: Number(periodMatch[2]) || (startMonth > endMonth ? endYear - 1 : endYear)
  };
  const transactions: ParsedTransaction[] = [];
  let section: 'payments' | 'charges' | null = null;
  let pending: { date: string; details: string } | null = null;
  const requireCompleteRow = () => {
    if (pending) throw new StatementParseError('A CIBC transaction could not be read completely. No transactions were imported.');
  };
  const date = (month: string, day: string) => {
    const iso = toIsoDate(month.toUpperCase(), Number(day), period);
    const parsed = new Date(`${iso}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso) {
      throw new StatementParseError('A CIBC transaction contains an invalid date.');
    }
    return iso;
  };

  for (const line of normalizeTextLines(rawText)) {
    const compact = line.replace(/\s+/g, ' ').trim();
    if (/^Your payments$/i.test(compact)) {
      requireCompleteRow();
      section = 'payments';
      continue;
    }
    if (/^Your new charges and credits(?:\s*\(continued\))?$/i.test(compact)) {
      section = 'charges';
      continue;
    }
    if (/^Total (?:payments|for)\b/i.test(compact)) {
      requireCompleteRow();
      section = null;
      continue;
    }
    // An additional card on the same statement starts another charges table.
    if (/^Card number\b/i.test(compact)) {
      section = 'charges';
      continue;
    }
    if (!section || !compact || PAGE_BREAK_REGEX.test(compact)) continue;
    if (/^(?:CIBC\b|Trans$|Post$|date(?:\s|$)|Transactions from\b|Page \d+|Ý Identifies\b|same rate\.)/i.test(compact)) continue;

    const start = compact.match(CIBC_ROW_START_REGEX);
    if (start) {
      requireCompleteRow();
      date(start[3], start[4]); // Validate the posting date too, but store the transaction date.
      pending = { date: date(start[1], start[2]), details: start[5] };
    } else if (pending) {
      pending.details += ` ${compact}`;
    } else continue;

    const amountMatch = pending.details.match(/\s+(-?\$?\d[\d,]*\.\d{2})(?:\s*(CR))?$/i);
    if (!amountMatch) continue;
    let description = pending.details.slice(0, amountMatch.index).replace(/^Ý\s*/, '').trim();
    // Spend Categories is a separate CIBC column, not part of the merchant.
    description = description.replace(/\s+(?:Retail and Grocery|Transportation|Restaurants|Health and Education|Home and Office Improvement|Personal and Household Expenses|Professional and Financial Services|Hotel,? Entertainment and Recreation|Foreign Currency Transactions|Other)\s*$/i, '');
    if (!description) throw new StatementParseError('A CIBC transaction is missing its description.');
    const rawAmount = parseAmountCents(amountMatch[1]);
    const amount = section === 'payments' || amountMatch[2] ? -Math.abs(rawAmount) : rawAmount;
    transactions.push({
      date: pending.date,
      description,
      merchant: extractMerchantName(description),
      amount,
      type: amount < 0 ? 'credit' : 'debit'
    });
    pending = null;
  }
  requireCompleteRow();
  return transactions;
}

export function parseBankStatementDocument(extractedText: string): ParsedBankStatement {
  const isCibc = /\bCIBC\b|CANADIAN IMPERIAL BANK OF COMMERCE/i.test(extractedText);
  const isRbc = /\bRBC\b|ROYAL BANK OF CANADA/i.test(extractedText);
  // Require both the bank identity and its statement layout; a merchant name
  // mentioning another bank must not select that bank's parser.
  if (isCibc && /Your (?:payments|new charges and credits)/i.test(extractedText)) {
    return { institution: 'cibc', accountType: 'credit_card', transactions: parseCibcTransactions(extractedText) };
  }
  const institution = isRbc ? 'rbc' : isCibc ? 'cibc' : null;
  const parsedRows = institution === 'rbc' ? parseRbcStatementTable(extractedText) : [];

  return {
    institution,
    accountType: 'credit_card',
    transactions: parsedRows.map((row) => {
      const fullDescription = row.description ? `${row.activity} ${row.description}` : row.activity;

      return {
        date: row.transactionDate,
        description: fullDescription,
        merchant: extractMerchantName(fullDescription),
        amount: row.amount,
        type: row.amount < 0 ? 'credit' : 'debit'
      };
    })
  };
}

export function parseBankStatementText(extractedText: string): ParsedTransaction[] {
  return parseBankStatementDocument(extractedText).transactions;
}

// Used by both upload and re-parse before any database writes. An empty parse
// cannot safely distinguish an unsupported layout from a zero-activity month.
export function parseStatementForImport(extractedText: string): ParsedBankStatement {
  const parsed = parseBankStatementDocument(extractedText);
  if (!parsed.institution) {
    throw new StatementParseError('Unsupported statement. Upload an RBC or CIBC credit card statement PDF.');
  }
  if (parsed.transactions.length === 0) {
    throw new StatementParseError('No transactions could be read. The statement may be empty, scanned, or use an unsupported layout.');
  }
  return parsed;
}

export async function parseBankStatement(fileBuffer: Buffer): Promise<ParsedTransaction[]> {
  const extractedText = await extractPdfText(fileBuffer);
  return parseBankStatementText(extractedText);
}
