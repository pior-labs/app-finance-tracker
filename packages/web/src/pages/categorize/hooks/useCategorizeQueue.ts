import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { useToast } from '@/hooks/useToast';
import { useUncategorizedCount } from '@/hooks/useUncategorizedCount';
import { removeFirstMatch } from '../lib/format';
import type {
  CategoriesResponse,
  Category,
  ConfirmedItem,
  Transaction,
  TransactionsResponse,
  TransactionStatsResponse,
  UndoAction,
} from '../types';

const CATEGORIES_QUERY = '/api/categories';
const QUEUE_QUERY = '/api/transactions?status=needs_review&limit=20';
const STATS_QUERY = '/api/transactions/stats';
const ANIMATION_MS = 200;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Failed to load categorize page (${response.status})`);
  }
  return (await response.json()) as T;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function getErrorMessage(...errors: unknown[]): string | null {
  for (const error of errors) {
    if (isAbortError(error)) continue;
    if (error instanceof Error) return error.message;
  }
  return null;
}

export function useCategorizeQueue() {
  const { pushToast } = useToast();
  const { adjust: adjustUncategorized } = useUncategorizedCount();
  const assignTimerRef = useRef<number | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const [queue, setQueue] = useState<Transaction[]>([]);
  const [confirmedList, setConfirmedList] = useState<ConfirmedItem[]>([]);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);

  const {
    data: categoryPayload,
    error: categoryError,
    isLoading: categoriesLoading,
    mutate: mutateCategories,
  } = useSWR<CategoriesResponse>(CATEGORIES_QUERY, fetchJson, {
    dedupingInterval: 10_000,
    shouldRetryOnError: false,
  });

  const {
    data: queuePayload,
    error: queueError,
    isLoading: queueLoading,
    mutate: mutateQueue,
  } = useSWR<TransactionsResponse>(QUEUE_QUERY, fetchJson, {
    dedupingInterval: 10_000,
    shouldRetryOnError: false,
  });

  const {
    data: statsPayload,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR<TransactionStatsResponse>(STATS_QUERY, fetchJson, {
    dedupingInterval: 10_000,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (!queuePayload) return;
    setQueue(queuePayload.data);
  }, [queuePayload]);

  useEffect(() => {
    return () => {
      if (assignTimerRef.current !== null) {
        window.clearTimeout(assignTimerRef.current);
      }
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const categories = useMemo(() => categoryPayload?.data ?? [], [categoryPayload]);
  const totalUncategorized = queuePayload?.pagination.total ?? 0;
  const totalTransactions = statsPayload?.data.totalTransactionCount ?? 0;
  const current = queue[0] ?? null;
  const upNext = useMemo(() => queue.slice(1), [queue]);
  const isAssigning = assigningId !== null;
  const isLocked = isAssigning || isUndoing;
  const error = getErrorMessage(categoryError, queueError, statsError);
  const loading = categoriesLoading || queueLoading || statsLoading;

  const refresh = useCallback(async () => {
    await Promise.all([mutateCategories(), mutateQueue(), mutateStats()]);
  }, [mutateCategories, mutateQueue, mutateStats]);

  const loadMoreQueue = useCallback(async () => {
    const morePayload = await fetchJson<TransactionsResponse>(QUEUE_QUERY);
    setQueue((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      return [...prev, ...morePayload.data.filter((t) => !existingIds.has(t.id))];
    });
  }, []);

  const rollbackAssign = useCallback((
    transaction: Transaction,
    categoryId: number,
  ) => {
    if (assignTimerRef.current !== null) {
      window.clearTimeout(assignTimerRef.current);
      assignTimerRef.current = null;
    }

    adjustUncategorized(1);
    setAssigningId(null);
    setQueue((prev) => (prev.some((tx) => tx.id === transaction.id) ? prev : [transaction, ...prev]));
    setConfirmedList((prev) => removeFirstMatch(prev, (item) => item.txId === transaction.id));
    setUndoStack((prev) => removeFirstMatch(prev, (action) => action.txId === transaction.id && action.categoryId === categoryId));
  }, [adjustUncategorized]);

  const assignCategory = useCallback(async (categoryId: number) => {
    if (!current || isLocked) return;
    const transaction = current;
    const category = categories.find((c) => c.id === categoryId);

    setAssigningId(transaction.id);
    adjustUncategorized(-1);
    setUndoStack((prev) => [{ txId: transaction.id, categoryId, transaction }, ...prev]);
    setConfirmedList((prev) => [
      {
        txId: transaction.id,
        merchant: transaction.merchant ?? transaction.description,
        category: category?.name ?? 'Unknown',
        categoryColor: category?.color ?? '#9c8a73',
        amount: transaction.amount,
        type: transaction.type,
        at: Date.now(),
      },
      ...prev,
    ]);

    assignTimerRef.current = window.setTimeout(() => {
      setQueue((prev) => prev.filter((tx) => tx.id !== transaction.id));
      setAssigningId(null);
      assignTimerRef.current = null;
    }, ANIMATION_MS);

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId, status: 'confirmed' }),
      });

      if (!response.ok) {
        rollbackAssign(transaction, categoryId);
        return;
      }
    } catch {
      rollbackAssign(transaction, categoryId);
      return;
    }

    if (queue.length <= 4) {
      await loadMoreQueue().catch(() => {});
    }
  }, [adjustUncategorized, categories, current, isLocked, loadMoreQueue, queue.length, rollbackAssign]);

  const skip = useCallback(() => {
    if (!current) return;
    setQueue((prev) => [...prev.slice(1), prev[0]]);
  }, [current]);

  const goBack = useCallback(() => {
    setQueue((prev) => {
      if (prev.length <= 1) return prev;
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, -1)];
    });
  }, []);

  const undo = useCallback(async () => {
    if (isLocked) return;
    const [lastAction, ...rest] = undoStack;
    if (!lastAction) return;
    const confirmedSnapshot = confirmedList.find((item) => item.txId === lastAction.txId);

    setIsUndoing(true);
    setUndoStack(rest);
    adjustUncategorized(1);

    undoTimerRef.current = window.setTimeout(() => {
      setConfirmedList((prev) => removeFirstMatch(prev, (item) => item.txId === lastAction.txId));
      setQueue((prev) =>
        prev.some((tx) => tx.id === lastAction.txId) ? prev : [lastAction.transaction, ...prev],
      );
      setIsUndoing(false);
      undoTimerRef.current = null;
    }, ANIMATION_MS);

    const revert = () => {
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
      adjustUncategorized(-1);
      setIsUndoing(false);
      setQueue((prev) => removeFirstMatch(prev, (tx) => tx.id === lastAction.txId));
      if (confirmedSnapshot) {
        setConfirmedList((prev) =>
          prev.some((item) => item.txId === lastAction.txId) ? prev : [confirmedSnapshot, ...prev],
        );
      }
      setUndoStack((prev) => [lastAction, ...prev]);
      pushToast({
        variant: 'error',
        title: 'Undo failed',
        description: `We couldn't uncategorize this transaction. Please try again.`,
      });
    };

    try {
      const response = await fetch(`/api/transactions/${lastAction.txId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: null, status: 'needs_review' }),
      });
      if (!response.ok) revert();
    } catch {
      revert();
    }
  }, [adjustUncategorized, confirmedList, isLocked, pushToast, undoStack]);

  return {
    categories,
    queue,
    current,
    upNext,
    totalUncategorized,
    totalTransactions,
    confirmedList,
    undoStack,
    loading,
    error,
    isLocked,
    assignCategory,
    skip,
    goBack,
    undo,
    refresh,
  };
}
