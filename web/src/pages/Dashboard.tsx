import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadModal } from '@/components/UploadModal';

interface CategorySpending {
  category: string;
  totalCents: number;
}

interface MerchantSpending {
  merchant: string;
  totalCents: number;
}

interface DashboardStatsResponse {
  data: {
    totalSpentCents: number;
    uncategorizedCount: number;
    totalTransactionCount: number;
    categorizedPercent: number;
    byCategory: CategorySpending[];
    topMerchants: MerchantSpending[];
  };
  meta: {
    month: string;
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

function formatMoney(cents: number): string {
  const value = Math.abs(cents) / 100;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [recentUncategorized, setRecentUncategorized] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, txRes] = await Promise.all([
        fetch('/api/transactions/stats', { credentials: 'include' }),
        fetch('/api/transactions?status=needs_review&limit=3', { credentials: 'include' }),
      ]);
      if (!statsRes.ok) {
        const payload = await statsRes.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to load dashboard (${statsRes.status})`);
      }
      const statsPayload = (await statsRes.json()) as DashboardStatsResponse;
      setStats(statsPayload);
      if (txRes.ok) {
        const txPayload = (await txRes.json()) as { data: RecentTransaction[] };
        setRecentUncategorized(txPayload.data);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
  }, []);

  const categoryRows = useMemo(() => {
    const rows = stats?.data.byCategory ?? [];
    return rows.filter((r) => r.totalCents > 0).sort((a, b) => b.totalCents - a.totalCents);
  }, [stats]);

  const maxCategoryCents = categoryRows[0]?.totalCents ?? 1;

  const merchantRows = useMemo(() => {
    return stats?.data.topMerchants ?? [];
  }, [stats]);

  const uncategorizedCount = stats?.data.uncategorizedCount ?? 0;
  const totalTx = stats?.data.totalTransactionCount ?? 0;
  const categorizedPct = totalTx > 0 ? Math.round(((totalTx - uncategorizedCount) / totalTx) * 100) : 0;
  const totalSpent = stats ? formatMoney(stats.data.totalSpentCents) : '$0.00';
  const latestStatement = stats?.meta?.latestStatement;

  if (error) {
    return (
      <Card>
        <CardContent className="p-5 text-[var(--destructive)]">{error}</CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-[var(--radius)] bg-[var(--muted)]" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-28 animate-pulse rounded-[var(--radius)] bg-[var(--muted)]" />
          <div className="h-28 animate-pulse rounded-[var(--radius)] bg-[var(--muted)]" />
          <div className="h-28 animate-pulse rounded-[var(--radius)] bg-[var(--muted)]" />
        </div>
      </div>
    );
  }

  /* Empty state — friendly, not blank */
  if (totalTx === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-20 text-center">
        {/* Sketchy sun face */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[1.5px] border-[var(--border)] bg-[var(--primary-soft)]">
          <span className="font-hand text-3xl text-[var(--primary)]">:)</span>
        </div>
        <h2 className="font-hand text-3xl">Nothing here yet — and that's okay.</h2>
        <p className="max-w-md text-sm text-[var(--muted-foreground)]">
          Upload your first bank statement and we'll show you a friendly month-at-a-glance picture of your household spending.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setUploadOpen(true)}>Upload statement →</Button>
          <Button variant="ghost">See an example</Button>
        </div>
        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploadComplete={() => void fetchDashboard()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ACTION CARD — full-width, warm accent background */}
      {uncategorizedCount > 0 && (
        <Card className="bg-[var(--primary-soft)]">
          <CardContent className="flex items-center gap-5 p-5">
            <div className="flex-1 space-y-2">
              <p className="text-[13px] uppercase tracking-widest text-[var(--muted-foreground)]">Action needed</p>
              <div className="font-hand text-5xl text-[var(--primary)]">{uncategorizedCount} left</div>
              <p className="text-[15px]">Categorize these to complete your monthly picture.</p>
              <div className="mt-2 flex gap-2">
                <Button asChild>
                  <Link to="/categorize">Categorize now →</Link>
                </Button>
                <Button variant="ghost">Skip for now</Button>
              </div>
            </div>
            {recentUncategorized.length > 0 && (
              <div className="hidden w-[340px] flex-col gap-2 md:flex">
                {recentUncategorized.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-[var(--radius-sm)] border-[1.3px] border-[var(--border)] bg-[var(--card)] px-3 py-2.5 shadow-[var(--shadow-sketch-sm)]"
                  >
                    <span className="w-[50px] text-xs text-[var(--muted-foreground)]">{t.date}</span>
                    <span className="flex-1 truncate text-sm font-bold">{t.merchant ?? t.description}</span>
                    <span className="font-bold">−{formatMoney(t.amount)}</span>
                  </div>
                ))}
                <div className="text-center text-[13px] text-[var(--muted-foreground)]">
                  + {Math.max(0, uncategorizedCount - recentUncategorized.length)} more
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STATS ROW — three cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Spent */}
        <Card>
          <CardContent className="space-y-1 p-5">
            <div className="text-sm font-bold text-[var(--muted-foreground)]">Spent this month</div>
            <div className="font-hand text-4xl">{totalSpent}</div>
            <div className="text-[13px] text-[var(--muted-foreground)]">{totalTx} transactions</div>
          </CardContent>
        </Card>

        {/* Categorized */}
        <Card>
          <CardContent className="space-y-1 p-5">
            <div className="text-sm font-bold text-[var(--muted-foreground)]">Categorized</div>
            <div className="font-hand text-4xl">
              {categorizedPct}<span className="text-lg text-[var(--muted-foreground)]">%</span>
            </div>
            <Progress value={categorizedPct} variant="good" className="mt-2" />
          </CardContent>
        </Card>

        {/* Latest statement */}
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-[6px] border-[1.3px] border-dashed border-[var(--muted-foreground)] thumb-hatch text-[10px] font-bold text-[var(--muted-foreground)]">
              PDF
            </div>
            <div className="min-w-0 flex-1">
              {latestStatement ? (
                <>
                  <div className="truncate font-bold">
                    {latestStatement.periodStart && latestStatement.periodEnd
                      ? `${latestStatement.periodStart} – ${latestStatement.periodEnd}`
                      : 'Latest statement'}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {latestStatement.transactionCount} tx · uploaded by {latestStatement.uploadedByName}
                  </p>
                </>
              ) : (
                <div className="text-sm text-[var(--muted-foreground)]">No statements yet</div>
              )}
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-1 text-xs font-bold text-[var(--primary)] hover:underline"
              >
                Upload next →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM — spending by category + top merchants */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Spending by category */}
        <Card>
          <CardContent className="p-5">
            <h3 className="scribble mb-4 inline-block font-hand text-xl">Spending by category</h3>
            {categoryRows.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No categorized spending yet.</p>
            ) : (
              <div className="space-y-3">
                {categoryRows.slice(0, 6).map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">{cat.category}</span>
                      <span className="font-bold">{formatMoney(cat.totalCents)}</span>
                    </div>
                    <Progress value={(cat.totalCents / maxCategoryCents) * 100} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top merchants */}
        <Card>
          <CardContent className="p-5">
            <h3 className="scribble mb-4 inline-block font-hand text-xl">Top merchants</h3>
            {merchantRows.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No merchant data yet.</p>
            ) : (
              <div className="space-y-3">
                {merchantRows.slice(0, 5).map((m, i) => (
                  <div
                    key={m.merchant}
                    className="flex items-center gap-3"
                    style={{ borderBottom: i < 4 ? '1.2px dashed var(--border-soft)' : 'none', paddingBottom: i < 4 ? 8 : 0 }}
                  >
                    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-[1.3px] border-[var(--border)] bg-[var(--card)] font-hand text-sm">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-[15px] font-bold">{m.merchant}</span>
                    <span className="font-bold">{formatMoney(m.totalCents)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploadComplete={() => void fetchDashboard()} />
    </div>
  );
}
