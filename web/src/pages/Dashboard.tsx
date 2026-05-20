import { Link, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UploadModal } from '@/components/UploadModal';

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
  const categorizedPct =
    monthTx > 0 ? Math.round((categorizedCount / monthTx) * 100) : 0;
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
      <>
        <style>{DASHBOARD_CSS}</style>
        <div className="dash-error">{error}</div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{DASHBOARD_CSS}</style>
        <div className="dash-skeleton">
          <div className="sk-header" />
          <div className="sk-action" />
          <div className="sk-trio">
            <div className="sk-card" />
            <div className="sk-card" />
            <div className="sk-card" />
          </div>
        </div>
      </>
    );
  }

  if (totalTx === 0) {
    return (
      <>
        <style>{DASHBOARD_CSS}</style>
        <div className="dash-empty">
          <div className="dash-empty-mark">
            <span className="petal p1" />
            <span className="petal p2" />
            <span className="petal p3" />
            <span className="brand-core" />
          </div>
          <h2>Nothing here yet.</h2>
          <p>
            Upload your first bank statement and we'll show you a month-at-a-glance picture of
            your spending.
          </p>
          <div className="dash-empty-buttons">
            <button className="pill-btn primary" onClick={() => setUploadOpen(true)}>
              Upload statement <span className="arr">→</span>
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
      <style>{DASHBOARD_CSS}</style>

      <header className="b-head">
        <div>
          <div className="b-eyebrow">
            Overview · <em>{monthLabel}</em>
          </div>
          <h1 className="b-title">
            {isCurrentMonth ? 'This month' : <em>{monthLabel}</em>}
          </h1>
          <p className="b-sub">Your spending, at a glance.</p>
        </div>
        <div ref={pickerRef} className="b-month-wrap">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="b-month-pill"
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
          >
            <span>{monthLabel}</span>
            <span className="dot">⌄</span>
          </button>
          {pickerOpen && (
            <div role="listbox" className="b-month-menu">
              {availableMonths.length === 0 ? (
                <div className="b-month-empty">No months yet</div>
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
                      className={`b-month-opt${isSelected ? ' selected' : ''}`}
                    >
                      <span>{formatMonthLabel(m)}</span>
                      {isCurrent && <span className="b-month-current">current</span>}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </header>

      {uncategorizedCount > 0 ? (
        <section className="action-card">
          <div className="action-bg" />
          <div className="action-left">
            <div className="tag tag-warm">⚘ Needs attention</div>
            <div className="huge-num">
              {uncategorizedCount}
              <span className="huge-sub">
                uncategorized
                <br />
                transactions
              </span>
            </div>
            <p className="action-copy">
              Categorize these to complete the picture for <em>{monthLabel}</em>.
            </p>
            <div className="action-buttons">
              <Link to="/categorize" className="pill-btn primary">
                Categorize now <span className="arr">→</span>
              </Link>
              <Link to={needsReviewHref} className="pill-btn ghost">
                Open list
              </Link>
            </div>
          </div>
          <div className="action-right">
            <div className="recent-head">Recent uncategorized</div>
            {recentUncategorized.map((t) => (
              <div key={t.id} className="recent-row">
                <span className="r-dot" />
                <span className="r-date">{formatShortDate(t.date)}</span>
                <span className="r-name">{prettyName(t.merchant ?? t.description)}</span>
                <span className="r-amt">{formatMoney(t.amount)}</span>
              </div>
            ))}
            {uncategorizedCount > recentUncategorized.length && (
              <div className="recent-more">
                + {uncategorizedCount - recentUncategorized.length} more
              </div>
            )}
          </div>
        </section>
      ) : monthTx === 0 ? (
        <section className="action-card all-caught">
          <div className="action-bg" />
          <div className="action-left">
            <div className="tag tag-good">↺ No activity</div>
            <div className="huge-num">
              —
              <span className="huge-sub">
                transactions in
                <br />
                this month
              </span>
            </div>
            <p className="action-copy">
              No transactions were found for <em>{monthLabel}</em>.
            </p>
            <div className="action-buttons">
              <Link to="/transactions" className="pill-btn primary">
                View all transactions <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="action-card all-caught">
          <div className="action-bg" />
          <div className="action-left">
            <div className="tag tag-good">✓ All caught up</div>
            <div className="huge-num">
              0
              <span className="huge-sub">
                left to
                <br />
                categorize
              </span>
            </div>
            <p className="action-copy">
              Everything for <em>{monthLabel}</em> is sorted.
            </p>
            <div className="action-buttons">
              <Link to={monthTransactionsHref} className="pill-btn primary">
                View transactions <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="stat-trio">
        <div className="stat-card peach">
          <div className="stat-cap">{isCurrentMonth ? 'Spent this month' : `Spent in ${monthLabel}`}</div>
          <div className="stat-figure">
            <span className="ccy">$</span>
            {splitMoney(totalSpentCents).whole}
            <span className="cents">.{splitMoney(totalSpentCents).cents}</span>
          </div>
          <div className="stat-meta">{monthTx} transactions</div>
          <svg className="wave" viewBox="0 0 200 40" preserveAspectRatio="none">
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
        </div>

        <div className="stat-card pistachio">
          <div className="stat-cap">Categorized</div>
          <div className="stat-figure big-pct">
            {categorizedPct}
            <span className="pct-sign">%</span>
          </div>
          <div className="ring-wrap">
            <Donut pct={categorizedPct} />
            <div className="ring-meta">
              <div>
                <b>{categorizedCount}</b> sorted
              </div>
              <div className="dim">{uncategorizedCount} to go</div>
            </div>
          </div>
        </div>

        <div className="stat-card lavender">
          <div className="stat-cap">Latest statement</div>
          {latestStatement ? (
            <>
              <div className="stmt-period">
                {formatStatementPeriod(latestStatement.periodStart, latestStatement.periodEnd)}
              </div>
              <div className="stmt-meta-row">
                <span className="avatar">
                  {latestStatement.uploadedByName?.[0]?.toUpperCase() ?? '?'}
                </span>
                <div>
                  <div className="stmt-uploader">uploaded by {latestStatement.uploadedByName}</div>
                  <div className="dim">{latestStatement.transactionCount} entries</div>
                </div>
              </div>
            </>
          ) : (
            <div className="stmt-period dim">No statements yet</div>
          )}
          <button className="pill-btn small" onClick={() => setUploadOpen(true)}>
            + Upload next
          </button>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="big-card">
          <div className="bc-head">
            <h3 className="bc-title">By category</h3>
            <span className="bc-sub">where your money went</span>
          </div>
          {categoryRows.length === 0 ? (
            <p className="bc-empty">No categorized spending yet.</p>
          ) : (
            <div className="cat-list">
              {categoryRows.slice(0, 8).map((c, i) => (
                <div key={c.category} className="cat-row">
                  <Link
                    to={
                      c.categoryId
                        ? `/transactions?${new URLSearchParams({
                            month,
                            category: String(c.categoryId),
                          }).toString()}`
                        : monthTransactionsHref
                    }
                    className="cat-name-row cat-link"
                  >
                    <span
                      className="cat-bubble"
                      style={{ background: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="cat-name">{c.category}</span>
                    <span className="cat-amt">{formatMoney(c.totalCents, { showCents: false })}</span>
                  </Link>
                  <div className="cat-bar-wrap">
                    <div
                      className="cat-bar-fill"
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
        </div>

        <div className="big-card">
          <div className="bc-head">
            <h3 className="bc-title">Top merchants</h3>
            <span className="bc-sub">your most-visited</span>
          </div>
          {merchantRows.length === 0 ? (
            <p className="bc-empty">No merchant data yet.</p>
          ) : (
            <ul className="merch-list">
              {merchantRows.slice(0, 6).map((m, i) => (
                <li key={m.merchant} className="merch-li">
                  <Link
                    to={`/transactions?${new URLSearchParams({
                      month,
                      merchant: m.merchant,
                    }).toString()}`}
                    className="merch-link"
                  >
                    <div
                      className="m-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${PALETTE[i % PALETTE.length]}, ${
                          PALETTE[(i + 2) % PALETTE.length]
                        })`,
                      }}
                    >
                      {m.merchant[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="m-main">
                      <div className="m-name-row">
                        <span className="m-name">{prettyName(m.merchant)}</span>
                        <span className="m-amt">{formatMoney(m.totalCents)}</span>
                      </div>
                      {m.transactionCount && m.transactionCount > 0 ? (
                        <div className="m-visits">
                          {Array.from({ length: Math.min(m.transactionCount, 14) }).map((_, k) => (
                            <span
                              key={k}
                              className="visit-dot"
                              style={{ background: PALETTE[i % PALETTE.length] }}
                            />
                          ))}
                          <span className="m-count">{m.transactionCount} visits</span>
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={() => void fetchDashboard()}
      />
    </>
  );
}

function Donut({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const off = c - (c * pct) / 100;
  return (
    <svg className="donut" viewBox="0 0 80 80" width="80" height="80">
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

const DASHBOARD_CSS = `
.b-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 12px 4px 0;
  gap: 24px;
  flex-wrap: wrap;
}
.b-eyebrow {
  font-size: 13px;
  color: var(--ink-3);
  letter-spacing: 0.02em;
}
.b-eyebrow em { font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-2); }
.b-title {
  font-family: 'Fraunces', serif;
  font-size: 56px;
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 6px 0 6px;
  color: var(--ink);
}
.b-title em { font-style: italic; font-weight: 300; color: var(--accent); }
.b-sub { color: var(--ink-2); font-size: 16px; margin: 0; max-width: 520px; }

.b-month-wrap { position: relative; }
.b-month-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 999px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 17px;
  color: var(--ink);
  box-shadow: 0 6px 18px rgba(45,36,24,0.05);
  cursor: pointer;
}
.b-month-pill:hover { background: rgba(255,255,255,0.7); }
.b-month-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 20;
  min-width: 220px;
  background: rgba(255,253,247,0.92);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 18px;
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow: 0 14px 36px -8px rgba(45,36,24,0.18), inset 0 0 0 1px rgba(255,255,255,0.5);
  padding: 6px;
}
.b-month-empty { padding: 10px 12px; font-size: 13px; color: var(--ink-3); }
.b-month-opt {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 12px;
  background: transparent;
  color: var(--ink);
  border: 0;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}
.b-month-opt:hover { background: rgba(45,36,24,0.06); }
.b-month-opt.selected { background: var(--ink); color: var(--cream); }
.b-month-current {
  font-size: 11px;
  color: var(--ink-3);
  font-family: 'Fraunces', serif;
  font-style: italic;
}
.b-month-opt.selected .b-month-current { color: var(--cream); opacity: 0.8; }

.action-card {
  position: relative;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 32px;
  padding: 36px;
  border-radius: 36px;
  background: rgba(255,253,247,0.55);
  border: 1px solid rgba(255,255,255,0.8);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  box-shadow: 0 16px 50px -10px rgba(45,36,24,0.12), inset 0 0 0 1px rgba(255,255,255,0.5);
  overflow: hidden;
}
.action-card.all-caught { grid-template-columns: 1fr; }
.action-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 100%, rgba(202,224,168,0.5), transparent 40%),
    radial-gradient(circle at 90% 0%, rgba(248,215,192,0.6), transparent 50%);
  pointer-events: none;
}
.action-card.all-caught .action-bg {
  background:
    radial-gradient(circle at 10% 100%, rgba(202,224,168,0.7), transparent 50%),
    radial-gradient(circle at 90% 0%, rgba(198,227,212,0.6), transparent 50%);
}
.action-left, .action-right { position: relative; z-index: 1; }
.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(248,215,192,0.7);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
  border: 1px solid rgba(255,255,255,0.6);
}
.tag-warm { background: rgba(248,215,192,0.8); }
.tag-good { background: rgba(202,224,168,0.8); color: #3d6b1f; }
.huge-num {
  font-family: 'Fraunces', serif;
  font-size: 168px;
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.05em;
  margin: 12px 0;
  display: flex;
  align-items: flex-end;
  gap: 18px;
  color: var(--ink);
}
.huge-sub {
  font-size: 18px;
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  color: var(--ink-2);
  line-height: 1.25;
  padding-bottom: 18px;
  letter-spacing: 0;
}
.action-copy {
  font-family: 'Fraunces', serif;
  font-size: 19px;
  line-height: 1.5;
  color: var(--ink-2);
  margin: 0 0 22px;
  max-width: 480px;
  font-weight: 400;
}
.action-copy em { font-style: italic; color: var(--accent); }
.action-buttons { display: flex; gap: 10px; }
.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 999px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 15px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  text-decoration: none;
}
.pill-btn.primary {
  background: var(--ink);
  color: var(--cream);
  box-shadow: 0 8px 22px -6px rgba(45,36,24,0.4);
}
.pill-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 10px 26px -6px rgba(45,36,24,0.5); }
.pill-btn.primary .arr { transition: transform 0.2s; }
.pill-btn.primary:hover .arr { transform: translateX(3px); }
.pill-btn.ghost {
  background: transparent;
  color: var(--ink-2);
  border: 1px solid rgba(45,36,24,0.18);
}
.pill-btn.ghost:hover { background: rgba(255,255,255,0.5); }
.pill-btn.small {
  padding: 8px 16px;
  font-size: 13px;
  background: rgba(45,36,24,0.06);
  color: var(--ink);
  margin-top: 14px;
  align-self: flex-start;
}
.pill-btn.small:hover { background: rgba(45,36,24,0.12); }

.action-right {
  align-self: center;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 24px;
  padding: 22px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.recent-head {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 14px;
  color: var(--ink-3);
  margin-bottom: 14px;
}
.recent-row {
  display: grid;
  grid-template-columns: 8px 56px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(45,36,24,0.1);
  font-size: 14px;
}
.recent-row:last-of-type { border-bottom: 0; }
.r-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: linear-gradient(135deg, #f8d7c0, #c5704a);
}
.r-date { font-size: 12px; color: var(--ink-3); }
.r-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.r-amt { font-family: 'Fraunces', serif; font-weight: 500; font-size: 16px; }
.recent-more {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 13px;
  color: var(--ink-3);
  text-align: center;
  margin-top: 12px;
}

.stat-trio {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1.1fr;
  gap: 20px;
}
.stat-card {
  position: relative;
  border-radius: 30px;
  padding: 26px 28px 24px;
  border: 1px solid rgba(255,255,255,0.8);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow: 0 12px 36px -10px rgba(45,36,24,0.1);
  overflow: hidden;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.stat-card.peach    { background: linear-gradient(135deg, rgba(248,215,192,0.75), rgba(245,227,160,0.55)); }
.stat-card.pistachio{ background: linear-gradient(135deg, rgba(202,224,168,0.75), rgba(198,227,212,0.55)); }
.stat-card.lavender { background: linear-gradient(135deg, rgba(220,211,240,0.75), rgba(248,215,192,0.4)); }

.stat-cap {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 15px;
  color: var(--ink-2);
}
.stat-figure {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: 56px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 4px 0 8px;
  font-feature-settings: 'lnum';
  color: var(--ink);
}
.ccy { font-size: 30px; color: var(--ink-3); vertical-align: top; }
.cents { font-size: 26px; color: var(--ink-3); }
.big-pct { font-size: 80px; }
.pct-sign { font-size: 32px; color: var(--ink-3); margin-left: 4px; }
.stat-meta { font-size: 13px; color: var(--ink-2); }
.wave {
  width: calc(100% + 56px);
  height: 50px;
  margin: 14px -28px -24px;
  display: block;
}

.ring-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
}
.ring-meta { font-size: 13px; line-height: 1.4; }
.ring-meta b { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 500; }
.ring-meta .dim { color: var(--ink-3); }

.stmt-period {
  font-family: 'Fraunces', serif;
  font-size: 28px;
  font-weight: 400;
  letter-spacing: -0.01em;
  margin: 6px 0 14px;
  color: var(--ink);
}
.stmt-period.dim { color: var(--ink-3); font-size: 18px; }
.stmt-meta-row { display: flex; gap: 12px; align-items: center; font-size: 13px; }
.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f8d7c0, #c5704a);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fraunces', serif;
  font-size: 17px;
  box-shadow: 0 4px 10px rgba(45,36,24,0.15);
  flex-shrink: 0;
}
.stmt-uploader { color: var(--ink); }
.dim { color: var(--ink-3); font-size: 12px; }

.bottom-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 22px;
}
.big-card {
  position: relative;
  border-radius: 32px;
  padding: 30px 32px 32px;
  background: rgba(255,253,247,0.55);
  border: 1px solid rgba(255,255,255,0.8);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  box-shadow: 0 14px 44px -10px rgba(45,36,24,0.1), inset 0 0 0 1px rgba(255,255,255,0.45);
}
.bc-head { margin-bottom: 22px; }
.bc-title {
  font-family: 'Fraunces', serif;
  font-size: 28px;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.1;
  color: var(--ink);
}
.bc-sub {
  display: block;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 14px;
  color: var(--ink-3);
  margin-top: 2px;
}
.bc-empty {
  font-size: 14px;
  color: var(--ink-3);
  margin: 0;
}

.cat-list { display: flex; flex-direction: column; gap: 14px; }
.cat-name-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}
.cat-link {
  text-decoration: none;
  color: inherit;
  border-radius: 10px;
  transition: background 0.15s ease;
}
.cat-link:hover { background: rgba(45,36,24,0.05); }
.cat-bubble {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
}
.cat-name { flex: 1; font-weight: 500; font-size: 15px; color: var(--ink); }
.cat-amt { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 500; color: var(--ink); }
.cat-bar-wrap {
  height: 12px;
  background: rgba(45,36,24,0.06);
  border-radius: 999px;
  overflow: hidden;
}
.cat-bar-fill {
  height: 100%;
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
  transition: width 0.6s ease;
}

.merch-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.merch-li { display: flex; gap: 14px; align-items: center; }
.merch-link {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-decoration: none;
  color: inherit;
  border-radius: 14px;
  padding: 4px 6px;
  margin: -4px -6px;
  transition: background 0.15s ease;
}
.merch-link:hover { background: rgba(45,36,24,0.05); }
.m-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--ink);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 4px 12px rgba(45,36,24,0.08);
}
.m-main { flex: 1; min-width: 0; }
.m-name-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.m-name {
  font-weight: 500;
  font-size: 15px;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.m-amt { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 500; color: var(--ink); flex-shrink: 0; }
.m-visits { display: flex; align-items: center; gap: 3px; margin-top: 4px; }
.visit-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  opacity: 0.7;
}
.m-count {
  margin-left: 8px;
  font-size: 12px;
  color: var(--ink-3);
  font-family: 'Fraunces', serif;
  font-style: italic;
}

.dash-error {
  padding: 20px 24px;
  border-radius: 24px;
  background: rgba(245,180,160,0.4);
  border: 1px solid rgba(197,112,74,0.4);
  color: #6b3a1f;
  font-size: 15px;
}

.dash-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.dash-skeleton .sk-header,
.dash-skeleton .sk-action,
.dash-skeleton .sk-card {
  background: rgba(255,253,247,0.5);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 28px;
  animation: bloom-pulse 1.4s ease-in-out infinite;
}
.dash-skeleton .sk-header { height: 100px; }
.dash-skeleton .sk-action { height: 280px; }
.dash-skeleton .sk-trio { display: grid; grid-template-columns: 1.3fr 1fr 1.1fr; gap: 20px; }
.dash-skeleton .sk-card { height: 200px; }
@keyframes bloom-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

.dash-empty {
  text-align: center;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.dash-empty-mark {
  position: relative;
  width: 64px; height: 64px;
  margin-bottom: 8px;
}
.dash-empty-mark .petal {
  position: absolute;
  width: 26px; height: 40px;
  border-radius: 50% 50% 50% 50% / 80% 80% 20% 20%;
  left: 19px; top: 0;
  transform-origin: 50% 100%;
}
.dash-empty-mark .p1 { transform: rotate(0deg); background: #cae0a8; }
.dash-empty-mark .p2 { transform: rotate(120deg); background: #f8d7c0; }
.dash-empty-mark .p3 { transform: rotate(240deg); background: #dcd3f0; }
.dash-empty-mark .brand-core {
  position: absolute;
  width: 18px; height: 18px;
  background: #fdf9f0;
  border-radius: 50%;
  left: 23px; top: 23px;
  border: 2px solid var(--ink);
  z-index: 2;
}
.dash-empty h2 {
  font-family: 'Fraunces', serif;
  font-size: 36px;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--ink);
}
.dash-empty p {
  max-width: 460px;
  color: var(--ink-2);
  font-size: 15px;
  margin: 0;
}
.dash-empty-buttons { display: flex; gap: 10px; margin-top: 8px; }

@media (max-width: 980px) {
  .action-card { grid-template-columns: 1fr; }
  .stat-trio { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
  .huge-num { font-size: 120px; }
  .b-title { font-size: 44px; }
}
`;
