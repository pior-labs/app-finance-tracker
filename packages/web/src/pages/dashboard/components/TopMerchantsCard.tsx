import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PALETTE } from '../lib/constants';
import { formatMoney, prettyName } from '../lib/format';
import type { MerchantSpending } from '../types';
import { BigCard } from './BigCard';

function TopMerchantsCardComponent({
  merchantRows,
  month,
}: {
  merchantRows: MerchantSpending[];
  month: string;
}) {
  return (
    <BigCard title="Top merchants" sub="your most-visited">
      {merchantRows.length === 0 ? (
        <p className="m-0 text-sm text-ink-3">No merchant data yet.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {merchantRows.slice(0, 6).map((m, i) => (
            <li key={m.merchant} className="flex items-center gap-3.5">
              <Link
                to={`/transactions?${new URLSearchParams({
                  month,
                  merchant: m.merchant,
                }).toString()}`}
                className="-mx-1.5 -my-1 flex w-full items-center gap-3.5 rounded-[14px] px-1.5 py-1 text-inherit no-underline transition-colors hover:bg-ink/5"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-lg font-medium text-ink shadow-[inset_0_0_0_1px_rgba(var(--frost-rgb),0.5),0_4px_12px_rgba(45,36,24,0.08)] sm:h-11 sm:w-11 sm:text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE[i % PALETTE.length]}, ${
                      PALETTE[(i + 2) % PALETTE.length]
                    })`,
                  }}
                >
                  {m.merchant[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="overflow-hidden truncate whitespace-nowrap text-[15px] font-medium text-ink">
                      {prettyName(m.merchant)}
                    </span>
                    <span className="shrink-0 font-serif text-base font-medium text-ink sm:text-lg">
                      {formatMoney(m.totalCents)}
                    </span>
                  </div>
                  {m.transactionCount && m.transactionCount > 0 ? (
                    <div className="mt-1 flex items-center gap-0.75">
                      {Array.from({ length: Math.min(m.transactionCount, 14) }).map((_, k) => (
                        <span
                          key={k}
                          className="h-1.25 w-1.25 rounded-full opacity-70"
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                      ))}
                      <span className="ml-2 font-serif text-xs italic text-ink-3">{m.transactionCount} visits</span>
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BigCard>
  );
}

export const TopMerchantsCard = memo(TopMerchantsCardComponent);
