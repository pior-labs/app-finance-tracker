import { PDFParse } from 'pdf-parse';

export interface ParsedTransaction {
  date: string;
  description: string;
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

const TABLE_HEADER = 'TRANSACTION POSTING ACTIVITY DESCRIPTION AMOUNT ($)';
const ROW_START_REGEX =
  /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2})\s+(.+)$/;
const AMOUNT_REGEX = /^-?\$\d{1,3}(?:,\d{3})*\.\d{2}$/;
const PAGE_BREAK_REGEX = /^--\s+\d+\s+of\s+\d+\s+--$/;
const REFERENCE_NUMBER_REGEX = /^\d{16,25}$/;

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
    /STATEMENT FROM\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2})\s+TO\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2}),\s+(\d{4})/
  );

  if (!periodMatch) {
    return null;
  }

  const [, startMonthAbbrev, , endMonthAbbrev, , endYearRaw] = periodMatch;
  const startMonth = MONTH_INDEX_BY_ABBREV[startMonthAbbrev];
  const endMonth = MONTH_INDEX_BY_ABBREV[endMonthAbbrev];
  const endYear = Number(endYearRaw);
  const startYear = startMonth > endMonth ? endYear - 1 : endYear;

  return {
    startMonth,
    endMonth,
    startYear,
    endYear
  };
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

  const monthPadded = String(month).padStart(2, '0');
  const dayPadded = String(day).padStart(2, '0');

  return `${year}-${monthPadded}-${dayPadded}`;
}

function parseAmountCents(amountRaw: string): number {
  const negative = amountRaw.startsWith('-');
  const normalized = amountRaw.replace(/[$,-]/g, '');
  const [wholePart, decimalPart] = normalized.split('.');
  const cents = Number(wholePart) * 100 + Number(decimalPart);
  return negative ? -cents : cents;
}

function shouldIgnoreDetailLine(line: string): boolean {
  if (!line) {
    return true;
  }

  if (PAGE_BREAK_REGEX.test(line)) {
    return true;
  }

  if (line === TABLE_HEADER || line.replace(/\s+/g, ' ').trim() === 'DATE DATE') {
    return true;
  }

  if (
    line.includes('RBC® Cash Back Mastercard') ||
    line.includes('STATEMENT FROM ') ||
    /\d+\s+OF\s+\d+/.test(line) ||
    line.includes('(continued)')
  ) {
    return true;
  }

  return false;
}

function isReferenceNumberLine(line: string): boolean {
  return REFERENCE_NUMBER_REGEX.test(line.replace(/\s+/g, ''));
}

function normalizeTextLines(rawText: string): string[] {
  return rawText.split(/\r?\n/).map((line) => line.trim());
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

    if (compact === TABLE_HEADER) {
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
        .filter((detailLine) => !isReferenceNumberLine(detailLine))
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
  return parsedRows.map((row) => ({
    date: row.transactionDate,
    description: row.description ? `${row.activity} ${row.description}` : row.activity,
    amount: row.amount,
    type: row.amount < 0 ? 'credit' : 'debit'
  }));
}

export async function parseBankStatement(fileBuffer: Buffer): Promise<ParsedTransaction[]> {
  const extractedText = await extractPdfText(fileBuffer);
  return parseBankStatementText(extractedText);
}
