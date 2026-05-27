import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TransactionsDesktopTable } from './components/TransactionsDesktopTable';
import { TransactionsErrorBanner } from './components/TransactionsErrorBanner';
import { TransactionsFilters } from './components/TransactionsFilters';
import { TransactionsHeader } from './components/TransactionsHeader';
import { TransactionsMobileList } from './components/TransactionsMobileList';
import { TransactionsPagination } from './components/TransactionsPagination';
import { useTransactionsData } from './hooks/useTransactionsData';
import { MERCHANT_DEBOUNCE_MS, PAGE_SIZE } from './lib/constants';
import {
  buildCategoryColorMap,
  buildCategoryFilterOptions,
  buildMonthOptions,
  buildRowCategoryOptions,
  formatMonthLabel,
  formatShortDate,
  isValidMonth,
} from './lib/format';
import type { TransactionFilters, TransactionListItem } from './types';

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsSnapshot = searchParams.toString();
  const focusParam = searchParams.get('focus');

  const [month, setMonth] = useState(() => {
    const fromQuery = searchParams.get('month');
    if (fromQuery === 'all') return 'all';
    return isValidMonth(fromQuery) ? fromQuery : 'all';
  });
  const [category, setCategory] = useState(() => searchParams.get('category') ?? 'all');
  const [status, setStatus] = useState(() => {
    const raw = searchParams.get('status');
    return raw && ['all', 'needs_review', 'confirmed'].includes(raw) ? raw : 'all';
  });
  const [merchant, setMerchant] = useState(() => searchParams.get('merchant') ?? '');
  const [debouncedMerchant, setDebouncedMerchant] = useState(() => searchParams.get('merchant') ?? '');
  const [offset, setOffset] = useState(0);
  const [rowHeightPx, setRowHeightPx] = useState<number | null>(null);
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null);

  const tableViewportRef = useRef<HTMLDivElement | null>(null);
  const categorySelectRefs = useRef<Map<number, HTMLSelectElement>>(new Map());
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());

  const filters = useMemo<TransactionFilters>(
    () => ({ month, category, status, merchant: debouncedMerchant, offset }),
    [category, debouncedMerchant, month, offset, status],
  );

  const {
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
    markForReview,
    removeTransaction,
    mutateTransactions,
  } = useTransactionsData(filters);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedMerchant(merchant);
    }, MERCHANT_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [merchant]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (month !== 'all') params.set('month', month);
    if (category !== 'all') params.set('category', category);
    if (status !== 'all') params.set('status', status);
    if (debouncedMerchant.trim()) params.set('merchant', debouncedMerchant.trim());
    if (focusParam) params.set('focus', focusParam);
    if (params.toString() !== searchParamsSnapshot) setSearchParams(params, { replace: true });
  }, [category, debouncedMerchant, focusParam, month, searchParamsSnapshot, setSearchParams, status]);

  useEffect(() => {
    if (!focusParam) return;
    const focusId = Number(focusParam);
    if (!Number.isFinite(focusId)) return;
    if (loading) return;
    if (!transactions.some((transaction) => transaction.id === focusId)) return;

    const row = rowRefs.current.get(focusId);
    if (!row) return;

    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFocusedRowId(focusId);
    const timeout = window.setTimeout(() => setFocusedRowId(null), 2400);
    const next = new URLSearchParams(searchParamsSnapshot);
    next.delete('focus');
    setSearchParams(next, { replace: true });
    return () => window.clearTimeout(timeout);
  }, [focusParam, loading, searchParamsSnapshot, setSearchParams, transactions]);

  useEffect(() => {
    const updateRowHeight = () => {
      if (!tableViewportRef.current) return;
      if (transactions.length === 0) {
        setRowHeightPx(null);
        return;
      }

      const headerElement = tableViewportRef.current.querySelector('thead');
      if (!headerElement) return;

      const viewportHeight = tableViewportRef.current.clientHeight;
      const headerHeight = headerElement.getBoundingClientRect().height;
      const availableBodyHeight = Math.max(0, viewportHeight - headerHeight);
      const visibleRows = Math.min(PAGE_SIZE, transactions.length);
      const nextRowHeight = Math.max(48, Math.floor(availableBodyHeight / Math.max(visibleRows, 1)));

      setRowHeightPx((previous) => (previous === nextRowHeight ? previous : nextRowHeight));
    };

    updateRowHeight();

    const observer = new ResizeObserver(updateRowHeight);
    if (tableViewportRef.current) observer.observe(tableViewportRef.current);

    return () => {
      observer.disconnect();
    };
  }, [transactions.length]);

  const categoryFilterOptions = useMemo(() => buildCategoryFilterOptions(categories), [categories]);
  const rowCategoryOptions = useMemo(() => buildRowCategoryOptions(categories), [categories]);
  const monthOptions = useMemo(() => buildMonthOptions(availableMonths), [availableMonths]);
  const categoryColorMap = useMemo(() => buildCategoryColorMap(categories), [categories]);

  const filterParts = useMemo(() => {
    const parts: string[] = [];
    if (month !== 'all') parts.push(formatMonthLabel(month));
    if (category !== 'all') {
      const categoryLabel =
        category === 'uncategorized'
          ? 'Uncategorized'
          : categories.find((candidate) => String(candidate.id) === category)?.name ?? category;
      parts.push(categoryLabel);
    }
    if (status !== 'all') parts.push(status === 'needs_review' ? 'Needs review' : 'Confirmed');
    if (debouncedMerchant.trim()) parts.push(`"${debouncedMerchant.trim()}"`);
    return parts;
  }, [categories, category, debouncedMerchant, month, status]);

  const { needsReviewCount, confirmedCount } = useMemo(() => {
    let needsReview = 0;
    let confirmed = 0;

    for (const transaction of transactions) {
      if (transaction.status === 'needs_review') needsReview += 1;
      else if (transaction.status === 'confirmed') confirmed += 1;
    }

    return { needsReviewCount: needsReview, confirmedCount: confirmed };
  }, [transactions]);
  const completePct = transactions.length > 0 ? Math.round((confirmedCount / transactions.length) * 100) : 0;

  const onFilterChange = useCallback((type: 'month' | 'category' | 'status', value: string) => {
    if (type === 'month') setMonth(value);
    else if (type === 'category') setCategory(value);
    else setStatus(value);
    setOffset(0);
  }, []);

  const onMerchantChange = useCallback((value: string) => {
    setMerchant(value);
    setOffset(0);
  }, []);

  const onCategoryAssign = useCallback((transaction: TransactionListItem, selectedValue: string) => {
    void assignCategory(transaction, selectedValue);
  }, [assignCategory]);

  const onEditTransaction = useCallback((transaction: TransactionListItem) => {
    void markForReview(transaction).then((updated) => {
      if (updated) categorySelectRefs.current.get(transaction.id)?.focus();
    });
  }, [markForReview]);

  const onDeleteTransaction = useCallback(async (transaction: TransactionListItem) => {
    const label = transaction.merchant ?? transaction.description;
    const confirmed = window.confirm(`Delete transaction "${label}" from ${formatShortDate(transaction.date)}?`);
    if (!confirmed) return;

    const removed = await removeTransaction(transaction);
    if (!removed) return;

    if (shouldMoveToPreviousPageAfterDelete) {
      setOffset((previous) => Math.max(0, previous - PAGE_SIZE));
    } else {
      await mutateTransactions();
    }
  }, [mutateTransactions, removeTransaction, shouldMoveToPreviousPageAfterDelete]);

  const onRetry = useCallback(() => {
    void refresh();
  }, [refresh]);

  const onPreviousPage = useCallback(() => {
    setOffset((previous) => Math.max(0, previous - PAGE_SIZE));
  }, []);

  const onNextPage = useCallback(() => {
    setOffset((previous) => previous + PAGE_SIZE);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-5" aria-busy={loading}>
      {loading ? (
        <div role="status" aria-live="polite" className="sr-only">
          Loading transactions...
        </div>
      ) : null}

      <TransactionsHeader
        filterParts={filterParts}
        total={total}
        needsReviewCount={needsReviewCount}
        completePct={completePct}
      />

      <TransactionsFilters
        merchant={merchant}
        month={month}
        category={category}
        status={status}
        monthOptions={monthOptions}
        categoryFilterOptions={categoryFilterOptions}
        onMerchantChange={onMerchantChange}
        onFilterChange={onFilterChange}
      />

      {error ? <TransactionsErrorBanner error={error} onRetry={onRetry} /> : null}

      <TransactionsDesktopTable
        tableViewportRef={tableViewportRef}
        rowRefs={rowRefs}
        categorySelectRefs={categorySelectRefs}
        transactions={transactions}
        loading={loading}
        rowHeightPx={rowHeightPx}
        rowCategoryOptions={rowCategoryOptions}
        updatingTransactionIds={updatingTransactionIds}
        deletingTransactionIds={deletingTransactionIds}
        categoryColorMap={categoryColorMap}
        focusedRowId={focusedRowId}
        onCategoryAssign={onCategoryAssign}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
      />

      <TransactionsMobileList
        transactions={transactions}
        loading={loading}
        rowRefs={rowRefs}
        rowCategoryOptions={rowCategoryOptions}
        updatingTransactionIds={updatingTransactionIds}
        deletingTransactionIds={deletingTransactionIds}
        categoryColorMap={categoryColorMap}
        focusedRowId={focusedRowId}
        onCategoryAssign={onCategoryAssign}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
      />

      <TransactionsPagination
        offset={offset}
        total={total}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  );
}
