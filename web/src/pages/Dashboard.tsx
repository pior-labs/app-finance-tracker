import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { CategoryBar } from '@/components/CategoryBar';
import { Select, type SelectOption } from '@/components/ui/select';

interface CategorySpending {
  category: string;
  totalCents: number;
}

interface DashboardStatsResponse {
  data: {
    totalSpentCents: number;
    uncategorizedCount: number;
    monthTransactionCount: number;
    totalTransactionCount: number;
    byCategory: CategorySpending[];
  };
  meta: {
    month: string;
    availableMonths: string[];
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

function formatMonthLabel(month: string): string {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return month;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function isMonthValue(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}$/.test(value);
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(() => {
    const monthParam = searchParams.get('month');
    return isMonthValue(monthParam) ? monthParam : null;
  });
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (selectedMonth) {
          params.set('month', selectedMonth);
        }

        const response = await fetch(`/api/transactions/stats${params.toString() ? `?${params.toString()}` : ''}`, {
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
  }, [selectedMonth]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedMonth) {
      params.set('month', selectedMonth);
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedMonth, searchParams, setSearchParams]);

  const categoryRows = useMemo(() => {
    const rows = stats?.data.byCategory ?? [];
    return rows.filter((row) => row.totalCents > 0).sort((left, right) => right.totalCents - left.totalCents);
  }, [stats]);

  const monthOptions = useMemo<SelectOption[]>(() => {
    if (!stats) {
      return [];
    }

    const uniqueMonths = [stats.meta.month, ...stats.meta.availableMonths].filter(
      (value, index, values) => values.indexOf(value) === index
    );

    return uniqueMonths.map((month) => ({
      value: month,
      label: formatMonthLabel(month)
    }));
  }, [stats]);

  const maxCategoryCents = categoryRows[0]?.totalCents ?? 0;
  const spentThisMonth = stats ? formatMoney(stats.data.totalSpentCents) : '$0.00';
  const uncategorizedCount = stats ? stats.data.uncategorizedCount : 0;
  const monthLabel = stats ? formatMonthLabel(stats.meta.month) : 'Selected month';
  const needsReviewLink = stats ? `/transactions?status=needs_review&month=${stats.meta.month}` : '/transactions?status=needs_review';

  return (
    <div className="space-y-6">
      <section>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Month</CardTitle>
            <CardDescription>Switch dashboard metrics to a different statement month.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              options={monthOptions}
              value={stats?.meta.month ?? ''}
              onChange={(event) => setSelectedMonth(event.target.value)}
              disabled={loading || monthOptions.length === 0}
              aria-label="Dashboard month"
              className="max-w-xs"
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Spent this month"
          value={loading ? '...' : spentThisMonth}
          hint={loading ? 'Loading monthly total...' : monthLabel}
        />
        <Link to={needsReviewLink} className="block">
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
            <CardDescription className="text-[var(--destructive)]">{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
            <CardDescription>Loading category breakdown...</CardDescription>
          </CardHeader>
        </Card>
      ) : stats && stats.data.totalTransactionCount === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No transactions yet</CardTitle>
            <CardDescription>Upload your first statement.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/upload">Go to upload</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Spending by category</CardTitle>
              <CardDescription>Current month categorized spending.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && stats.data.monthTransactionCount === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No transactions found for {monthLabel}.
                </p>
              ) : categoryRows.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No categorized spending for {monthLabel} yet.
                </p>
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
        </section>
      )}
    </div>
  );
}
