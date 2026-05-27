import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, RotateCcw } from 'lucide-react';
import { UploadModal } from '@/components/UploadModal';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import { formatMonthLabel, getCurrentMonth, isValidMonth } from './dashboard/lib/format';
import { AllCaughtCard } from './dashboard/components/AllCaughtCard';
import { CategoryBreakdownCard } from './dashboard/components/CategoryBreakdownCard';
import { DashboardEmptyState } from './dashboard/components/DashboardEmptyState';
import { DashboardErrorState } from './dashboard/components/DashboardErrorState';
import { DashboardHeader } from './dashboard/components/DashboardHeader';
import { DashboardLoadingState } from './dashboard/components/DashboardLoadingState';
import { NeedsAttentionCard } from './dashboard/components/NeedsAttentionCard';
import { SummaryStatsGrid } from './dashboard/components/SummaryStatsGrid';
import { TopMerchantsCard } from './dashboard/components/TopMerchantsCard';

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthFromUrl = searchParams.get('month');
  const month = isValidMonth(monthFromUrl) ? monthFromUrl : getCurrentMonth();
  const isCurrentMonth = month === getCurrentMonth();

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

  const needsReviewHref = `/transactions?${new URLSearchParams({
    status: 'needs_review',
    month,
  }).toString()}`;
  const monthTransactionsHref = `/transactions?${new URLSearchParams({ month }).toString()}`;

  const onPickMonth = (nextMonth: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextMonth === getCurrentMonth()) {
      next.delete('month');
    } else {
      next.set('month', nextMonth);
    }
    setSearchParams(next, { replace: true });
  };

  if (error) {
    return <DashboardErrorState error={error} onRetry={() => void fetchDashboard()} />;
  }

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (totalTx === 0) {
    return (
      <>
        <DashboardEmptyState onUpload={() => setUploadOpen(true)} />
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
        onUpload={() => setUploadOpen(true)}
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

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={() => void fetchDashboard()}
      />
    </>
  );
}
