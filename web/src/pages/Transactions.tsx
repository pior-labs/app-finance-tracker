import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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

interface StatsResponse {
  meta: {
    month: string;
    availableMonths: string[];
  };
}

const PAGE_SIZE = 15;

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

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [offset, setOffset] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTransactionIds, setUpdatingTransactionIds] = useState<number[]>([]);
  const [rowHeightPx, setRowHeightPx] = useState<number | null>(null);
  const tableViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchFilterData = async () => {
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
    };
    void fetchFilterData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (month !== 'all') params.set('month', month);
    if (category !== 'all') params.set('category', category);
    if (status !== 'all') params.set('status', status);
    if (merchant.trim()) params.set('merchant', merchant.trim());
    if (params.toString() !== searchParams.toString()) setSearchParams(params, { replace: true });
  }, [month, category, status, merchant, searchParams, setSearchParams]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', String(PAGE_SIZE));
        params.set('offset', String(offset));
        if (month !== 'all') params.set('month', month);
        if (category !== 'all') params.set('category', category);
        if (status !== 'all') params.set('status', status);
        if (merchant.trim()) params.set('merchant', merchant.trim());

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
    };
    void fetchTransactions();
  }, [month, category, status, merchant, offset]);

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
      const nextRowHeight = Math.max(40, Math.floor(availableBodyHeight / Math.max(visibleRows, 1)));

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

  const onCategoryAssign = async (transaction: TransactionListItem, selectedValue: string) => {
    const selectedCategoryId = selectedValue === 'uncategorized' ? null : Number(selectedValue);
    if (selectedValue !== 'uncategorized' && (!Number.isFinite(selectedCategoryId) || (selectedCategoryId as number) <= 0)) return;
    if (selectedCategoryId === transaction.categoryId && transaction.status === 'confirmed') return;

    setUpdatingTransactionIds((prev) => [...prev, transaction.id]);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: selectedCategoryId, status: selectedCategoryId === null ? 'needs_review' : 'confirmed' }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to update transaction (${response.status})`);
      }
      const payload = (await response.json()) as {
        data: { id: number; categoryId: number | null; categoryName: string | null; status: 'needs_review' | 'confirmed' };
      };
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === transaction.id
            ? { ...item, categoryId: payload.data.categoryId, categoryName: payload.data.categoryName, status: payload.data.status }
            : item
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update transaction');
    } finally {
      setUpdatingTransactionIds((prev) => prev.filter((id) => id !== transaction.id));
    }
  };

  const needsReviewCount = transactions.filter((t) => t.status === 'needs_review').length;
  const confirmedCount = transactions.filter((t) => t.status === 'confirmed').length;
  const completePct = transactions.length > 0 ? Math.round((confirmedCount / transactions.length) * 100) : 0;

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
  if (merchant.trim()) filterParts.push(`"${merchant.trim()}"`);

  const categoryColorMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const cat of categories) map.set(cat.id, cat.color);
    return map;
  }, [categories]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      {/* ─── Header ─── */}
      <header className="flex flex-wrap items-end justify-between gap-6 px-1 pt-3">
        <div>
          <div className="text-[13px] tracking-wide" style={{ color: 'var(--ink-3)' }}>
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
            className="m-0 my-1.5 text-[52px] font-normal leading-none tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            Transactions
          </h1>
        </div>
        {/* Summary pills */}
        <div className="flex items-center gap-2.5">
          {needsReviewCount > 0 && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(248,215,192,0.7), rgba(245,227,160,0.5))',
                borderColor: 'rgba(255,255,255,0.6)',
                color: 'var(--ink-2)',
              }}
            >
              ⚘ {needsReviewCount} needs review
            </span>
          )}
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(202,224,168,0.7), rgba(198,227,212,0.5))',
              borderColor: 'rgba(255,255,255,0.6)',
              color: '#3d6b1f',
            }}
          >
            ✓ {completePct}% sorted
          </span>
        </div>
      </header>

      {/* ─── Filter bar ─── */}
      <div
        className="flex flex-wrap items-center gap-2.5 rounded-full border px-4 py-2.5"
        style={{
          background: 'rgba(255,253,247,0.55)',
          borderColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          boxShadow: '0 6px 22px -8px rgba(45,36,24,0.08)',
        }}
      >
        {/* Search */}
        <div className="relative">
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
            className="h-9 w-44 rounded-full border-0 bg-white/50 pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--ink-3)] focus:bg-white/80 focus:ring-2 focus:ring-[var(--accent)]/30"
            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)' }}
          />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-[rgba(45,36,24,0.1)]" />

        {/* Month filter */}
        <select
          value={month}
          onChange={(e) => onFilterChange('month', e.target.value)}
          aria-label="Filter by month"
          className="h-9 cursor-pointer appearance-none rounded-full border-0 bg-white/40 px-3.5 pr-7 text-sm outline-none transition-colors hover:bg-white/70 focus:ring-2 focus:ring-[var(--accent)]/30"
          style={{ fontFamily: "'Outfit', sans-serif", color: month === 'all' ? 'var(--ink-3)' : 'var(--ink)' }}
        >
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          aria-label="Filter by category"
          className="h-9 cursor-pointer appearance-none rounded-full border-0 bg-white/40 px-3.5 pr-7 text-sm outline-none transition-colors hover:bg-white/70 focus:ring-2 focus:ring-[var(--accent)]/30"
          style={{ fontFamily: "'Outfit', sans-serif", color: category === 'all' ? 'var(--ink-3)' : 'var(--ink)' }}
        >
          {categoryFilterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          aria-label="Filter by status"
          className="h-9 cursor-pointer appearance-none rounded-full border-0 bg-white/40 px-3.5 pr-7 text-sm outline-none transition-colors hover:bg-white/70 focus:ring-2 focus:ring-[var(--accent)]/30"
          style={{ fontFamily: "'Outfit', sans-serif", color: status === 'all' ? 'var(--ink-3)' : 'var(--ink)' }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <p
          className="rounded-2xl border px-5 py-3 text-sm"
          style={{
            background: 'rgba(245,180,160,0.4)',
            borderColor: 'rgba(197,112,74,0.4)',
            color: '#6b3a1f',
          }}
        >
          {error}
        </p>
      )}

      {/* ─── Table ─── */}
      <div
        ref={tableViewportRef}
        className="min-h-0 flex-1 overflow-hidden rounded-[28px] border"
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
                <th className="h-11 px-5 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Date</th>
                <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Merchant</th>
                <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Description</th>
                <th className="h-11 px-4 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Amount</th>
                <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Category</th>
                <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Status</th>
                <th className="h-11 px-5 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-dashed" style={{ borderColor: 'rgba(45,36,24,0.08)' }}>
                    <td colSpan={7} className="px-5 py-3">
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
                  const catColor = tx.categoryId ? categoryColorMap.get(tx.categoryId) : undefined;
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-dashed transition-colors hover:bg-white/40"
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
                      <td
                        className="max-w-72 truncate px-4 py-1.5 text-[12px]"
                        style={{ color: 'var(--ink-3)' }}
                        title={tx.description}
                      >
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
                            disabled={isUpdating}
                            onChange={(e) => void onCategoryAssign(tx, e.target.value)}
                            aria-label={`Set category for transaction ${tx.id}`}
                            className="h-7 cursor-pointer appearance-none rounded-full border border-white/70 bg-white/50 pr-6 text-xs font-medium outline-none transition-colors hover:bg-white/80 focus:ring-2 focus:ring-[var(--accent)]/30 disabled:cursor-default disabled:opacity-50"
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
                      <td className="px-4 py-1.5">
                        {tx.status === 'confirmed' ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: 'rgba(202,224,168,0.6)',
                              color: '#3d6b1f',
                              border: '1px solid rgba(255,255,255,0.5)',
                            }}
                          >
                            ✓ confirmed
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: 'rgba(248,215,192,0.6)',
                              color: 'var(--ink-2)',
                              border: '1px solid rgba(255,255,255,0.5)',
                            }}
                          >
                            needs review
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-1.5">
                        <div className="flex justify-end gap-1">
                          <button
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border-0 bg-white/40 text-xs transition-colors hover:bg-white/80"
                            style={{ color: 'var(--ink-2)' }}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border-0 bg-white/40 text-xs transition-colors hover:bg-[rgba(248,215,192,0.7)]"
                            style={{ color: 'var(--accent)' }}
                            title="Delete"
                          >
                            ✕
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

      {/* ─── Pagination ─── */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
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
        <div className="flex items-center gap-2.5">
          {canGoPrevious && (
            <button
              onClick={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/50"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: 'var(--ink-2)',
                borderColor: 'rgba(45,36,24,0.15)',
                background: 'transparent',
              }}
            >
              ← prev
            </button>
          )}
          <span
            className="text-[13px] italic"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
          >
            {pageNumber} of {totalPages}
          </span>
          {canGoNext && (
            <button
              onClick={() => setOffset((p) => p + PAGE_SIZE)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-px"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: 'var(--ink)',
                color: 'var(--cream)',
                border: 0,
                boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
              }}
            >
              next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
