import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useUncategorizedCount } from '@/hooks/useUncategorizedCount';
import { buildTransactionQuery, getCurrentMonth, getErrorMessage, isValidMonth } from '../lib/format';
import type {
  Category,
  CategoryResponse,
  StatsResponse,
  TransactionFilters,
  TransactionListItem,
  TransactionsResponse,
  TransactionUpdatePayload,
} from '../types';

const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_TRANSACTIONS: TransactionListItem[] = [];

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Failed to load transactions (${response.status})`);
  }

  return (await response.json()) as T;
}

async function patchTransaction(
  transactionId: number,
  updatePayload: {
    category_id?: number | null;
    status?: 'needs_review' | 'confirmed';
    merchant?: string | null;
    description?: string;
  },
): Promise<TransactionUpdatePayload> {
  const response = await fetch(`/api/transactions/${transactionId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Failed to update transaction (${response.status})`);
  }

  const payload = (await response.json()) as { data: TransactionUpdatePayload };
  return payload.data;
}

async function deleteTransaction(transactionId: number): Promise<void> {
  const response = await fetch(`/api/transactions/${transactionId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Failed to delete transaction (${response.status})`);
  }
}

function updateTransactionList(
  transactions: TransactionListItem[],
  transactionId: number,
  payload: TransactionUpdatePayload,
): TransactionListItem[] {
  return transactions.map((item) =>
    item.id === transactionId
      ? {
          ...item,
          description: payload.description,
          merchant: payload.merchant,
          categoryId: payload.categoryId,
          categoryName: payload.categoryName,
          status: payload.status,
        }
      : item,
  );
}

export function useTransactionsData(filters: TransactionFilters) {
  const { adjust: adjustUncategorized } = useUncategorizedCount();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [updatingTransactionIds, setUpdatingTransactionIds] = useState<Set<number>>(() => new Set());
  const [deletingTransactionIds, setDeletingTransactionIds] = useState<Set<number>>(() => new Set());

  const transactionsQuery = useMemo(() => buildTransactionQuery(filters), [filters]);

  const {
    data: categoriesPayload,
    error: categoriesError,
    isLoading: categoriesLoading,
    mutate: mutateCategories,
  } = useSWR<CategoryResponse>('/api/categories', fetchJson, {
    dedupingInterval: 10_000,
    shouldRetryOnError: false,
  });

  const {
    data: statsPayload,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR<StatsResponse>('/api/transactions/stats', fetchJson, {
    dedupingInterval: 10_000,
    shouldRetryOnError: false,
  });

  const {
    data: transactionsPayload,
    error: transactionsError,
    isLoading: transactionsLoading,
    isValidating: transactionsValidating,
    mutate: mutateTransactions,
  } = useSWR<TransactionsResponse>(transactionsQuery, fetchJson, {
    dedupingInterval: 10_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const categories = useMemo(() => categoriesPayload?.data ?? EMPTY_CATEGORIES, [categoriesPayload]);
  const transactions = transactionsPayload?.data ?? EMPTY_TRANSACTIONS;
  const total = transactionsPayload?.pagination.total ?? 0;

  const availableMonths = useMemo(() => {
    const months = [
      filters.month,
      getCurrentMonth(),
      statsPayload?.meta.month,
      ...(statsPayload?.meta.availableMonths ?? []),
    ].filter((month): month is string => typeof month === 'string' && isValidMonth(month));

    return Array.from(new Set(months)).sort((a, b) => b.localeCompare(a));
  }, [filters.month, statsPayload]);

  const error = mutationError ?? getErrorMessage(categoriesError, statsError, transactionsError);
  const loading =
    categoriesLoading ||
    statsLoading ||
    transactionsLoading ||
    (!transactionsPayload && transactionsValidating);

  const refresh = useCallback(async () => {
    setMutationError(null);
    await Promise.all([mutateCategories(), mutateStats(), mutateTransactions()]);
  }, [mutateCategories, mutateStats, mutateTransactions]);

  const assignCategory = useCallback(async (transaction: TransactionListItem, selectedValue: string) => {
    const selectedCategoryId = selectedValue === 'uncategorized' ? null : Number(selectedValue);
    if (
      selectedValue !== 'uncategorized' &&
      (!Number.isFinite(selectedCategoryId) || (selectedCategoryId as number) <= 0)
    ) {
      return;
    }
    if (selectedCategoryId === transaction.categoryId && transaction.status === 'confirmed') return;

    setUpdatingTransactionIds((prev) => new Set(prev).add(transaction.id));
    setMutationError(null);

    try {
      const payload = await patchTransaction(transaction.id, {
        category_id: selectedCategoryId,
        status: selectedCategoryId === null ? 'needs_review' : 'confirmed',
      });
      if (transaction.status !== payload.status) {
        adjustUncategorized(payload.status === 'needs_review' ? 1 : -1);
      }
      void mutateTransactions((current) => {
        if (!current) return current;
        return {
          ...current,
          data: updateTransactionList(current.data, transaction.id, payload),
        };
      }, { revalidate: false });
    } catch (updateError) {
      setMutationError(updateError instanceof Error ? updateError.message : 'Failed to update transaction');
    } finally {
      setUpdatingTransactionIds((prev) => {
        const next = new Set(prev);
        next.delete(transaction.id);
        return next;
      });
    }
  }, [adjustUncategorized, mutateTransactions]);

  const updateTransactionDetails = useCallback(async (
    transaction: TransactionListItem,
    details: { merchant: string; description: string },
  ) => {
    setMutationError(null);
    const description = details.description.trim();
    const merchant = details.merchant.trim();

    if (!description) {
      setMutationError('Description is required.');
      return false;
    }

    if (description === transaction.description && merchant === (transaction.merchant ?? '')) {
      return true;
    }

    setUpdatingTransactionIds((prev) => new Set(prev).add(transaction.id));

    try {
      const payload = await patchTransaction(transaction.id, {
        description,
        merchant: merchant || null,
      });
      void mutateTransactions((current) => {
        if (!current) return current;
        return {
          ...current,
          data: updateTransactionList(current.data, transaction.id, payload),
        };
      }, { revalidate: false });
      return true;
    } catch (updateError) {
      setMutationError(updateError instanceof Error ? updateError.message : 'Failed to update transaction');
      return false;
    } finally {
      setUpdatingTransactionIds((prev) => {
        const next = new Set(prev);
        next.delete(transaction.id);
        return next;
      });
    }
  }, [mutateTransactions]);

  const removeTransaction = useCallback(async (transaction: TransactionListItem) => {
    setMutationError(null);
    setDeletingTransactionIds((prev) => new Set(prev).add(transaction.id));

    try {
      await deleteTransaction(transaction.id);
      if (transaction.status === 'needs_review') {
        adjustUncategorized(-1);
      }
      void mutateTransactions((current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((item) => item.id !== transaction.id),
          pagination: {
            ...current.pagination,
            total: Math.max(0, current.pagination.total - 1),
          },
        };
      }, { revalidate: false });
      return true;
    } catch (deleteError) {
      setMutationError(deleteError instanceof Error ? deleteError.message : 'Failed to delete transaction');
      return false;
    } finally {
      setDeletingTransactionIds((prev) => {
        const next = new Set(prev);
        next.delete(transaction.id);
        return next;
      });
    }
  }, [adjustUncategorized, mutateTransactions]);

  const shouldMoveToPreviousPageAfterDelete = transactions.length === 1 && filters.offset > 0;

  return {
    categories,
    availableMonths,
    transactions,
    total,
    loading,
    error,
    updatingTransactionIds,
    deletingTransactionIds,
    shouldMoveToPreviousPageAfterDelete,
    refresh,
    assignCategory,
    updateTransactionDetails,
    removeTransaction,
    mutateTransactions,
  };
}
