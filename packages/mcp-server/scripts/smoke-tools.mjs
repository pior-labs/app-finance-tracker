// Step 7 gate: call every MCP tool with valid, invalid, and no-data inputs
// over real stdio transport. Requires DATABASE_URL to point at a reachable
// Postgres with Phase 1 data. Run from packages/mcp-server:
//   node scripts/smoke-tools.mjs
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const EXPECTED_TOOLS = [
  'get_spending_summary',
  'compare_months',
  'get_category_breakdown',
  'get_top_merchants',
  'get_merchant_spending',
  'get_transactions',
  'search_transactions'
];

let failures = 0;

function check(label, condition, detail = '') {
  const status = condition ? 'PASS' : 'FAIL';
  if (!condition) {
    failures += 1;
  }
  console.log(`${status}  ${label}${detail ? ` — ${detail}` : ''}`);
}

// Override the server command to smoke a different runtime, e.g. the
// Docker Compose container:
//   MCP_SMOKE_COMMAND=docker \
//   MCP_SMOKE_ARGS="exec -i finlens-mcp-server node dist/index.js" \
//   node scripts/smoke-tools.mjs
const client = new Client({ name: 'finlens-smoke', version: '0.1.0' });
const transport = new StdioClientTransport({
  command: process.env.MCP_SMOKE_COMMAND ?? process.execPath,
  args: process.env.MCP_SMOKE_ARGS?.split(' ') ?? ['dist/index.js'],
  stderr: 'ignore'
});
await client.connect(transport);

const { tools } = await client.listTools();
const toolNames = tools.map((tool) => tool.name).sort();
check('tools/list exposes the 7 planned tools', JSON.stringify(toolNames) === JSON.stringify([...EXPECTED_TOOLS].sort()), toolNames.join(', '));
check(
  'every tool declares input schema, output schema, and read-only annotation',
  tools.every((tool) => tool.inputSchema && tool.outputSchema && tool.annotations?.readOnlyHint === true)
);

async function call(name, args) {
  return client.callTool({ name, arguments: args });
}

// Find a month that actually has data by listing recent transactions.
const recent = await call('get_transactions', { limit: 5 });
check('get_transactions (no filters) succeeds', !recent.isError && recent.structuredContent?.pagination?.total >= 0);
const sample = recent.structuredContent?.data?.[0];
if (!sample) {
  console.log('No transactions in database — cannot run data-dependent checks.');
  process.exit(1);
}
const month = sample.date.slice(0, 7);
const merchant = recent.structuredContent.data.find((t) => t.merchant)?.merchant;
console.log(`(using month=${month}, merchant=${JSON.stringify(merchant)})`);

// --- Valid inputs ---
const summary = await call('get_spending_summary', { month });
check(
  'get_spending_summary valid',
  !summary.isError &&
    summary.structuredContent?.month === month &&
    Number.isInteger(summary.structuredContent?.totalSpentCents) &&
    Array.isArray(summary.structuredContent?.byCategory) &&
    summary.content?.[0]?.type === 'text',
  `total=${summary.structuredContent?.totalSpentCents}c, ${summary.structuredContent?.transactionCount} txns`
);

const compare = await call('compare_months', { month, comparisonMonth: month });
check(
  'compare_months valid (same month → zero change)',
  !compare.isError &&
    compare.structuredContent?.totalSpentChangeCents === 0 &&
    compare.structuredContent?.transactionCountChange === 0
);

const breakdown = await call('get_category_breakdown', { startMonth: month });
check(
  'get_category_breakdown valid',
  !breakdown.isError && Array.isArray(breakdown.structuredContent?.categories),
  `${breakdown.structuredContent?.categories?.length} categories`
);
const breakdownTotal = (breakdown.structuredContent?.categories ?? []).reduce((sum, c) => sum + c.totalCents, 0);
check(
  'category totals do not exceed summary total',
  breakdownTotal <= summary.structuredContent.totalSpentCents,
  `${breakdownTotal}c categorized of ${summary.structuredContent.totalSpentCents}c`
);

const top = await call('get_top_merchants', { startMonth: month, limit: 3 });
check(
  'get_top_merchants valid (limit 3)',
  !top.isError && Array.isArray(top.structuredContent?.merchants) && top.structuredContent.merchants.length <= 3,
  `${top.structuredContent?.merchants?.length} merchants`
);

if (merchant) {
  const ms = await call('get_merchant_spending', { merchant, startMonth: month });
  check(
    'get_merchant_spending valid (exact match found)',
    !ms.isError && ms.structuredContent?.found === true && ms.structuredContent?.transactionCount >= 1,
    `${merchant}: ${ms.structuredContent?.totalCents}c`
  );
}

const search = await call('search_transactions', { query: sample.description.slice(0, 4), startMonth: month });
check(
  'search_transactions valid',
  !search.isError && search.structuredContent?.pagination?.total >= 1,
  `${search.structuredContent?.pagination?.total} matches`
);

// --- No-data periods ---
const empty = await call('get_spending_summary', { month: '1999-01' });
check(
  'get_spending_summary no-data month is explicit, not an error',
  !empty.isError && empty.structuredContent?.transactionCount === 0 && /no transactions/i.test(empty.content?.[0]?.text ?? '')
);

const emptyMerchant = await call('get_merchant_spending', { merchant: 'definitely-not-a-merchant-xyz', startMonth: month });
check(
  'get_merchant_spending unknown merchant → found:false',
  !emptyMerchant.isError && emptyMerchant.structuredContent?.found === false && emptyMerchant.structuredContent?.totalCents === 0
);

const emptySearch = await call('search_transactions', { query: 'zzz-no-such-thing-981273' });
check(
  'search_transactions no matches → empty page',
  !emptySearch.isError && emptySearch.structuredContent?.pagination?.total === 0 && emptySearch.structuredContent?.data?.length === 0
);

// --- Invalid inputs ---
async function expectRejected(label, name, args, viaProtocolError) {
  if (viaProtocolError) {
    try {
      const result = await call(name, args);
      check(label, result.isError === true, result.content?.[0]?.text?.slice(0, 80));
    } catch (error) {
      check(label, true, `protocol error: ${String(error.message).slice(0, 80)}`);
    }
    return;
  }
  const result = await call(name, args);
  check(label, result.isError === true, result.content?.[0]?.text?.slice(0, 80));
}

await expectRejected('invalid month format rejected', 'get_spending_summary', { month: '2026-13' }, true);
await expectRejected('out-of-range limit rejected', 'get_top_merchants', { startMonth: month, limit: 9999 }, true);
await expectRejected('empty search query rejected', 'search_transactions', { query: '   ' }, true);
await expectRejected('categoryId + uncategorized conflict rejected', 'get_transactions', { categoryId: 1, uncategorized: true });
await expectRejected('endMonth without startMonth rejected', 'get_transactions', { endMonth: month });
await expectRejected('startMonth after endMonth rejected', 'get_category_breakdown', { startMonth: '2026-05', endMonth: '2026-01' });

await client.close();
console.log(failures === 0 ? '\nAll smoke checks passed.' : `\n${failures} smoke check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
