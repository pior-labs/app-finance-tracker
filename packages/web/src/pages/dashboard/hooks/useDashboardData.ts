import { useCallback, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { isValidMonth } from '../lib/format';
import type { DashboardStatsResponse, RecentTransaction } from '../types';

export function useDashboardData(month: string | null) {
  const controllersRef = useRef<Set<AbortController>>(new Set());

  const fetchJson = useCallback(async <T>(url: string): Promise<T> => {
    const controller = new AbortController();
    controllersRef.current.add(controller);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          (payload as { error?: string }).error ?? `Failed to load dashboard (${response.status})`,
        );
      }

      return (await response.json()) as T;
    } finally {
      controllersRef.current.delete(controller);
    }
  }, []);

  useEffect(() => {
    return () => {
      for (const controller of controllersRef.current) {
        controller.abort();
      }
      controllersRef.current.clear();
    };
  }, []);

  const statsQuery = month
    ? `/api/transactions/stats?${new URLSearchParams({ month }).toString()}`
    : '/api/transactions/stats';

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR<DashboardStatsResponse>(statsQuery, fetchJson, {
    dedupingInterval: 10_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const activeMonth = statsData?.meta.month ?? month;
  const uncategorizedQuery = activeMonth
    ? `/api/transactions?${new URLSearchParams({
        status: 'needs_review',
        limit: '3',
        month: activeMonth,
      }).toString()}`
    : null;

  const {
    data: recentData,
    error: recentError,
    isLoading: recentLoading,
    mutate: mutateRecent,
  } = useSWR<{ data: RecentTransaction[] }>(uncategorizedQuery, fetchJson, {
    dedupingInterval: 10_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const stats = statsData ?? null;
  const recentUncategorized = recentData?.data ?? [];

  const availableMonths = useMemo(() => {
    if (!statsData) {
      return month && isValidMonth(month) ? [month] : [];
    }

    const months = new Set([month, statsData.meta.month, ...(statsData.meta.availableMonths ?? [])]);

    return Array.from(months)
      .filter((candidate) => isValidMonth(candidate))
      .sort((a, b) => b.localeCompare(a));
  }, [month, statsData]);

  const isAbortedError = (error: unknown): boolean => {
    return error instanceof Error && error.name === 'AbortError';
  };

  const error = isAbortedError(statsError)
    ? null
    : statsError instanceof Error
      ? statsError.message
      : isAbortedError(recentError)
        ? null
        : recentError instanceof Error
          ? recentError.message
          : null;

  const loading = statsLoading || recentLoading || !statsData;

  const fetchDashboard = useCallback(async () => {
    await Promise.all([mutateStats(), mutateRecent()]);
  }, [mutateRecent, mutateStats]);

  return {
    stats,
    recentUncategorized,
    availableMonths,
    loading,
    error,
    fetchDashboard,
  };
}
