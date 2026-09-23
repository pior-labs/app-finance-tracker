import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseBankStatementDocument, parseStatementForImport, StatementParseError } from '../dist/services/pdf-parser.js';

const cibc = readFileSync(new URL('./fixtures/cibc-statement.txt', import.meta.url), 'utf8');
const rbc = `RBC ROYAL BANK OF CANADA
STATEMENT FROM DEC 14 TO JAN 13, 2026
TRANSACTION POSTING ACTIVITY DESCRIPTION AMOUNT ($)
DEC 30 JAN 02 PURCHASE
SAMPLE MARKET TORONTO ON
1234567890123456
$90.00
JAN 06 JAN 08 PAYMENT
THANK YOU
-$300.00
TOTAL ACCOUNT BALANCE $90.00`;

test('CIBC tags transactions and parses payments, purchases, refunds and wrapped pages', () => {
  const parsed = parseBankStatementDocument(cibc);
  assert.equal(parsed.institution, 'cibc');
  assert.equal(parsed.accountType, 'credit_card');
  assert.deepEqual(parsed.transactions.map(({ date, amount, type }) => ({ date, amount, type })), [
    { date: '2025-12-27', amount: -30000, type: 'credit' },
    { date: '2025-12-30', amount: 4500, type: 'debit' },
    { date: '2025-12-31', amount: 9000, type: 'debit' },
    { date: '2026-01-06', amount: 2000, type: 'debit' },
    { date: '2026-01-07', amount: -1000, type: 'credit' },
    { date: '2026-01-08', amount: -500, type: 'credit' }
  ]);
  assert.equal(parsed.transactions[3].description, 'SAMPLE CAFE ANYTOWN ON');
  assert.equal(parsed.transactions[1].description, 'SAMPLE FUEL ANYTOWN ON');
});

for (const header of ['TRANSACTION POSTING ACTIVITY DESCRIPTION AMOUNT ($)', 'DATE ACTIVITY DESCRIPTION AMOUNT ($)']) {
  test(`RBC preserves ${header} parsing and bank tag`, () => {
    const parsed = parseBankStatementDocument(rbc.replace('TRANSACTION POSTING ACTIVITY DESCRIPTION AMOUNT ($)', header));
    assert.equal(parsed.institution, 'rbc');
    assert.deepEqual(parsed.transactions.map(({ date, amount, type }) => ({ date, amount, type })), [
      { date: '2025-12-30', amount: 9000, type: 'debit' },
      { date: '2026-01-06', amount: -30000, type: 'credit' }
    ]);
  });
}

test('unknown statements are not labeled RBC just because their rows match', () => {
  assert.deepEqual(parseBankStatementDocument(rbc.replace('RBC ROYAL BANK OF CANADA', 'UNKNOWN BANK')).transactions, []);
  assert.equal(parseBankStatementDocument('Unknown statement').institution, null);
});

test('CIBC requires a dated statement period rather than guessing the current year', () => {
  assert.throws(() => parseBankStatementDocument(cibc.replace(/Transactions from[^\n]+/, '')), /period/i);
});

test('CIBC rejects an incomplete transaction instead of silently dropping it', () => {
  assert.throws(() => parseBankStatementDocument(cibc.replace('Transportation 45.00', 'Transportation')), /transaction/i);
});

test('CIBC rejects impossible dates', () => {
  assert.throws(() => parseBankStatementDocument(cibc.replace('Dec 30 Jan 02', 'Dec 32 Jan 02')), /date/i);
});

test('upload and re-parse guard rejects unsupported and empty statements', () => {
  for (const text of ['Other bank', 'CIBC credit card statement', 'RBC credit card statement']) {
    assert.throws(() => parseStatementForImport(text), StatementParseError);
  }
  assert.equal(parseStatementForImport(cibc).institution, 'cibc');
  assert.equal(parseStatementForImport(rbc).institution, 'rbc');
});

test('CIBC handles additional cards, thousands separators, and another bank in a merchant name', () => {
  const text = cibc.replace('Total for XXXX XXXX XXXX XXXX $140.00', `Total for XXXX XXXX XXXX XXXX $140.00
Card number XXXX XXXX XXXX YYYY
Jan 09 Jan 10 RBC INSURANCE ANYTOWN ON Other 1,234.56
Total for XXXX XXXX XXXX YYYY $1,234.56`);
  const parsed = parseStatementForImport(text);
  assert.equal(parsed.institution, 'cibc');
  assert.equal(parsed.transactions.length, 7);
  assert.equal(parsed.transactions[6].amount, 123456);
  assert.equal(parsed.transactions[6].description, 'RBC INSURANCE ANYTOWN ON');
});
