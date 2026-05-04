import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryBar } from '@/components/CategoryBar';
import { StatCard } from '@/components/StatCard';

interface CategorySpending {
  category: string;
  totalCents: number;
}

interface DashboardStatsResponse {
  data: {
    totalSpentCents: number;
    uncategorizedCount: number;
    totalTransactionCount: number;
    byCategory: CategorySpending[];
  };
}

function formatMoney(cents: number): string {
  const absoluteValue = Math.abs(cents) / 100;
  const formatted = absoluteValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/transactions/stats', {
          credentials: 'include'
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = (payload as { error?: string }).error ?? `Failed to load dashboard (${response.status})`;
          throw new Error(message);
        }

        const payload = (await response.json()) as DashboardStatsResponse;
        setStats(payload);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const categoryRows = useMemo(() => {
    const rows = stats?.data.byCategory ?? [];
    return rows.filter((row) => row.totalCents > 0).sort((left, right) => right.totalCents - left.totalCents);
  }, [stats]);

  const maxCategoryCents = categoryRows[0]?.totalCents ?? 0;
  const spentThisMonth = stats ? formatMoney(stats.data.totalSpentCents) : '$0.00';
  const uncategorizedCount = stats ? stats.data.uncategorizedCount : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <StatCard label="Spent this month" value={loading ? '...' : spentThisMonth} />
        <Link to="/transactions?status=needs_review" className="block">
          <StatCard
            label="Needs review"
            value={loading ? '...' : String(uncategorizedCount)}
            hint="View uncategorized transactions"
            className="h-full transition hover:border-[var(--primary)]"
          />
        </Link>
      </section>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-[var(--destructive)]">{error}</CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">Loading category breakdown...</CardContent>
        </Card>
      ) : stats && stats.data.totalTransactionCount === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No transactions yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">Upload your first statement.</p>
            <Button asChild>
              <Link to="/upload">Go to upload</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryRows.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No categorized spending yet.</p>
            ) : (
              categoryRows.map((category) => (
                <CategoryBar
                  key={category.category}
                  label={category.category}
                  amount={formatMoney(category.totalCents)}
                  value={maxCategoryCents > 0 ? (category.totalCents / maxCategoryCents) * 100 : 0}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
