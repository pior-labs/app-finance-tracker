import { useCallback, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { getCurrentMonth, isValidMonth } from '../lib/format';
import type { DashboardStatsResponse, RecentTransaction } from '../types';

export function useDashboardData(month: string) {
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
    for (const controller of controllersRef.current) {
      controller.abort();
    }
    controllersRef.current.clear();
  }, [month]);

  useEffect(() => {
    return () => {
      for (const controller of controllersRef.current) {
        controller.abort();
      }
      controllersRef.current.clear();
    };
  }, []);

  const statsQuery = `/api/transactions/stats?${new URLSearchParams({ month }).toString()}`;
  const uncategorizedQuery = `/api/transactions?${new URLSearchParams({
    status: 'needs_review',
    limit: '3',
    month,
  }).toString()}`;

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    isValidating: statsValidating,
    mutate: mutateStats,
  } = useSWR<DashboardStatsResponse>(statsQuery, fetchJson, {
    dedupingInterval: 10_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const {
    data: recentData,
    error: recentError,
    isLoading: recentLoading,
    isValidating: recentValidating,
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
      return [month, getCurrentMonth()].filter((candidate, index, array) => {
        return isValidMonth(candidate) && array.indexOf(candidate) === index;
      });
    }

    const months = new Set<string>([
      getCurrentMonth(),
      month,
      statsData.meta.month,
      ...(statsData.meta.availableMonths ?? []),
    ]);

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

  const loading = statsLoading || recentLoading || (!statsData && (statsValidating || recentValidating));

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
