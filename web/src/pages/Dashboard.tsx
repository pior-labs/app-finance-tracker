import { Link, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UploadModal } from '@/components/UploadModal';
import { BrandMark } from '@/components/BrandMark';

interface CategorySpending {
  categoryId?: number;
  category: string;
  transactionCount?: number;
  totalCents: number;
}

interface MerchantSpending {
  merchant: string;
  totalCents: number;
  transactionCount?: number;
}

interface DashboardStatsResponse {
  data: {
    totalSpentCents: number;
    uncategorizedCount: number;
    monthTransactionCount: number;
    totalTransactionCount: number;
    byCategory: CategorySpending[];
    topMerchants: MerchantSpending[];
  };
  meta: {
    month: string;
    availableMonths?: string[];
    latestStatement?: {
      periodStart: string | null;
      periodEnd: string | null;
      transactionCount: number;
      uploadedByName: string;
    };
  };
}

interface RecentTransaction {
  id: number;
  date: string;
  merchant: string | null;
  description: string;
  amount: number;
}

const PALETTE = [
  '#cae0a8',
  '#f8d7c0',
  '#dcd3f0',
  '#f5e3a0',
  '#c6e3d4',
  '#f1c8d6',
  '#d4cdf2',
  '#ffd6b3',
];

function formatMoney(cents: number, { showCents = true }: { showCents?: boolean } = {}): string {
  const value = Math.abs(cents) / 100;
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })}`;
}

function splitMoney(cents: number): { whole: string; cents: string } {
  const value = Math.abs(cents) / 100;
  const [whole, cent = '00'] = value
    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split('.');
  return { whole, cents: cent };
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isValidMonth(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}$/.test(value);
}

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-');
  const parsed = new Date(Number(year), Number(monthNumber) - 1, 1);
  if (Number.isNaN(parsed.getTime())) return month;
  return parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatStatementPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return 'Latest statement';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} – ${end}`;
  }
  const startLabel = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

function prettyName(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase());
}

const PILL_BASE =
  'inline-flex items-center gap-2 rounded-full border border-transparent px-5.5 py-3 font-sans text-[15px] font-medium no-underline cursor-pointer transition-[transform,box-shadow,background-color] duration-150 motion-reduce:transition-none';
const PILL_PRIMARY = `group ${PILL_BASE} bg-ink text-cream shadow-[0_8px_22px_-6px_rgba(45,36,24,0.4)] hover:-translate-y-px hover:shadow-[0_10px_26px_-6px_rgba(45,36,24,0.5)] motion-reduce:hover:translate-y-0`;
const PILL_GHOST = `${PILL_BASE} bg-transparent text-ink-2 border-ink/20 hover:bg-white/50`;
const PILL_SMALL =
  'inline-flex items-center gap-2 self-start mt-3.5 rounded-full bg-ink/5 px-4 py-2 font-sans text-[13px] font-medium text-ink cursor-pointer border-0 hover:bg-ink/10';

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthFromUrl = searchParams.get('month');
  const month = isValidMonth(monthFromUrl) ? monthFromUrl : getCurrentMonth();
  const isCurrentMonth = month === getCurrentMonth();

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [recentUncategorized, setRecentUncategorized] = useState<RecentTransaction[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statsParams = new URLSearchParams();
      statsParams.set('month', month);
      const txParams = new URLSearchParams();
      txParams.set('status', 'needs_review');
      txParams.set('limit', '3');
      txParams.set('month', month);

      const [statsRes, txRes] = await Promise.all([
        fetch(`/api/transactions/stats?${statsParams.toString()}`, { credentials: 'include' }),
        fetch(`/api/transactions?${txParams.toString()}`, { credentials: 'include' }),
      ]);
      if (!statsRes.ok) {
        const payload = await statsRes.json().catch(() => ({}));
        throw new Error(
          (payload as { error?: string }).error ?? `Failed to load dashboard (${statsRes.status})`,
        );
      }
      const statsPayload = (await statsRes.json()) as DashboardStatsResponse;
      setStats(statsPayload);
      const months = new Set<string>([
        getCurrentMonth(),
        month,
        statsPayload.meta.month,
        ...(statsPayload.meta.availableMonths ?? []),
      ]);
      setAvailableMonths(
        Array.from(months)
          .filter((candidate) => isValidMonth(candidate))
          .sort((a, b) => b.localeCompare(a)),
      );
      if (txRes.ok) {
        const txPayload = (await txRes.json()) as { data: RecentTransaction[] };
        setRecentUncategorized(txPayload.data);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [pickerOpen]);

  const categoryRows = useMemo(() => {
    const rows = stats?.data.byCategory ?? [];
    return rows.filter((r) => r.totalCents > 0).sort((a, b) => b.totalCents - a.totalCents);
  }, [stats]);

  const maxCategoryCents = categoryRows[0]?.totalCents ?? 1;

  const merchantRows = useMemo(() => {
    return stats?.data.topMerchants ?? [];
  }, [stats]);

  const uncategorizedCount = stats?.data.uncategorizedCount ?? 0;
  const monthTx = stats?.data.monthTransactionCount ?? 0;
  const totalTx = stats?.data.totalTransactionCount ?? 0;
  const categorizedCount = Math.max(0, monthTx - uncategorizedCount);
  const categorizedPct = monthTx > 0 ? Math.round((categorizedCount / monthTx) * 100) : 0;
  const totalSpentCents = stats?.data.totalSpentCents ?? 0;
  const latestStatement = stats?.meta?.latestStatement;
  const monthLabel = formatMonthLabel(month);
  const needsReviewHref = `/transactions?${new URLSearchParams({
    status: 'needs_review',
    month,
  }).toString()}`;
  const monthTransactionsHref = `/transactions?${new URLSearchParams({ month }).toString()}`;

  const onPickMonth = (m: string) => {
    const next = new URLSearchParams(searchParams);
    if (m === getCurrentMonth()) {
      next.delete('month');
    } else {
      next.set('month', m);
    }
    setSearchParams(next, { replace: true });
    setPickerOpen(false);
  };

  if (error) {
    return (
      <div className="rounded-3xl border border-[rgba(197,112,74,0.4)] bg-[rgba(245,180,160,0.4)] px-6 py-5 text-[15px] text-[#6b3a1f]">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-[100px] animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none" />
        <div className="h-[280px] animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr_1.1fr]">
          <div className="h-[200px] animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none" />
          <div className="h-[200px] animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none" />
          <div className="h-[200px] animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  if (totalTx === 0) {
    return (
      <>
        <div className="flex flex-col items-center gap-3.5 px-6 py-15 text-center">
          <BrandMark size={64} className="mb-2" />
          <h2 className="m-0 font-serif text-4xl font-normal tracking-tight text-ink">
            Nothing here yet.
          </h2>
          <p className="m-0 max-w-[460px] text-[15px] text-ink-2">
            Upload your first bank statement and we'll show you a month-at-a-glance picture of
            your spending.
          </p>
          <div className="mt-2 flex gap-2.5">
            <button className={PILL_PRIMARY} onClick={() => setUploadOpen(true)}>
              Upload statement <Arrow />
            </button>
          </div>
        </div>
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadComplete={() => void fetchDashboard()}
        />
      </>
    );
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-6 px-0.5 pt-3 sm:px-1">
        <div>
          <div className="text-[13px] tracking-wide text-ink-3">
            Overview · <em className="font-serif italic text-ink-2 not-italic">{monthLabel}</em>
          </div>
          <h1 className="my-1.5 font-serif text-[36px] font-normal leading-none tracking-[-0.03em] text-ink sm:text-[44px] lg:text-[56px]">
            {isCurrentMonth ? 'This month' : <em className="font-light italic text-accent">{monthLabel}</em>}
          </h1>
          <p className="m-0 max-w-[520px] text-[15px] text-ink-2 sm:text-base">
            Your spending, at a glance.
          </p>
        </div>
        <div ref={pickerRef} className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-white/80 bg-white/55 px-4 py-2 font-serif text-[15px] italic text-ink shadow-[0_6px_18px_rgba(45,36,24,0.05)] backdrop-blur-xl hover:bg-white/70 sm:px-4.5 sm:text-[17px]"
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
          >
            <span>{monthLabel}</span>
            <span>⌄</span>
          </button>
          {pickerOpen && (
            <div
              role="listbox"
              className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[220px] rounded-[18px] border border-white/80 bg-[rgba(255,253,247,0.92)] p-1.5 shadow-[0_14px_36px_-8px_rgba(45,36,24,0.18),inset_0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150"
            >
              {availableMonths.length === 0 ? (
                <div className="px-3 py-2.5 text-[13px] text-ink-3">No months yet</div>
              ) : (
                availableMonths.map((m) => {
                  const isSelected = m === month;
                  const isCurrent = m === getCurrentMonth();
                  return (
                    <button
                      key={m}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => onPickMonth(m)}
                      className={[
                        'flex w-full cursor-pointer items-center justify-between rounded-xl border-0 px-3 py-2.5 text-left text-sm font-[inherit]',
                        isSelected ? 'bg-ink text-cream' : 'bg-transparent text-ink hover:bg-ink/5',
                      ].join(' ')}
                    >
                      <span>{formatMonthLabel(m)}</span>
                      {isCurrent && (
                        <span
                          className={[
                            'font-serif text-[11px] italic',
                            isSelected ? 'text-cream/80' : 'text-ink-3',
                          ].join(' ')}
                        >
                          current
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </header>

      {uncategorizedCount > 0 ? (
        <section className="bloom-glass relative grid grid-cols-1 gap-5 overflow-hidden rounded-[36px] p-5 sm:p-7 lg:grid-cols-[1.4fr_1fr] lg:gap-8 lg:p-9">
          <div className="action-bg" />
          <div className="relative z-[1]">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-peach/80 px-3.5 py-1.5 text-[13px] font-medium text-ink-2">
              ⚘ Needs attention
            </div>
            <HugeNum value={uncategorizedCount}>
              uncategorized
              <br />
              transactions
            </HugeNum>
            <p className="mb-4 mt-0 max-w-[480px] font-serif text-[17px] font-normal leading-[1.5] text-ink-2 sm:text-[19px]">
              Categorize these to complete the picture for <em className="italic text-accent">{monthLabel}</em>.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/categorize" className={PILL_PRIMARY}>
                Categorize now <Arrow />
              </Link>
              <Link to={needsReviewHref} className={PILL_GHOST}>
                Open list
              </Link>
            </div>
          </div>
          <div className="relative z-[1] self-center rounded-3xl border border-white/70 bg-white/55 p-4 backdrop-blur-md sm:p-5">
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
                  className="-mx-2 grid grid-cols-[8px_auto_1fr_auto] items-center gap-2 rounded-xl border-b border-dashed border-ink/10 px-2 py-2.5 text-[13px] text-inherit no-underline transition-colors last:border-b-0 hover:bg-white/55 focus-visible:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:grid-cols-[8px_56px_1fr_auto] sm:gap-2.5 sm:text-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#f8d7c0,#c5704a)]" />
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
      ) : monthTx === 0 ? (
        <AllCaughtCard
          tagClass="bg-pistachio/80 text-[#3d6b1f]"
          tagText="↺ No activity"
          mainNum="—"
          subText={
            <>
              transactions in
              <br />
              this month
            </>
          }
          copy={
            <>
              No transactions were found for <em className="italic text-accent">{monthLabel}</em>.
            </>
          }
          ctaTo="/transactions"
          ctaLabel="View all transactions"
        />
      ) : (
        <AllCaughtCard
          tagClass="bg-pistachio/80 text-[#3d6b1f]"
          tagText="✓ All caught up"
          mainNum="0"
          subText={
            <>
              left to
              <br />
              categorize
            </>
          }
          copy={
            <>
              Everything for <em className="italic text-accent">{monthLabel}</em> is sorted.
            </>
          }
          ctaTo={monthTransactionsHref}
          ctaLabel="View transactions"
        />
      )}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr_1.1fr]">
        <StatCard tint="stat-card-peach">
          <div className="font-serif text-[15px] italic text-ink-2">
            {isCurrentMonth ? 'Spent this month' : `Spent in ${monthLabel}`}
          </div>
          <div
            className="my-1.5 font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.03em] text-ink lining-nums sm:text-[56px]"
          >
            <span className="text-2xl text-ink-3 align-top sm:text-[30px]">$</span>
            {splitMoney(totalSpentCents).whole}
            <span className="text-xl text-ink-3 sm:text-[26px]">
              .{splitMoney(totalSpentCents).cents}
            </span>
          </div>
          <div className="text-[13px] text-ink-2">{monthTx} transactions</div>
          <svg
            className="-mx-5.5 -mb-5 mt-3.5 block h-[50px] w-[calc(100%+44px)] sm:-mx-7 sm:-mb-6 sm:w-[calc(100%+56px)]"
            viewBox="0 0 200 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 28 Q 25 18 50 22 T 100 24 T 150 16 T 200 22 L 200 40 L 0 40 Z"
              fill="rgba(255,255,255,0.4)"
            />
            <path
              d="M0 28 Q 25 18 50 22 T 100 24 T 150 16 T 200 22"
              stroke="#9c5a3a"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </StatCard>

        <StatCard tint="stat-card-pistachio">
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

        <StatCard tint="stat-card-lavender">
          <div className="font-serif text-[15px] italic text-ink-2">Latest statement</div>
          {latestStatement ? (
            <>
              <div className="my-2 mb-3.5 font-serif text-[28px] font-normal tracking-[-0.01em] text-ink">
                {formatStatementPeriod(latestStatement.periodStart, latestStatement.periodEnd)}
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f8d7c0,#c5704a)] font-serif text-[17px] text-white shadow-[0_4px_10px_rgba(45,36,24,0.15)]">
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
          <button className={PILL_SMALL} onClick={() => setUploadOpen(true)}>
            + Upload next
          </button>
        </StatCard>
      </section>

      <section className="grid grid-cols-1 gap-5.5 lg:grid-cols-[1.2fr_1fr]">
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
                      className="h-2.5 w-2.5 flex-shrink-0 self-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
                      style={{ background: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="flex-1 text-[15px] font-medium text-ink">{c.category}</span>
                    <span className="font-serif text-base font-medium text-ink sm:text-lg">
                      {formatMoney(c.totalCents, { showCents: false })}
                    </span>
                  </Link>
                  <div className="h-3 overflow-hidden rounded-full bg-ink/5">
                    <div
                      className="h-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[width] duration-[600ms] motion-reduce:transition-none"
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
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-serif text-lg font-medium text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),0_4px_12px_rgba(45,36,24,0.08)] sm:h-11 sm:w-11 sm:text-xl"
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
                        <span className="flex-shrink-0 font-serif text-base font-medium text-ink sm:text-lg">
                          {formatMoney(m.totalCents)}
                        </span>
                      </div>
                      {m.transactionCount && m.transactionCount > 0 ? (
                        <div className="mt-1 flex items-center gap-[3px]">
                          {Array.from({ length: Math.min(m.transactionCount, 14) }).map((_, k) => (
                            <span
                              key={k}
                              className="h-[5px] w-[5px] rounded-full opacity-70"
                              style={{ background: PALETTE[i % PALETTE.length] }}
                            />
                          ))}
                          <span className="ml-2 font-serif text-xs italic text-ink-3">
                            {m.transactionCount} visits
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </BigCard>
      </section>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={() => void fetchDashboard()}
      />
    </>
  );
}

function HugeNum({ value, children }: { value: number | string; children: React.ReactNode }) {
  return (
    <div className="my-3 flex flex-wrap items-end gap-3 font-serif text-[84px] font-light leading-[0.9] tracking-[-0.05em] text-ink sm:text-[120px] sm:gap-4 lg:text-[168px] lg:gap-4.5">
      {value}
      <span className="pb-1.5 font-sans text-base font-normal leading-[1.25] tracking-normal text-ink-2 sm:pb-3 sm:text-lg lg:pb-4.5">
        {children}
      </span>
    </div>
  );
}

function StatCard({
  tint,
  children,
}: {
  tint: 'stat-card-peach' | 'stat-card-pistachio' | 'stat-card-lavender';
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        tint,
        'relative flex min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/80 p-5.5 backdrop-blur-xl backdrop-saturate-150 shadow-[0_12px_36px_-10px_rgba(45,36,24,0.1)] sm:min-h-[200px] sm:rounded-[30px] sm:p-7',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function BigCard({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bloom-glass relative rounded-[26px] p-5 sm:rounded-[32px] sm:p-8">
      <div className="mb-5.5">
        <h3 className="m-0 font-serif text-[22px] font-normal leading-[1.1] tracking-[-0.02em] text-ink sm:text-[28px]">
          {title}
        </h3>
        <span className="mt-0.5 block font-serif text-sm italic text-ink-3">{sub}</span>
      </div>
      {children}
    </div>
  );
}

function AllCaughtCard({
  tagClass,
  tagText,
  mainNum,
  subText,
  copy,
  ctaTo,
  ctaLabel,
}: {
  tagClass: string;
  tagText: string;
  mainNum: string;
  subText: React.ReactNode;
  copy: React.ReactNode;
  ctaTo: string;
  ctaLabel: string;
}) {
  return (
    <section className="bloom-glass relative overflow-hidden rounded-[36px] p-5 sm:p-7 lg:p-9">
      <div className="action-bg all-caught" />
      <div className="relative z-[1]">
        <div
          className={[
            'inline-flex items-center gap-1.5 rounded-full border border-white/60 px-3.5 py-1.5 text-[13px] font-medium',
            tagClass,
          ].join(' ')}
        >
          {tagText}
        </div>
        <HugeNum value={mainNum}>{subText}</HugeNum>
        <p className="mb-4 mt-0 max-w-[480px] font-serif text-[17px] font-normal leading-[1.5] text-ink-2 sm:text-[19px]">
          {copy}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link to={ctaTo} className={PILL_PRIMARY}>
            {ctaLabel} <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <span className="transition-transform duration-200 group-hover:translate-x-[3px] motion-reduce:transition-none">
      →
    </span>
  );
}

function Donut({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const off = c - (c * pct) / 100;
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" role="img" aria-label={`${pct} percent categorized`}>
      <defs>
        <linearGradient id="dash-donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5d8a3f" />
          <stop offset="100%" stopColor="#8eb567" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r={r} stroke="rgba(0,0,0,0.07)" strokeWidth="10" fill="none" />
      <circle
        cx="40"
        cy="40"
        r={r}
        stroke="url(#dash-donut-grad)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 40 40)"
      />
    </svg>
  );
}
