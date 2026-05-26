import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, ChevronLeft, ChevronRight, Flower2, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useUncategorizedCount } from '@/hooks/useUncategorizedCount';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface CategoryResponse {
  data: Category[];
}

interface SelectOption {
  value: string;
  label: string;
}

interface TransactionListItem {
  id: number;
  statementId: number;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: 'debit' | 'credit';
  categoryId: number | null;
  categoryName: string | null;
  status: 'needs_review' | 'confirmed';
}

interface TransactionsResponse {
  data: TransactionListItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface TransactionUpdatePayload {
  id: number;
  statementId: number;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: 'debit' | 'credit';
  categoryId: number | null;
  categoryName: string | null;
  status: 'needs_review' | 'confirmed';
  createdAt: string;
}

interface StatsResponse {
  meta: {
    month: string;
    availableMonths: string[];
  };
}

const PAGE_SIZE = 15;
const MERCHANT_DEBOUNCE_MS = 300;

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'confirmed', label: 'Confirmed' },
];

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isValidMonth(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}$/.test(value);
}

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-');
  const parsed = new Date(Number(year), Number(monthNumber) - 1, 1);
  if (Number.isNaN(parsed.getTime())) return month;
  return parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatAmount(cents: number): string {
  const value = Math.abs(cents) / 100;
  const formatted = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function prettyName(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase());
}

function TransactionStatusPill({
  status,
  mobile = false,
}: {
  status: 'needs_review' | 'confirmed';
  mobile?: boolean;
}) {
  const className = mobile
    ? 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold'
    : 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold';

  if (status === 'confirmed') {
    return (
      <span
        className={className}
        style={{
          background: 'rgba(202,224,168,0.6)',
          color: '#3d6b1f',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
      >
        <Check aria-hidden="true" className="h-3 w-3" strokeWidth={2.6} />
        Confirmed
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        background: 'rgba(248,215,192,0.6)',
        color: 'var(--ink-2)',
        border: '1px solid rgba(255,255,255,0.5)',
      }}
    >
      <AlertCircle aria-hidden="true" className="h-3 w-3" strokeWidth={2.4} />
      {mobile ? 'Needs review' : 'Review'}
    </span>
  );
}

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { adjust: adjustUncategorized } = useUncategorizedCount();

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTransactionIds, setUpdatingTransactionIds] = useState<number[]>([]);
  const [deletingTransactionIds, setDeletingTransactionIds] = useState<number[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [rowHeightPx, setRowHeightPx] = useState<number | null>(null);
  const tableViewportRef = useRef<HTMLDivElement | null>(null);
  const categorySelectRefs = useRef<Map<number, HTMLSelectElement>>(new Map());
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null);

  const fetchFilterData = useCallback(async () => {
    try {
      const [categoriesResponse, statsResponse] = await Promise.all([
        fetch('/api/categories', { credentials: 'include' }),
        fetch('/api/transactions/stats', { credentials: 'include' }),
      ]);
      if (!categoriesResponse.ok) throw new Error(`Failed to load categories (${categoriesResponse.status})`);
      if (!statsResponse.ok) throw new Error(`Failed to load months (${statsResponse.status})`);

      const categoriesPayload = (await categoriesResponse.json()) as CategoryResponse;
      const statsPayload = (await statsResponse.json()) as StatsResponse;
      setCategories(categoriesPayload.data);
      const monthSet = new Set<string>([statsPayload.meta.month, ...statsPayload.meta.availableMonths, getCurrentMonth()]);
      setAvailableMonths(Array.from(monthSet).sort((a, b) => b.localeCompare(a)));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load filters');
    }
  }, []);

  useEffect(() => {
    void fetchFilterData();
  }, [fetchFilterData]);

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
    const focusParam = searchParams.get('focus');
    if (focusParam) params.set('focus', focusParam);
    if (params.toString() !== searchParams.toString()) setSearchParams(params, { replace: true });
  }, [month, category, status, debouncedMerchant, searchParams, setSearchParams]);

  useEffect(() => {
    const focusParam = searchParams.get('focus');
    if (!focusParam) return;
    const focusId = Number(focusParam);
    if (!Number.isFinite(focusId)) return;
    if (loading) return;
    if (!transactions.some((t) => t.id === focusId)) return;

    const row = rowRefs.current.get(focusId);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFocusedRowId(focusId);
      const timeout = window.setTimeout(() => setFocusedRowId(null), 2400);
      const params = new URLSearchParams(searchParams);
      params.delete('focus');
      setSearchParams(params, { replace: true });
      return () => window.clearTimeout(timeout);
    }
  }, [loading, transactions, searchParams, setSearchParams]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(offset));
      if (month !== 'all') params.set('month', month);
      if (category !== 'all') params.set('category', category);
      if (status !== 'all') params.set('status', status);
      if (debouncedMerchant.trim()) params.set('merchant', debouncedMerchant.trim());

      const response = await fetch(`/api/transactions?${params.toString()}`, { credentials: 'include' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to load transactions (${response.status})`);
      }
      const payload = (await response.json()) as TransactionsResponse;
      setTransactions(payload.data);
      setTotal(payload.pagination.total);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [month, category, status, debouncedMerchant, offset]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions, reloadToken]);

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

      setRowHeightPx((prev) => (prev === nextRowHeight ? prev : nextRowHeight));
    };

    updateRowHeight();

    const observer = new ResizeObserver(() => {
      updateRowHeight();
    });

    if (tableViewportRef.current) observer.observe(tableViewportRef.current);

    return () => {
      observer.disconnect();
    };
  }, [transactions.length]);

  const categoryFilterOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [
      { value: 'all', label: 'All categories' },
      { value: 'uncategorized', label: 'Uncategorized' },
    ];
    for (const cat of categories) {
      options.push({ value: String(cat.id), label: cat.name });
    }
    return options;
  }, [categories]);

  const rowCategoryOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'uncategorized', label: 'Uncategorized' },
      ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
    ],
    [categories]
  );

  const monthOptions = useMemo<SelectOption[]>(() => {
    const monthSet = new Set<string>(availableMonths);
    const options = Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((v) => ({ value: v, label: formatMonthLabel(v) }));
    return [{ value: 'all', label: 'All transactions' }, ...options];
  }, [month, availableMonths]);

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrevious = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;

  const onFilterChange = (type: 'month' | 'category' | 'status', value: string) => {
    if (type === 'month') setMonth(value);
    else if (type === 'category') setCategory(value);
    else setStatus(value);
    setOffset(0);
  };

  const patchTransaction = async (
    transactionId: number,
    updatePayload: { category_id?: number | null; status?: 'needs_review' | 'confirmed' }
  ): Promise<TransactionUpdatePayload> => {
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
  };

  const onCategoryAssign = async (transaction: TransactionListItem, selectedValue: string) => {
    const selectedCategoryId = selectedValue === 'uncategorized' ? null : Number(selectedValue);
    if (selectedValue !== 'uncategorized' && (!Number.isFinite(selectedCategoryId) || (selectedCategoryId as number) <= 0)) return;
    if (selectedCategoryId === transaction.categoryId && transaction.status === 'confirmed') return;

    setUpdatingTransactionIds((prev) => (prev.includes(transaction.id) ? prev : [...prev, transaction.id]));
    setError(null);

    try {
      const payload = await patchTransaction(transaction.id, {
        category_id: selectedCategoryId,
        status: selectedCategoryId === null ? 'needs_review' : 'confirmed',
      });
      if (transaction.status !== payload.status) {
        adjustUncategorized(payload.status === 'needs_review' ? 1 : -1);
      }
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === transaction.id
            ? { ...item, categoryId: payload.categoryId, categoryName: payload.categoryName, status: payload.status }
            : item
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update transaction');
    } finally {
      setUpdatingTransactionIds((prev) => prev.filter((id) => id !== transaction.id));
    }
  };

  const onEditTransaction = async (transaction: TransactionListItem) => {
    setError(null);

    try {
      if (transaction.status !== 'needs_review') {
        setUpdatingTransactionIds((prev) => (prev.includes(transaction.id) ? prev : [...prev, transaction.id]));
        const payload = await patchTransaction(transaction.id, { status: 'needs_review' });
        if (transaction.status !== payload.status) {
          adjustUncategorized(payload.status === 'needs_review' ? 1 : -1);
        }
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === transaction.id
              ? { ...item, categoryId: payload.categoryId, categoryName: payload.categoryName, status: payload.status }
              : item
          )
        );
      }
      categorySelectRefs.current.get(transaction.id)?.focus();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to prepare transaction for editing');
    } finally {
      setUpdatingTransactionIds((prev) => prev.filter((id) => id !== transaction.id));
    }
  };

  const onDeleteTransaction = async (transaction: TransactionListItem) => {
    const label = transaction.merchant ?? transaction.description;
    const confirmed = window.confirm(`Delete transaction "${label}" from ${formatShortDate(transaction.date)}?`);
    if (!confirmed) return;

    setError(null);
    setDeletingTransactionIds((prev) => (prev.includes(transaction.id) ? prev : [...prev, transaction.id]));

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to delete transaction (${response.status})`);
      }

      if (transaction.status === 'needs_review') {
        adjustUncategorized(-1);
      }
      setTransactions((prev) => prev.filter((item) => item.id !== transaction.id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (transactions.length === 1 && offset > 0) {
        setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
      } else {
        setReloadToken((prev) => prev + 1);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete transaction');
    } finally {
      setDeletingTransactionIds((prev) => prev.filter((id) => id !== transaction.id));
    }
  };

  const needsReviewCount = transactions.filter((t) => t.status === 'needs_review').length;
  const confirmedCount = transactions.filter((t) => t.status === 'confirmed').length;
  const completePct = transactions.length > 0 ? Math.round((confirmedCount / transactions.length) * 100) : 0;
  const retryAll = () => {
    setError(null);
    void Promise.all([fetchFilterData(), fetchTransactions()]);
  };

  // Active filters summary for eyebrow
  const filterParts: string[] = [];
  if (month !== 'all') filterParts.push(formatMonthLabel(month));
  if (category !== 'all') {
    const catLabel = category === 'uncategorized'
      ? 'Uncategorized'
      : categories.find((c) => String(c.id) === category)?.name ?? category;
    filterParts.push(catLabel);
  }
  if (status !== 'all') filterParts.push(status === 'needs_review' ? 'Needs review' : 'Confirmed');
  if (debouncedMerchant.trim()) filterParts.push(`"${debouncedMerchant.trim()}"`);

  const categoryColorMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const cat of categories) map.set(cat.id, cat.color);
    return map;
  }, [categories]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-5" aria-busy={loading}>
      {loading && (
        <div role="status" aria-live="polite" className="sr-only">
          Loading transactions…
        </div>
      )}
      {/* ─── Header ─── */}
      <header className="flex flex-col gap-4 px-1 pt-1 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:pt-3">
        <div className="min-w-0">
          <div className="truncate text-[12px] tracking-wide sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
            {filterParts.length > 0 ? (
              <>
                Filtered ·{' '}
                <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
                  {filterParts.join(' · ')}
                </em>
              </>
            ) : (
              <>
                All time ·{' '}
                <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
                  {total} total
                </em>
              </>
            )}
          </div>
          <h1
            className="m-0 my-1.5 text-[34px] font-normal leading-[1.05] tracking-tight sm:text-[42px] sm:leading-none md:text-[52px]"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            Transactions
          </h1>
        </div>
        {/* Summary pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {needsReviewCount > 0 && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:py-1.5 sm:text-xs"
              style={{
                background: 'linear-gradient(135deg, rgba(248,215,192,0.7), rgba(245,227,160,0.5))',
                borderColor: 'rgba(255,255,255,0.6)',
                color: 'var(--ink-2)',
              }}
            >
              <Flower2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} /> {needsReviewCount} needs review
            </span>
          )}
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:py-1.5 sm:text-xs"
            style={{
              background: 'linear-gradient(135deg, rgba(202,224,168,0.7), rgba(198,227,212,0.5))',
              borderColor: 'rgba(255,255,255,0.6)',
              color: '#3d6b1f',
            }}
          >
            <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} /> {completePct}% sorted
          </span>
        </div>
      </header>

      {/* ─── Filter bar ─── */}
      <div
        className="flex flex-col gap-2 rounded-[28px] border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5 sm:rounded-full sm:px-4 sm:py-2.5"
        style={{
          background: 'rgba(255,253,247,0.55)',
          borderColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          boxShadow: '0 6px 22px -8px rgba(45,36,24,0.08)',
        }}
      >
        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: 'var(--ink-3)' }}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={merchant}
            onChange={(e) => {
              setMerchant(e.target.value);
              setOffset(0);
            }}
            placeholder="Search merchant…"
            aria-label="Search by merchant"
            inputMode="search"
            className="h-11 w-full rounded-full border-0 bg-white/50 pl-9 pr-3 text-[15px] outline-none transition-colors placeholder:text-ink-3 focus:bg-white/80 focus:ring-2 focus:ring-(--accent)/30 sm:h-9 sm:w-44 sm:pl-8 sm:text-sm"
            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)' }}
          />
        </div>

        {/* Divider — desktop only */}
        <div className="hidden h-5 w-px bg-[rgba(45,36,24,0.1)] sm:block" />

        {/* Filter selects — grid on mobile, inline on sm+ */}
        <div className="grid grid-cols-1 gap-2 sm:contents">
          <select
            value={month}
            onChange={(e) => onFilterChange('month', e.target.value)}
            aria-label="Filter by month"
            className="h-11 min-w-0 cursor-pointer appearance-none rounded-full border-0 bg-white/40 px-3.5 pr-7 text-[15px] outline-none transition-colors hover:bg-white/70 focus:ring-2 focus:ring-(--accent)/30 sm:h-9 sm:text-sm"
            style={{ fontFamily: "'Outfit', sans-serif", color: month === 'all' ? 'var(--ink-3)' : 'var(--ink)', touchAction: 'manipulation' }}
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            aria-label="Filter by category"
            className="h-11 min-w-0 cursor-pointer appearance-none rounded-full border-0 bg-white/40 px-3.5 pr-7 text-[15px] outline-none transition-colors hover:bg-white/70 focus:ring-2 focus:ring-(--accent)/30 sm:h-9 sm:text-sm"
            style={{ fontFamily: "'Outfit', sans-serif", color: category === 'all' ? 'var(--ink-3)' : 'var(--ink)', touchAction: 'manipulation' }}
          >
            {categoryFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            aria-label="Filter by status"
            className="h-11 min-w-0 cursor-pointer appearance-none rounded-full border-0 bg-white/40 px-3.5 pr-7 text-[15px] outline-none transition-colors hover:bg-white/70 focus:ring-2 focus:ring-(--accent)/30 sm:h-9 sm:text-sm"
            style={{ fontFamily: "'Outfit', sans-serif", color: status === 'all' ? 'var(--ink-3)' : 'var(--ink)', touchAction: 'manipulation' }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-3 text-sm"
          style={{
            background: 'rgba(245,180,160,0.4)',
            borderColor: 'rgba(197,112,74,0.4)',
            color: '#6b3a1f',
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="font-serif text-base font-medium">Couldn't load transactions</div>
            <div className="mt-0.5 text-[13px] text-[#7a4b2f]/85">{error}</div>
          </div>
          <button
            type="button"
            onClick={retryAll}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[#6b3a1f] px-4 py-2 text-[13px] font-medium text-cream shadow-[0_6px_18px_-6px_rgba(107,58,31,0.45)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b3a1f]/40 motion-reduce:hover:translate-y-0"
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
            Try again
          </button>
        </div>
      )}

      {/* ─── Table (desktop) ─── */}
      <div
        ref={tableViewportRef}
        aria-busy={loading}
        className="hidden min-h-0 flex-1 overflow-hidden rounded-[28px] border md:block"
        style={{
          background: 'rgba(255,253,247,0.55)',
          borderColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          boxShadow: '0 14px 44px -10px rgba(45,36,24,0.1), inset 0 0 0 1px rgba(255,255,255,0.45)',
        }}
      >
        <div className="h-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr
                className="border-b"
                style={{
                  background: 'linear-gradient(135deg, rgba(248,215,192,0.25), rgba(220,211,240,0.2), rgba(202,224,168,0.15))',
                  borderColor: 'rgba(45,36,24,0.08)',
                }}
              >
                <th className="h-11 w-20 px-5 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Date</th>
                <th className="h-11 w-52 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Merchant</th>
                <th className="h-11 w-72 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Description</th>
                <th className="h-11 w-32 px-4 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Amount</th>
                <th className="h-11 w-64 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Category</th>
                <th className="h-11 w-40 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Status</th>
                <th className="h-11 w-28 px-5 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-dashed" style={{ borderColor: 'rgba(45,36,24,0.08)' }}>
                    <td colSpan={7} className="px-5 py-3" aria-hidden="true">
                      <div
                        className="h-4 rounded-full animate-pulse"
                        style={{
                          background: 'rgba(255,253,247,0.6)',
                          width: `${65 + (i % 3) * 12}%`,
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p
                      className="text-base italic"
                      style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
                    >
                      No transactions found.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isUpdating = updatingTransactionIds.includes(tx.id);
                  const isDeleting = deletingTransactionIds.includes(tx.id);
                  const isBusy = isUpdating || isDeleting;
                  const catColor = tx.categoryId ? categoryColorMap.get(tx.categoryId) : undefined;
                  const isFocused = focusedRowId === tx.id;
                  return (
                    <tr
                      key={tx.id}
                      ref={(node) => {
                        if (node) rowRefs.current.set(tx.id, node);
                        else rowRefs.current.delete(tx.id);
                      }}
                      className={`border-b border-dashed transition-colors ${
                        isFocused ? 'bg-(--accent)/15' : 'hover:bg-white/40'
                      }`}
                      style={{
                        borderColor: 'rgba(45,36,24,0.08)',
                        ...(rowHeightPx ? { height: `${rowHeightPx}px` } : {}),
                      }}
                    >
                      {/* Date */}
                      <td className="whitespace-nowrap px-5 py-1.5 text-[12px]" style={{ color: 'var(--ink-3)' }}>
                        {formatShortDate(tx.date)}
                      </td>

                      {/* Merchant */}
                      <td className="px-4 py-1.5">
                        <span
                          className="text-[15px] font-medium"
                          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                        >
                          {prettyName(tx.merchant ?? tx.description)}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-1.5 text-[12px]" style={{ color: 'var(--ink-3)' }}>
                        {tx.description}
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap px-4 py-1.5 text-right">
                        <span
                          className="text-[15px] font-medium"
                          style={{
                            fontFamily: "'Fraunces', serif",
                            color: tx.type === 'credit' ? '#3d6b1f' : 'var(--ink)',
                          }}
                        >
                          {tx.type === 'credit' ? '+' : ''}
                          {formatAmount(tx.amount)}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-1.5">
                        <div className="relative inline-flex items-center">
                          {catColor && (
                            <span
                              className="absolute left-2.5 h-2 w-2 rounded-full"
                              style={{ background: catColor, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }}
                            />
                          )}
                          <select
                            value={tx.categoryId === null ? 'uncategorized' : String(tx.categoryId)}
                            disabled={isBusy}
                            ref={(node) => {
                              if (node) categorySelectRefs.current.set(tx.id, node);
                              else categorySelectRefs.current.delete(tx.id);
                            }}
                            onChange={(e) => void onCategoryAssign(tx, e.target.value)}
                            aria-label={`Set category for transaction ${tx.id}`}
                            className="h-9 cursor-pointer appearance-none rounded-full border border-white/70 bg-white/50 pr-6 text-[13px] font-medium outline-none transition-colors hover:bg-white/80 focus:ring-2 focus:ring-(--accent)/30 disabled:cursor-default disabled:opacity-50"
                            style={{
                              fontFamily: "'Outfit', sans-serif",
                              color: tx.categoryId === null ? 'var(--ink-3)' : 'var(--ink)',
                              paddingLeft: catColor ? '1.25rem' : '0.625rem',
                              boxShadow: '0 2px 8px -2px rgba(45,36,24,0.06)',
                            }}
                          >
                            {rowCategoryOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-4 py-1.5">
                        <TransactionStatusPill status={tx.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-1.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => void onEditTransaction(tx)}
                            disabled={isBusy}
                            aria-label={`Edit transaction ${tx.id}`}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-white/40 text-xs transition-colors hover:bg-white/80"
                            style={{ color: 'var(--ink-2)' }}
                            title="Edit"
                          >
                            <Pencil aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDeleteTransaction(tx)}
                            disabled={isBusy}
                            aria-label={`Delete transaction ${tx.id}`}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-white/40 text-xs transition-colors hover:bg-[rgba(248,215,192,0.7)]"
                            style={{ color: 'var(--accent)' }}
                            title="Delete"
                          >
                            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Card list (mobile) ─── */}
      <div
        className="flex flex-col gap-2.5 md:hidden"
        role={loading ? 'status' : undefined}
        aria-live={loading ? 'polite' : undefined}
        aria-busy={loading}
      >
        {loading && <span className="sr-only">Loading transactions…</span>}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="rounded-[20px] border p-4"
              style={{
                background: 'rgba(255,253,247,0.55)',
                borderColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px) saturate(140%)',
                WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              }}
            >
              <div
                className="h-3.5 animate-pulse rounded-full motion-reduce:animate-none"
                style={{
                  background: 'rgba(45,36,24,0.06)',
                  width: `${60 + (i % 3) * 12}%`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
              <div
                className="mt-2.5 h-3 w-1/2 animate-pulse rounded-full motion-reduce:animate-none"
                style={{ background: 'rgba(45,36,24,0.05)', animationDelay: `${i * 0.08 + 0.05}s` }}
              />
            </div>
          ))
        ) : transactions.length === 0 ? (
          <div
            className="rounded-3xl border px-5 py-12 text-center"
            style={{
              background: 'rgba(255,253,247,0.55)',
              borderColor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            }}
          >
            <p className="m-0 text-[15px] italic" style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}>
              No transactions found.
            </p>
          </div>
        ) : (
          transactions.map((tx) => {
            const isUpdating = updatingTransactionIds.includes(tx.id);
            const isDeleting = deletingTransactionIds.includes(tx.id);
            const isBusy = isUpdating || isDeleting;
            const catColor = tx.categoryId ? categoryColorMap.get(tx.categoryId) : undefined;
            const isFocused = focusedRowId === tx.id;
            return (
              <article
                key={tx.id}
                ref={(node) => {
                  if (node) rowRefs.current.set(tx.id, node as unknown as HTMLTableRowElement);
                  else rowRefs.current.delete(tx.id);
                }}
                className={`flex flex-col gap-3 rounded-[22px] border p-4 transition-colors motion-reduce:transition-none ${
                  isFocused ? 'bg-(--accent)/15' : ''
                }`}
                style={{
                  background: isFocused ? undefined : 'rgba(255,253,247,0.55)',
                  borderColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(20px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                  boxShadow: '0 6px 22px -10px rgba(45,36,24,0.08)',
                }}
              >
                {/* Top row: date + amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] tracking-wide" style={{ color: 'var(--ink-3)' }}>
                      {formatShortDate(tx.date)}
                    </div>
                    <h3
                      className="m-0 mt-1 text-[18px] font-normal leading-tight tracking-tight"
                      style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                    >
                      {prettyName(tx.merchant ?? tx.description)}
                    </h3>
                  </div>
                  <div
                    className="shrink-0 text-right text-[19px] font-medium tabular-nums"
                    style={{
                      fontFamily: "'Fraunces', serif",
                      color: tx.type === 'credit' ? '#3d6b1f' : 'var(--ink)',
                      fontFeatureSettings: "'lnum', 'tnum'",
                    }}
                    aria-label={`${tx.type === 'credit' ? 'Credit' : 'Debit'} ${formatAmount(tx.amount)}`}
                  >
                    {tx.type === 'credit' ? '+' : ''}
                    {formatAmount(tx.amount)}
                  </div>
                </div>

                {/* Description (only if distinct from merchant title) */}
                {tx.merchant && tx.description && tx.description !== tx.merchant && (
                  <p
                    className="m-0 line-clamp-2 text-[12px] leading-snug"
                    style={{ color: 'var(--ink-3)' }}
                    title={tx.description}
                  >
                    {tx.description}
                  </p>
                )}

                {/* Category + status row */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative inline-flex min-w-0 flex-1 items-center">
                    {catColor && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 h-2 w-2 rounded-full"
                        style={{ background: catColor, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }}
                      />
                    )}
                    <select
                      value={tx.categoryId === null ? 'uncategorized' : String(tx.categoryId)}
                      disabled={isBusy}
                      onChange={(e) => void onCategoryAssign(tx, e.target.value)}
                      aria-label={`Set category for transaction ${tx.id}`}
                      className="h-11 w-full min-w-0 cursor-pointer appearance-none rounded-full border border-white/70 bg-white/50 pr-7 text-[13px] font-medium outline-none transition-colors hover:bg-white/80 focus:ring-2 focus:ring-(--accent)/30 disabled:cursor-default disabled:opacity-50"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: tx.categoryId === null ? 'var(--ink-3)' : 'var(--ink)',
                        paddingLeft: catColor ? '1.5rem' : '0.875rem',
                        boxShadow: '0 2px 8px -2px rgba(45,36,24,0.06)',
                        touchAction: 'manipulation',
                      }}
                    >
                      {rowCategoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <TransactionStatusPill status={tx.status} mobile />
                </div>

                {/* Actions */}
                <div
                  className="-mx-1 flex items-center justify-end gap-1 border-t border-dashed pt-2"
                  style={{ borderColor: 'rgba(45,36,24,0.1)' }}
                >
                  <button
                    type="button"
                    onClick={() => void onEditTransaction(tx)}
                    disabled={isBusy}
                    aria-label="Edit transaction"
                    className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-white/60 disabled:opacity-50"
                    style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', touchAction: 'manipulation' }}
                  >
                    <Pencil aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.3} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteTransaction(tx)}
                    disabled={isBusy}
                    aria-label="Delete transaction"
                    className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-[rgba(248,215,192,0.7)] disabled:opacity-50"
                    style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--accent)', touchAction: 'manipulation' }}
                  >
                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Delete
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ─── Pagination ─── */}
      <div className="flex flex-col-reverse items-stretch gap-3 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="text-center text-[12px] sm:text-left sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
          {total > 0 && (
            <>
              Showing{' '}
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: 'var(--ink-2)' }}>
                {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
              </span>
              {' '}of{' '}
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: 'var(--ink-2)' }}>
                {total}
              </span>
            </>
          )}
        </span>
        <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-2.5">
          {canGoPrevious ? (
            <button
              onClick={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/50"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: 'var(--ink-2)',
                borderColor: 'rgba(45,36,24,0.15)',
                background: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
              prev
            </button>
          ) : (
            <span aria-hidden="true" className="min-h-11 sm:hidden" />
          )}
          <span
            className="shrink-0 text-[13px] italic"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
          >
            {pageNumber} of {totalPages}
          </span>
          {canGoNext ? (
            <button
              onClick={() => setOffset((p) => p + PAGE_SIZE)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: 'var(--ink)',
                color: 'var(--cream)',
                border: 0,
                boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
                touchAction: 'manipulation',
              }}
            >
              next
              <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
            </button>
          ) : (
            <span aria-hidden="true" className="min-h-11 sm:hidden" />
          )}
        </div>
      </div>
    </div>
  );
}
