import { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, RotateCcw } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
import { formatMonthLabel, getCurrentMonth, isValidMonth } from './lib/format';
import { AllCaughtCard } from './components/AllCaughtCard';
import { CategoryBreakdownCard } from './components/CategoryBreakdownCard';
import { DashboardEmptyState } from './components/DashboardEmptyState';
import { DashboardErrorState } from './components/DashboardErrorState';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardLoadingState } from './components/DashboardLoadingState';
import { NeedsAttentionCard } from './components/NeedsAttentionCard';
import { SummaryStatsGrid } from './components/SummaryStatsGrid';
import { TopMerchantsCard } from './components/TopMerchantsCard';

const UploadModal = lazy(async () => {
  const module = await import('@/components/UploadModal');
  return { default: module.UploadModal };
});

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsSnapshot = searchParams.toString();
  const currentMonth = getCurrentMonth();
  const monthFromUrl = searchParams.get('month');
  const month = isValidMonth(monthFromUrl) ? monthFromUrl : currentMonth;
  const isCurrentMonth = month === currentMonth;

  const { stats, recentUncategorized, availableMonths, loading, error, fetchDashboard } =
    useDashboardData(month);
  const [uploadOpen, setUploadOpen] = useState(false);

  const categoryRows = useMemo(() => {
    const rows = stats?.data.byCategory ?? [];
    return rows.filter((r) => r.totalCents > 0).sort((a, b) => b.totalCents - a.totalCents);
  }, [stats]);

  const maxCategoryCents = categoryRows[0]?.totalCents ?? 1;
  const merchantRows = useMemo(() => stats?.data.topMerchants ?? [], [stats]);

  const uncategorizedCount = stats?.data.uncategorizedCount ?? 0;
  const monthTx = stats?.data.monthTransactionCount ?? 0;
  const totalTx = stats?.data.totalTransactionCount ?? 0;
  const categorizedCount = Math.max(0, monthTx - uncategorizedCount);
  const categorizedPct = monthTx > 0 ? Math.round((categorizedCount / monthTx) * 100) : 0;
  const totalSpentCents = stats?.data.totalSpentCents ?? 0;
  const latestStatement = stats?.meta?.latestStatement;
  const monthLabel = formatMonthLabel(month);

  const needsReviewHref = useMemo(
    () =>
      `/transactions?${new URLSearchParams({
        status: 'needs_review',
        month,
      }).toString()}`,
    [month],
  );
  const monthTransactionsHref = useMemo(
    () => `/transactions?${new URLSearchParams({ month }).toString()}`,
    [month],
  );

  const onPickMonth = useCallback((nextMonth: string) => {
    const next = new URLSearchParams(searchParamsSnapshot);
    if (nextMonth === currentMonth) {
      next.delete('month');
    } else {
      next.set('month', nextMonth);
    }
    setSearchParams(next, { replace: true });
  }, [currentMonth, searchParamsSnapshot, setSearchParams]);

  const openUpload = useCallback(() => {
    setUploadOpen(true);
  }, []);

  const closeUpload = useCallback(() => {
    setUploadOpen(false);
  }, []);

  const onUploadComplete = useCallback(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const renderUploadModal = uploadOpen ? (
    <Suspense fallback={null}>
      <UploadModal open={uploadOpen} onClose={closeUpload} onUploadComplete={onUploadComplete} />
    </Suspense>
  ) : null;

  if (error) {
    return <DashboardErrorState error={error} onRetry={() => void fetchDashboard()} />;
  }

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (totalTx === 0) {
    return (
      <>
        <DashboardEmptyState onUpload={openUpload} />
        {renderUploadModal}
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        month={month}
        monthLabel={monthLabel}
        isCurrentMonth={isCurrentMonth}
        availableMonths={availableMonths}
        onPickMonth={onPickMonth}
      />

      {uncategorizedCount > 0 ? (
        <NeedsAttentionCard
          uncategorizedCount={uncategorizedCount}
          monthLabel={monthLabel}
          needsReviewHref={needsReviewHref}
          recentUncategorized={recentUncategorized}
          month={month}
        />
      ) : monthTx === 0 ? (
        <AllCaughtCard
          tagClass="bg-pistachio/80 text-[#3d6b1f]"
          tagText={
            <>
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
              No activity
            </>
          }
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
          tagText={
            <>
              <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
              All caught up
            </>
          }
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

      <SummaryStatsGrid
        isCurrentMonth={isCurrentMonth}
        monthLabel={monthLabel}
        totalSpentCents={totalSpentCents}
        monthTx={monthTx}
        categorizedPct={categorizedPct}
        categorizedCount={categorizedCount}
        uncategorizedCount={uncategorizedCount}
        latestStatement={latestStatement}
        onUpload={openUpload}
      />

      <section className="grid grid-cols-1 gap-5.5 lg:grid-cols-[1.2fr_1fr]">
        <CategoryBreakdownCard
          categoryRows={categoryRows}
          maxCategoryCents={maxCategoryCents}
          month={month}
          monthTransactionsHref={monthTransactionsHref}
        />
        <TopMerchantsCard merchantRows={merchantRows} month={month} />
      </section>

      {renderUploadModal}
    </>
  );
}
