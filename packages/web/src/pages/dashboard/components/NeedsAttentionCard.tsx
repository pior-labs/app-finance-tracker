import { memo } from 'react';
import { Flower2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PILL_GHOST, PILL_PRIMARY } from '../lib/constants';
import { formatMoney, formatShortDate, prettyName } from '../lib/format';
import type { RecentTransaction } from '../types';
import { ArrowIcon } from './ArrowIcon';
import { HugeNum } from './HugeNum';

function NeedsAttentionCardComponent({
  uncategorizedCount,
  monthLabel,
  needsReviewHref,
  recentUncategorized,
  month,
}: {
  uncategorizedCount: number;
  monthLabel: string;
  needsReviewHref: string;
  recentUncategorized: RecentTransaction[];
  month: string;
}) {
  return (
    <section className="theme-glass relative grid grid-cols-1 gap-5 overflow-hidden rounded-[36px] p-5 sm:p-7 lg:grid-cols-[1.4fr_1fr] lg:gap-8 lg:p-9">
      <div className="theme-action-bg" />
      <div className="relative z-1">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-frost/60 bg-peach/80 px-3.5 py-1.5 text-[13px] font-medium text-ink-2">
          <Flower2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
          Needs attention
        </div>
        <HugeNum value={uncategorizedCount}>
          uncategorized
          <br />
          transactions
        </HugeNum>
        <p className="mb-4 mt-0 max-w-120 font-serif text-[17px] font-normal leading-normal text-ink-2 sm:text-[19px]">
          Categorize these to complete the picture for <em className="italic text-accent">{monthLabel}</em>.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/categorize" className={PILL_PRIMARY}>
            Categorize now <ArrowIcon />
          </Link>
          <Link to={needsReviewHref} className={PILL_GHOST}>
            Open list
          </Link>
        </div>
      </div>
      <div className="relative z-1 self-center rounded-3xl border border-frost/70 bg-frost/55 p-4 backdrop-blur-md sm:p-5">
        <div className="mb-3.5 font-serif text-sm italic text-ink-3">Recent uncategorized</div>
        {recentUncategorized.map((t) => {
          const href = `/transactions?${new URLSearchParams({
            month,
            status: 'needs_review',
            focus: String(t.id),
          }).toString()}`;

          return (
            <Link
              key={t.id}
              to={href}
              aria-label={`Categorize ${prettyName(t.merchant ?? t.description)} on ${formatShortDate(t.date)}, ${formatMoney(t.amount)}`}
              className="-mx-2 grid grid-cols-[8px_auto_1fr_auto] items-center gap-2 rounded-xl border-b border-dashed border-ink/10 px-2 py-2.5 text-[13px] text-inherit no-underline transition-colors last:border-b-0 hover:bg-frost/55 focus-visible:bg-frost/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:grid-cols-[8px_56px_1fr_auto] sm:gap-2.5 sm:text-sm"
            >
              <span className="h-2 w-2 rounded-full bg-[var(--finlens-danger-icon)]" />
              <span className="text-[11px] text-ink-3 sm:text-xs">{formatShortDate(t.date)}</span>
              <span className="overflow-hidden truncate whitespace-nowrap font-medium">
                {prettyName(t.merchant ?? t.description)}
              </span>
              <span className="font-serif text-base font-medium">{formatMoney(t.amount)}</span>
            </Link>
          );
        })}
        {uncategorizedCount > recentUncategorized.length && (
          <div className="mt-3 text-center font-serif text-[13px] italic text-ink-3">
            + {uncategorizedCount - recentUncategorized.length} more
          </div>
        )}
      </div>
    </section>
  );
}

export const NeedsAttentionCard = memo(NeedsAttentionCardComponent);
