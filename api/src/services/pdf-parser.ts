import { PDFParse } from 'pdf-parse';

export interface ParsedTransaction {
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: 'debit' | 'credit';
}

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

export function parseBankStatementText(extractedText: string): ParsedTransaction[] {
  const parsedRows = parseRbcStatementTable(extractedText);

  return parsedRows.map((row) => {
    const fullDescription = row.description ? `${row.activity} ${row.description}` : row.activity;

    return {
      date: row.transactionDate,
      description: fullDescription,
      merchant: extractMerchantName(fullDescription),
      amount: row.amount,
      type: row.amount < 0 ? 'credit' : 'debit'
    };
  });
}

export async function parseBankStatement(fileBuffer: Buffer): Promise<ParsedTransaction[]> {
  const extractedText = await extractPdfText(fileBuffer);
  return parseBankStatementText(extractedText);
}
