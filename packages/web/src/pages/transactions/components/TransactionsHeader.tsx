import { memo } from 'react';
import { Check, Flower2 } from 'lucide-react';

interface TransactionsHeaderProps {
  filterParts: string[];
  total: number;
  needsReviewCount: number;
  completePct: number;
}

export const TransactionsHeader = memo(function TransactionsHeader({
  filterParts,
  total,
  needsReviewCount,
  completePct,
}: TransactionsHeaderProps) {
  return (
    <header className="flex flex-col gap-5 px-0.5 pt-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:px-1">
      <div className="min-w-0">
        <div className="truncate text-[12px] tracking-wide sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
          {filterParts.length > 0 ? (
            <>
              Filtered ·{' '}
              <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
                {filterParts.join(' · ')}
              </em>
            </>
          ) : (
            <>
              All time ·{' '}
              <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
                {total} total
              </em>
            </>
          )}
        </div>
        <h1
          className="m-0 my-1.5 text-[34px] font-normal leading-[1.05] tracking-tight sm:text-[42px] sm:leading-none md:text-[52px]"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
        >
          Transactions
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {needsReviewCount > 0 ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:py-1.5 sm:text-xs"
            style={{
              background: 'linear-gradient(135deg, rgba(248,215,192,0.7), rgba(245,227,160,0.5))',
              borderColor: 'rgba(255,255,255,0.6)',
              color: 'var(--ink-2)',
            }}
          >
            <Flower2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} /> {needsReviewCount} needs review
          </span>
        ) : null}
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:py-1.5 sm:text-xs"
          style={{
            background: 'linear-gradient(135deg, rgba(202,224,168,0.7), rgba(198,227,212,0.5))',
            borderColor: 'rgba(255,255,255,0.6)',
            color: '#3d6b1f',
          }}
        >
          <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} /> {completePct}% sorted
        </span>
      </div>
    </header>
  );
});
