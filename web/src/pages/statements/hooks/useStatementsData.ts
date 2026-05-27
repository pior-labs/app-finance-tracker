import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useToast } from '@/hooks/useToast';
import { sortStatementsByCreatedAt } from '../lib/format';
import type {
  ReparseStatementResponse,
  StatementListItem,
  StatementsResponse,
  StatementTransactionsResponse,
} from '../types';

const EMPTY_STATEMENTS: StatementListItem[] = [];

async function fetchJson<T>(url: string, fallbackMessage = 'Failed to load statements'): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `${fallbackMessage} (${response.status})`);
  }

  return (await response.json()) as T;
}

async function reparseStatementRequest(statementId: number): Promise<ReparseStatementResponse> {
  const response = await fetch(`/api/statements/${statementId}/reparse`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Failed to re-parse statement (${response.status})`);
  }

  return (await response.json()) as ReparseStatementResponse;
}

async function deleteStatementRequest(statementId: number): Promise<void> {
  const response = await fetch(`/api/statements/${statementId}`, { method: 'DELETE', credentials: 'include' });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Failed to delete statement (${response.status})`);
  }
}

function getErrorMessage(...errors: unknown[]): string | null {
  const error = errors.find(Boolean);
  if (!error) return null;
  return error instanceof Error ? error.message : 'Failed to load statements';
}

function setPendingId(setIds: Dispatch<SetStateAction<Set<number>>>, statementId: number, pending: boolean) {
  setIds((previous) => {
    const next = new Set(previous);
    if (pending) next.add(statementId);
    else next.delete(statementId);
    return next;
  });
}

export function useStatementsData() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [viewingStatementIds, setViewingStatementIds] = useState<Set<number>>(() => new Set());
  const [reparsingStatementIds, setReparsingStatementIds] = useState<Set<number>>(() => new Set());
  const [deletingStatementIds, setDeletingStatementIds] = useState<Set<number>>(() => new Set());

  const {
    data: statementsPayload,
    error: statementsError,
    isLoading,
    isValidating,
    mutate: mutateStatements,
  } = useSWR<StatementsResponse>('/api/statements', fetchJson, {
    dedupingInterval: 10_000,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const statements = statementsPayload?.data ?? EMPTY_STATEMENTS;
  const sortedStatements = useMemo(() => sortStatementsByCreatedAt(statements), [statements]);
  const totalTransactions = useMemo(
    () => statements.reduce((sum, statement) => sum + statement.transactionCount, 0),
    [statements],
  );

  const pendingStatementIds = useMemo(
    () => new Set([...viewingStatementIds, ...reparsingStatementIds, ...deletingStatementIds]),
    [deletingStatementIds, reparsingStatementIds, viewingStatementIds],
  );

  const loading = isLoading || (!statementsPayload && isValidating);
  const error = mutationError ?? getErrorMessage(statementsError);

  const refresh = useCallback(async () => {
    setMutationError(null);
    await mutateStatements();
  }, [mutateStatements]);

  const viewStatementTransactions = useCallback(async (statementId: number) => {
    setMutationError(null);
    setPendingId(setViewingStatementIds, statementId, true);

    try {
      const payload = await fetchJson<StatementTransactionsResponse>(
        `/api/statements/${statementId}/transactions`,
        'Failed to load statement transactions',
      );
      const firstTransaction = payload.data[0];
      if (!firstTransaction) {
        throw new Error('No transactions found for this statement.');
      }

      const month = firstTransaction.date.slice(0, 7);
      const params = new URLSearchParams({ focus: String(firstTransaction.id) });
      if (/^\d{4}-\d{2}$/.test(month)) params.set('month', month);
      navigate(`/transactions?${params.toString()}`);
    } catch (viewError) {
      setMutationError(viewError instanceof Error ? viewError.message : 'Failed to view statement transactions');
    } finally {
      setPendingId(setViewingStatementIds, statementId, false);
    }
  }, [navigate]);

  const reparseStatement = useCallback(async (statementId: number) => {
    setMutationError(null);
    setPendingId(setReparsingStatementIds, statementId, true);

    try {
      const payload = await reparseStatementRequest(statementId);
      const insertedCount = payload.meta?.insertedTransactions;
      await mutateStatements();
      pushToast({
        variant: 'success',
        title: 'Statement re-parsed',
        description:
          typeof insertedCount === 'number'
            ? `${insertedCount} ${insertedCount === 1 ? 'transaction' : 'transactions'} refreshed.`
            : 'Transactions refreshed with the latest parser.',
      });
    } catch (reparseError) {
      setMutationError(reparseError instanceof Error ? reparseError.message : 'Failed to re-parse statement');
    } finally {
      setPendingId(setReparsingStatementIds, statementId, false);
    }
  }, [mutateStatements, pushToast]);

  const deleteStatement = useCallback(async (statementId: number) => {
    setMutationError(null);
    setPendingId(setDeletingStatementIds, statementId, true);

    try {
      await deleteStatementRequest(statementId);
      await mutateStatements((current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((statement) => statement.id !== statementId),
        };
      }, { revalidate: true });
    } catch (deleteError) {
      setMutationError(deleteError instanceof Error ? deleteError.message : 'Failed to delete statement');
    } finally {
      setPendingId(setDeletingStatementIds, statementId, false);
    }
  }, [mutateStatements]);

  return {
    statements,
    sortedStatements,
    totalTransactions,
    loading,
    error,
    viewingStatementIds,
    reparsingStatementIds,
    deletingStatementIds,
    pendingStatementIds,
    refresh,
    viewStatementTransactions,
    reparseStatement,
    deleteStatement,
  };
}
