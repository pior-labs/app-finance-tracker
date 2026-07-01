import { memo } from 'react';
import { PILL_SMALL } from '../lib/constants';
import { formatStatementPeriod, splitMoney } from '../lib/format';
import type { DashboardStatsResponse } from '../types';
import { Donut } from './Donut';
import { StatCard } from './StatCard';

function SummaryStatsGridComponent({
  isCurrentMonth,
  monthLabel,
  totalSpentCents,
  monthTx,
  categorizedPct,
  categorizedCount,
  uncategorizedCount,
  latestStatement,
  onUpload,
}: {
  isCurrentMonth: boolean;
  monthLabel: string;
  totalSpentCents: number;
  monthTx: number;
  categorizedPct: number;
  categorizedCount: number;
  uncategorizedCount: number;
  latestStatement: DashboardStatsResponse['meta']['latestStatement'];
  onUpload: () => void;
}) {
  const money = splitMoney(totalSpentCents);

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr_1.1fr]">
      <StatCard tint="tone-card-1">
        <div className="font-serif text-[15px] italic text-ink-2">
          {isCurrentMonth ? 'Spent this month' : `Spent in ${monthLabel}`}
        </div>
        <div className="my-1.5 font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.03em] text-ink lining-nums sm:text-[56px]">
          <span className="text-2xl text-ink-3 align-top sm:text-[30px]">$</span>
          {money.whole}
          <span className="text-xl text-ink-3 sm:text-[26px]">.{money.cents}</span>
        </div>
        <div className="text-[13px] text-ink-2">{monthTx} transactions</div>
        <svg
          className="-mx-5.5 -mb-5 mt-3.5 block h-12.5 w-[calc(100%+44px)] sm:-mx-7 sm:-mb-6 sm:w-[calc(100%+56px)]"
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 28 Q 25 18 50 22 T 100 24 T 150 16 T 200 22 L 200 40 L 0 40 Z" fill="rgba(var(--frost-rgb),0.4)" />
          <path d="M0 28 Q 25 18 50 22 T 100 24 T 150 16 T 200 22" stroke="var(--finlens-accent-ink)" strokeWidth="1.5" fill="none" />
        </svg>
      </StatCard>

      <StatCard tint="tone-card-2">
        <div className="font-serif text-[15px] italic text-ink-2">Categorized</div>
        <div className="my-1.5 font-serif text-[64px] font-normal leading-[1.05] tracking-[-0.03em] text-ink lining-nums sm:text-[80px]">
          {categorizedPct}
          <span className="ml-1 text-[26px] text-ink-3 sm:text-[32px]">%</span>
        </div>
        <div className="mt-auto flex items-center gap-4">
          <Donut pct={categorizedPct} />
          <div className="text-[13px] leading-[1.4]">
            <div>
              <b className="font-serif text-[22px] font-medium">{categorizedCount}</b> sorted
            </div>
            <div className="text-xs text-ink-3">{uncategorizedCount} to go</div>
          </div>
        </div>
      </StatCard>

      <StatCard tint="tone-card-3">
        <div className="font-serif text-[15px] italic text-ink-2">Latest statement</div>
        {latestStatement ? (
          <>
            <div className="my-2 mb-3.5 font-serif text-[28px] font-normal tracking-[-0.01em] text-ink">
              {formatStatementPeriod(latestStatement.periodStart, latestStatement.periodEnd)}
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-[17px] text-white shadow-[0_4px_10px_rgba(45,36,24,0.15)]" style={{ background: 'var(--finlens-accent-icon)' }}>
                {latestStatement.uploadedByName?.[0]?.toUpperCase() ?? '?'}
              </span>
              <div>
                <div className="text-ink">uploaded by {latestStatement.uploadedByName}</div>
                <div className="text-xs text-ink-3">{latestStatement.transactionCount} entries</div>
              </div>
            </div>
          </>
        ) : (
          <div className="my-2 mb-3.5 font-serif text-lg text-ink-3">No statements yet</div>
        )}
        <button className={PILL_SMALL} onClick={onUpload}>
          + Upload next
        </button>
      </StatCard>
    </section>
  );
}

export const SummaryStatsGrid = memo(SummaryStatsGridComponent);
