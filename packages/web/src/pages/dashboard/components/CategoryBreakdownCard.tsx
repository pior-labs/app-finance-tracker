import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PALETTE } from '../lib/constants';
import { formatMoney } from '../lib/format';
import type { CategorySpending } from '../types';
import { BigCard } from './BigCard';

function CategoryBreakdownCardComponent({
  categoryRows,
  maxCategoryCents,
  month,
  monthTransactionsHref,
}: {
  categoryRows: CategorySpending[];
  maxCategoryCents: number;
  month: string;
  monthTransactionsHref: string;
}) {
  return (
    <BigCard title="By category" sub="where your money went">
      {categoryRows.length === 0 ? (
        <p className="m-0 text-sm text-ink-3">No categorized spending yet.</p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {categoryRows.slice(0, 8).map((c, i) => (
            <div key={c.category}>
              <Link
                to={
                  c.categoryId
                    ? `/transactions?${new URLSearchParams({
                        month,
                        category: String(c.categoryId),
                      }).toString()}`
                    : monthTransactionsHref
                }
                className="mb-1.5 flex items-baseline gap-2.5 rounded-xl text-inherit no-underline transition-colors hover:bg-ink/5"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 self-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />
                <span className="flex-1 text-[15px] font-medium text-ink">{c.category}</span>
                <span className="font-serif text-base font-medium text-ink sm:text-lg">
                  {formatMoney(c.totalCents, { showCents: false })}
                </span>
              </Link>
              <div className="h-3 overflow-hidden rounded-full bg-ink/5">
                <div
                  className="h-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[width] duration-600 motion-reduce:transition-none"
                  style={{
                    width: `${(c.totalCents / maxCategoryCents) * 100}%`,
                    background: `linear-gradient(90deg, ${PALETTE[i % PALETTE.length]}, ${
                      PALETTE[(i + 1) % PALETTE.length]
                    })`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </BigCard>
  );
}

export const CategoryBreakdownCard = memo(CategoryBreakdownCardComponent);
