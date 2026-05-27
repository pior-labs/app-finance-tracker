import { useCallback, useEffect, useState } from 'react';
import { getCurrentMonth, isValidMonth } from '../lib/format';
import type { DashboardStatsResponse, RecentTransaction } from '../types';

export function useDashboardData(month: string) {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [recentUncategorized, setRecentUncategorized] = useState<RecentTransaction[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    stats,
    recentUncategorized,
    availableMonths,
    loading,
    error,
    fetchDashboard,
  };
}
