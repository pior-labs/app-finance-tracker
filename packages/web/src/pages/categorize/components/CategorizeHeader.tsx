import { memo } from 'react';

interface CategorizeHeaderProps {
  remaining: number;
  confirmedCount: number;
  totalUncategorized: number;
  progressPct: number;
}

export const CategorizeHeader = memo(function CategorizeHeader({
  remaining,
  confirmedCount,
  totalUncategorized,
  progressPct,
}: CategorizeHeaderProps) {
  return (
    <header className="flex flex-col gap-5 px-0.5 pt-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:px-1">
      <div className="min-w-0">
        <div className="text-[12px] tracking-wide sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
          Categorize ·{' '}
          <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
            {remaining} remaining
          </em>
        </div>
        <h1
          className="m-0 my-1.5 text-[34px] font-normal leading-[1.05] tracking-tight sm:text-[42px] sm:leading-none md:text-[52px]"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
        >
          Sort your{' '}
          <em className="font-light italic" style={{ color: 'var(--accent)' }}>spending</em>
        </h1>
      </div>
      <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-40 sm:items-end">
        <div className="italic" style={{ fontFamily: "'Fraunces', serif", fontSize: 13, color: 'var(--ink-3)' }}>
          <span className="not-italic text-[22px] font-normal tracking-tight sm:text-[28px]" style={{ color: 'var(--ink)' }}>
            {confirmedCount}
          </span>{' '}
          of {totalUncategorized}
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-[rgba(45,36,24,0.06)] sm:w-40">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out motion-reduce:transition-none"
            style={{
              width: `${Math.max(progressPct, 2)}%`,
              background: 'linear-gradient(90deg, #cae0a8, #8eb567)',
              boxShadow: 'inset 0 1px 0 rgba(var(--frost-rgb),0.5)',
            }}
          />
        </div>
      </div>
    </header>
  );
});
