import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { usePublishCategorizeStats } from '@/hooks/useCategorizeStats';
import { useToast } from '@/hooks/useToast';

interface Category {
  id: number;
  name: string;
  color: string;
  isFavorite?: boolean;
  favoritedAt?: string | null;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: 'debit' | 'credit';
}

interface ConfirmedItem {
  txId: number;
  merchant: string;
  category: string;
  categoryColor: string;
  amount: number;
  type: 'debit' | 'credit';
  at: number;
}

interface UndoAction {
  txId: number;
  categoryId: number;
  transaction: Transaction;
}

function formatMoney(cents: number): string {
  const value = Math.abs(cents) / 100;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function splitMoney(cents: number): { whole: string; cents: string } {
  const value = Math.abs(cents) / 100;
  const [whole, cent = '00'] = value
    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split('.');
  return { whole, cents: cent };
}

function prettyName(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase());
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Lighten a hex color by mixing with white */
function lighten(hex: string, amount = 0.75): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function removeFirstMatch<T>(items: T[], predicate: (item: T) => boolean): T[] {
  const index = items.findIndex(predicate);
  if (index === -1) return items;
  return [...items.slice(0, index), ...items.slice(index + 1)];
}

export function CategorizePage() {
  const { pushToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [queue, setQueue] = useState<Transaction[]>([]);
  const [totalUncategorized, setTotalUncategorized] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmedList, setConfirmedList] = useState<ConfirmedItem[]>([]);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [categoryMenuActiveIndex, setCategoryMenuActiveIndex] = useState(0);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const categoryMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const categoryMenuOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);

  const categorizedCount = totalTransactions - totalUncategorized + confirmedList.length;
  const remaining = Math.max(0, totalUncategorized - confirmedList.length);
  const positionInBatch = confirmedList.length + 1;
  const current = queue[0] ?? null;
  const isAssigning = assigningId !== null;
  const isLocked = isAssigning || isUndoing;
  const upNext = queue.slice(1);
  const progressPct = totalUncategorized > 0
    ? Math.round((confirmedList.length / totalUncategorized) * 100)
    : 0;

  usePublishCategorizeStats({
    done: categorizedCount,
    left: remaining,
    position: positionInBatch,
    total: totalUncategorized,
  });

  const favoriteCategories = useMemo(() => {
    return categories
      .filter((c) => c.isFavorite)
      .sort((a, b) => {
        const aAt = a.favoritedAt ? new Date(a.favoritedAt).getTime() : 0;
        const bAt = b.favoritedAt ? new Date(b.favoritedAt).getTime() : 0;
        return aAt - bAt;
      })
      .slice(0, 10);
  }, [categories]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, txRes, statsRes] = await Promise.all([
        fetch('/api/categories', { credentials: 'include' }),
        fetch('/api/transactions?status=needs_review&limit=20', { credentials: 'include' }),
        fetch('/api/transactions/stats', { credentials: 'include' }),
      ]);
      if (!catRes.ok) {
        const payload = await catRes.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to load categories (${catRes.status})`);
      }
      if (!txRes.ok) {
        const payload = await txRes.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to load transactions (${txRes.status})`);
      }
      if (!statsRes.ok) {
        const payload = await statsRes.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to load stats (${statsRes.status})`);
      }

      const cats = (await catRes.json()) as { data: Category[] };
      const txPayload = (await txRes.json()) as { data: Transaction[]; pagination: { total: number } };
      const statsPayload = (await statsRes.json()) as { data: { totalTransactionCount: number } };
      setCategories(cats.data);
      setQueue(txPayload.data);
      setTotalUncategorized(txPayload.pagination.total);
      setTotalTransactions(statsPayload.data.totalTransactionCount);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load categorize page');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const assignCategory = async (categoryId: number) => {
    if (!current || isLocked) return;
    const category = categories.find((c) => c.id === categoryId);

    setAssigningId(current.id);
    setUndoStack((prev) => [{ txId: current.id, categoryId, transaction: current }, ...prev]);
    setConfirmedList((prev) => [
      {
        txId: current.id,
        merchant: current.merchant ?? current.description,
        category: category?.name ?? 'Unknown',
        categoryColor: category?.color ?? '#9c8a73',
        amount: current.amount,
        type: current.type,
        at: Date.now(),
      },
      ...prev,
    ]);

    setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      setAssigningId(null);
    }, 200);

    try {
      const response = await fetch(`/api/transactions/${current.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId, status: 'confirmed' }),
      });
      if (!response.ok) {
        setQueue((prev) => (prev.some((tx) => tx.id === current.id) ? prev : [current, ...prev]));
        setConfirmedList((prev) => removeFirstMatch(prev, (item) => item.txId === current.id));
        setUndoStack((prev) => removeFirstMatch(prev, (action) => action.txId === current.id && action.categoryId === categoryId));
      }
    } catch {
      setQueue((prev) => (prev.some((tx) => tx.id === current.id) ? prev : [current, ...prev]));
      setConfirmedList((prev) => removeFirstMatch(prev, (item) => item.txId === current.id));
      setUndoStack((prev) => removeFirstMatch(prev, (action) => action.txId === current.id && action.categoryId === categoryId));
    }

    if (queue.length <= 3) {
      const moreRes = await fetch('/api/transactions?status=needs_review&limit=20', { credentials: 'include' });
      if (moreRes.ok) {
        const morePayload = (await moreRes.json()) as { data: Transaction[] };
        setQueue((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          return [...prev, ...morePayload.data.filter((t) => !existingIds.has(t.id))];
        });
      }
    }
  };

  const skip = () => {
    if (!current) return;
    setQueue((prev) => [...prev.slice(1), prev[0]]);
  };

  const goBack = () => {
    setQueue((prev) => {
      if (prev.length <= 1) return prev;
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, -1)];
    });
  };

  const undo = async () => {
    if (isLocked) return;
    const [lastAction, ...rest] = undoStack;
    if (!lastAction) return;
    const confirmedSnapshot = confirmedList.find((item) => item.txId === lastAction.txId);

    setIsUndoing(true);
    setUndoStack(rest);

    setTimeout(() => {
      setConfirmedList((prev) => removeFirstMatch(prev, (item) => item.txId === lastAction.txId));
      setQueue((prev) =>
        prev.some((tx) => tx.id === lastAction.txId) ? prev : [lastAction.transaction, ...prev],
      );
      setIsUndoing(false);
    }, 200);

    const revert = () => {
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
  };

  const closeCategoryMenuAndReturnFocus = () => {
    setIsCategoryMenuOpen(false);
    categoryMenuTriggerRef.current?.focus();
  };

  const openCategoryMenu = (focus: 'first' | 'last' | 'current' = 'current') => {
    const last = categories.length - 1;
    if (last < 0) {
      setCategoryMenuActiveIndex(0);
    } else if (focus === 'first') {
      setCategoryMenuActiveIndex(0);
    } else if (focus === 'last') {
      setCategoryMenuActiveIndex(last);
    } else {
      setCategoryMenuActiveIndex((idx) => Math.max(0, Math.min(idx, last)));
    }
    setIsCategoryMenuOpen(true);
  };

  const onCategoryTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (isLocked) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openCategoryMenu('first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openCategoryMenu('last');
    }
  };

  const onCategoryListboxKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isLocked) return;
    if (categories.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCategoryMenuAndReturnFocus();
      }
      return;
    }
    const last = categories.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCategoryMenuActiveIndex((i) => (i >= last ? 0 : i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCategoryMenuActiveIndex((i) => (i <= 0 ? last : i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setCategoryMenuActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setCategoryMenuActiveIndex(last);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCategoryMenuAndReturnFocus();
    } else if (e.key === 'Tab') {
      setIsCategoryMenuOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const category = categories[categoryMenuActiveIndex];
      if (!category) return;
      void assignCategory(category.id);
      closeCategoryMenuAndReturnFocus();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const keyToIndex = e.key === '0' ? 9 : parseInt(e.key, 10) - 1;
      if (keyToIndex >= 0 && keyToIndex < favoriteCategories.length && current) {
        void assignCategory(favoriteCategories[keyToIndex].id);
        return;
      }
      if (e.key === 'ArrowLeft' && current) goBack();
      if (e.key === 'ArrowRight' && current) skip();
      if ((e.key === 'u' || e.key === 'U') && undoStack.length > 0) void undo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, favoriteCategories, undoStack, isAssigning]);

  useEffect(() => {
    if (!isCategoryMenuOpen) return;
    const node = categoryMenuOptionRefs.current[categoryMenuActiveIndex];
    if (node) node.focus();
  }, [isCategoryMenuOpen, categoryMenuActiveIndex]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!categoryMenuRef.current) return;
      if (!categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col gap-6">
        <span className="sr-only">Loading categorize queue…</span>
        <div aria-hidden="true" className="h-24 animate-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)]" />
        <div aria-hidden="true" className="h-105 animate-pulse rounded-[36px] border border-white/60 bg-[rgba(255,253,247,0.5)]" />
        <div aria-hidden="true" className="flex gap-3">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="h-10 flex-1 animate-pulse rounded-full border border-white/60 bg-[rgba(255,253,247,0.5)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[rgba(197,112,74,0.4)] bg-[rgba(245,180,160,0.4)] px-6 py-5 text-[15px] text-[#6b3a1f]"
      >
        <div className="min-w-0 flex-1">
          <div className="font-serif text-base font-medium">Couldn't load categorize queue</div>
          <div className="mt-0.5 text-[13px] text-[#7a4b2f]/85">{error}</div>
        </div>
        <button
          type="button"
          onClick={() => void fetchData()}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[#6b3a1f] px-4 py-2 text-[13px] font-medium text-cream shadow-[0_6px_18px_-6px_rgba(107,58,31,0.45)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b3a1f]/40 motion-reduce:hover:translate-y-0"
        >
          Try again
        </button>
      </div>
    );
  }

  /* ─── All done ─── */
  if (remaining === 0 && queue.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        {/* Flower mark */}
        <div className="relative mb-3 h-22.5 w-22.5">
          {['#cae0a8', '#f8d7c0', '#dcd3f0', '#f5e3a0', '#c6e3d4'].map((color, i) => (
            <span
              key={i}
              className="absolute left-8.5p-0 h-9 w-5.5 origin-[50%_130%]"
              style={{
                transform: `rotate(${i * 72}deg)`,
                background: color,
                borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
              }}
            />
          ))}
          <span
            className="absolute left-6.75 top-6.75 z-2 flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #cae0a8, #8eb567)',
              boxShadow: '0 6px 20px rgba(93,138,63,0.3)',
            }}
          >
            <Check aria-hidden="true" className="h-5 w-5" strokeWidth={2.8} />
          </span>
        </div>
        <h2
          className="m-0 text-[32px] font-normal tracking-tight sm:text-[38px] md:text-[42px]"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
        >
          All sorted.
        </h2>
        <p className="m-0 max-w-105 px-4 text-[15px] leading-relaxed sm:px-0 sm:text-base" style={{ color: 'var(--ink-2)' }}>
          Every transaction has a home. Your spending picture is complete.
        </p>
        <div className="mt-2 flex w-full flex-col items-stretch gap-3 px-4 sm:w-auto sm:flex-row sm:items-center sm:px-0">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium no-underline transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: 'var(--ink)',
              color: 'var(--cream)',
              boxShadow: '0 8px 22px -6px rgba(45,36,24,0.4)',
            }}
          >
            See dashboard <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.3} />
          </Link>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[15px] font-medium no-underline transition-colors hover:bg-white/50"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: 'var(--ink-2)',
              borderColor: 'rgba(45,36,24,0.18)',
            }}
          >
            View transactions
          </Link>
        </div>
      </div>
    );
  }

  const confirmedTop = confirmedList.slice(0, 4);
  const upNextPreview = upNext.slice(0, 4);
  const { whole, cents: centsPart } = current ? splitMoney(current.amount) : { whole: '0', cents: '00' };
  const isCredit = current?.type === 'credit';

  return (
    <>
      {/* ─── Header ─── */}
      <header className="flex flex-col gap-5 px-1 pt-1 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:pt-3">
        <div className="min-w-0">
          <div className="text-[12px] tracking-wide sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
            Categorize ·{' '}
            <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
              {remaining} remaining
            </em>
          </div>
          <h1
            className="m-0 my-1.5 text-[34px] font-normal leading-[1.05] tracking-tight sm:text-[42px] sm:leading-none md:text-[52px]"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            Sort your{' '}
            <em className="font-light italic" style={{ color: 'var(--accent)' }}>spending</em>
          </h1>
        </div>
        {/* Progress */}
        <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-40 sm:items-end">
          <div className="italic" style={{ fontFamily: "'Fraunces', serif", fontSize: 13, color: 'var(--ink-3)' }}>
            <span className="not-italic text-[22px] font-normal tracking-tight sm:text-[28px]" style={{ color: 'var(--ink)' }}>
              {confirmedList.length}
            </span>{' '}
            of {totalUncategorized}
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[rgba(45,36,24,0.06)] sm:w-40">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out motion-reduce:transition-none"
              style={{
                width: `${Math.max(progressPct, 2)}%`,
                background: 'linear-gradient(90deg, #cae0a8, #8eb567)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            />
          </div>
        </div>
      </header>

      {/* ─── Hero transaction card ─── */}
      {current && (
        <div
          className="relative z-30 rounded-[28px] border sm:rounded-[36px]"
          style={{
            background: 'rgba(255,253,247,0.6)',
            borderColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(28px) saturate(150%)',
            WebkitBackdropFilter: 'blur(28px) saturate(150%)',
            boxShadow: '0 20px 60px -15px rgba(45,36,24,0.14), inset 0 0 0 1px rgba(255,255,255,0.5)',
          }}
        >
          {/* Gradient background */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] sm:rounded-[36px]"
            style={{
              background: isCredit
                ? 'radial-gradient(ellipse at 0% 0%, rgba(202,224,168,0.6), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(198,227,212,0.4), transparent 50%)'
                : 'radial-gradient(ellipse at 0% 0%, rgba(248,215,192,0.6), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(245,227,160,0.4), transparent 50%)',
            }}
          />

          {/* Tx-specific content — fades out on assign, fades in on next tx */}
          <div
            key={current.id}
            className="categorize-content relative z-1"
            data-leaving={isLocked ? 'true' : undefined}
            aria-live="polite"
          >
            {/* Top: meta + amount — stacked on mobile, side-by-side from sm */}
            <div className="flex flex-col gap-3 px-5 pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-7 sm:pt-8 md:px-9">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
                  {formatShortDate(current.date)}
                </span>
                <span
                  className="inline-flex rounded-full border px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    background: isCredit ? 'rgba(202,224,168,0.7)' : 'rgba(248,215,192,0.7)',
                    color: isCredit ? '#3d6b1f' : 'var(--ink-2)',
                  }}
                >
                  {isCredit ? '↑ credit' : '↓ debit'}
                </span>
              </div>
              <div
                className="text-[44px] font-normal leading-none tracking-tight tabular-nums sm:text-[52px] md:text-[64px]"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)', fontFeatureSettings: "'lnum', 'tnum'" }}
                aria-label={`${isCredit ? 'Credit' : 'Debit'} ${formatMoney(current.amount)}`}
              >
                <span className="align-top text-[26px] sm:text-[30px] md:text-4xl" style={{ color: 'var(--ink-3)' }}>
                  {isCredit ? '+' : '−'}
                </span>
                <span className="align-top text-[22px] sm:text-[26px] md:text-[32px]" style={{ color: 'var(--ink-3)' }}>$</span>
                {whole}
                <span className="text-[20px] sm:text-[24px] md:text-[28px]" style={{ color: 'var(--ink-3)' }}>.{centsPart}</span>
              </div>
            </div>

            {/* Merchant name */}
            <div className="px-5 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5 md:px-9 md:pb-7">
              <h2
                className="m-0 text-[26px] font-normal leading-tight tracking-tight sm:text-[32px] md:text-[38px]"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
              >
                {prettyName(current.merchant ?? current.description)}
              </h2>
              {current.merchant && (
                <p className="m-0 mt-1.5 max-w-125 truncate text-[13px] sm:text-sm" style={{ color: 'var(--ink-3)' }}>
                  {current.description}
                </p>
              )}
            </div>
          </div>

          {/* Category selection */}
          <div className="relative z-10 px-5 pb-6 sm:px-7 sm:pb-7 md:px-9">
            <div
              className="mb-3 text-[13px] italic sm:mb-3.5 sm:text-sm"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
            >
              Pick a category
            </div>
            <div className="flex flex-wrap gap-2">
              {favoriteCategories.map((cat, i) => (
                <button
                  key={cat.id}
                  disabled={isLocked}
                  onClick={() => void assignCategory(cat.id)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-[15px] font-medium transition-all enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:scale-[1.03] enabled:active:translate-y-0 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-0 sm:text-sm motion-reduce:transform-none motion-reduce:transition-none"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: 'var(--ink)',
                    borderColor: 'rgba(255,255,255,0.7)',
                    background: `linear-gradient(135deg, ${lighten(cat.color, 0.7)}, ${lighten(cat.color, 0.82)})`,
                    boxShadow: '0 4px 14px -4px rgba(45,36,24,0.1)',
                    touchAction: 'manipulation',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs md:inline-flex"
                    style={{
                      fontFamily: "'Fraunces', serif",
                      background: 'rgba(255,255,255,0.65)',
                      color: 'var(--ink-2)',
                      boxShadow: 'inset 0 0 0 1px rgba(45,36,24,0.08)',
                    }}
                  >
                    {i === 9 ? 0 : i + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mr-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: cat.color, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }}
                  />
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* All categories dropdown */}
            <div className="relative mt-4" ref={categoryMenuRef}>
              <button
                ref={categoryMenuTriggerRef}
                type="button"
                disabled={isLocked}
                aria-haspopup="listbox"
                aria-expanded={isCategoryMenuOpen}
                aria-controls="categorize-category-listbox"
                onClick={() => (isCategoryMenuOpen ? closeCategoryMenuAndReturnFocus() : openCategoryMenu('current'))}
                onKeyDown={onCategoryTriggerKeyDown}
                className="flex min-h-11 w-full items-center justify-between rounded-full border px-5 py-2.5 text-sm italic transition-colors enabled:cursor-pointer enabled:hover:bg-white/75 disabled:cursor-not-allowed disabled:opacity-55"
                style={{
                  fontFamily: "'Fraunces', serif",
                  color: 'var(--ink-3)',
                  background: 'rgba(255,255,255,0.5)',
                  borderColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                  touchAction: 'manipulation',
                }}
              >
                <span>All {categories.length} categories</span>
                {isCategoryMenuOpen ? (
                  <ChevronUp aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
                ) : (
                  <ChevronDown aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
                )}
              </button>
              {isCategoryMenuOpen && (
                <div
                  id="categorize-category-listbox"
                  role="listbox"
                  aria-label="Choose category"
                  tabIndex={-1}
                  onKeyDown={onCategoryListboxKeyDown}
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-65 overflow-y-auto rounded-[22px] border p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none"
                  style={{
                    background: 'rgba(255,253,247,0.94)',
                    borderColor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(24px) saturate(140%)',
                    boxShadow: '0 16px 44px -10px rgba(45,36,24,0.2), inset 0 0 0 1px rgba(255,255,255,0.5)',
                  }}
                >
                  {categories.map((cat, idx) => (
                    <button
                      key={cat.id}
                      ref={(node) => {
                        categoryMenuOptionRefs.current[idx] = node;
                      }}
                      type="button"
                      role="option"
                      aria-selected={categoryMenuActiveIndex === idx}
                      tabIndex={categoryMenuActiveIndex === idx ? 0 : -1}
                      onFocus={() => setCategoryMenuActiveIndex(idx)}
                      disabled={isLocked}
                      className="flex min-h-11 w-full items-center gap-2.5 rounded-[14px] border-0 bg-transparent px-3.5 py-2.5 text-left text-sm transition-colors enabled:cursor-pointer enabled:hover:bg-[rgba(45,36,24,0.06)] disabled:cursor-not-allowed disabled:opacity-55"
                      style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)', touchAction: 'manipulation' }}
                      onClick={() => {
                        void assignCategory(cat.id);
                        closeCategoryMenuAndReturnFocus();
                      }}
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: cat.color, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }}
                      />
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation bar */}
          <div
            className="relative z-1 flex items-center justify-between gap-3 rounded-b-[28px] border-t border-dashed px-4 py-3 sm:gap-4 sm:rounded-b-[36px] sm:px-8 sm:py-4"
            style={{ borderColor: 'rgba(45,36,24,0.1)', background: 'rgba(255,255,255,0.25)' }}
          >
            <button
              onClick={goBack}
              aria-label="Previous transaction"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50 sm:px-4"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-3)', touchAction: 'manipulation' }}
            >
              <span aria-hidden="true" className="hidden md:inline-flex"><KeyHint char="←" /></span>
              <span aria-hidden="true" className="text-base md:hidden">←</span>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div
              className="text-[12px] italic tabular-nums sm:text-[13px]"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
            >
              {positionInBatch} of {remaining + confirmedList.length}
            </div>
            <button
              onClick={skip}
              aria-label="Skip transaction"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 sm:px-5"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: 'var(--ink)',
                color: 'var(--cream)',
                border: 0,
                boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
                touchAction: 'manipulation',
              }}
            >
              Skip{' '}
              <span
                aria-hidden="true"
                className="inline-flex h-5.5 w-5.5 items-center justify-center rounded-md text-xs font-medium"
                style={{
                  fontFamily: "'Fraunces', serif",
                  background: 'rgba(255,255,255,0.15)',
                  color: 'rgba(253,249,240,0.8)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              >
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Bottom row: up next + confirmed ─── */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {/* Up next */}
        <div
          className="rounded-[20px] border p-4 sm:rounded-3xl sm:p-5"
          style={{
            background: 'rgba(255,253,247,0.45)',
            borderColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px) saturate(140%)',
            boxShadow: '0 8px 28px -8px rgba(45,36,24,0.08)',
          }}
        >
          <div
            className="mb-3.5 flex items-center justify-between border-b border-dashed pb-2.5"
            style={{ borderColor: 'rgba(45,36,24,0.1)' }}
          >
            <span
              className="text-[13px] italic"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
            >
              Up next
            </span>
            {upNext.length > 4 && (
              <span
                className="rounded-full bg-[rgba(45,36,24,0.06)] px-2.5 py-0.5 text-xs not-italic"
                style={{ color: 'var(--ink-3)' }}
              >
                +{upNext.length - 4} more
              </span>
            )}
          </div>
          <div className="flex min-h-55 flex-col">
            {upNextPreview.length === 0 ? (
              <p className="m-auto py-4 text-center text-[13px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>
                That's the last one in the queue.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {upNextPreview.map((tx) => (
                  <div
                    key={tx.id}
                    className="grid items-center gap-2.5 rounded-xl px-1.5 py-2"
                    style={{ gridTemplateColumns: '8px 1fr auto' }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: tx.type === 'credit' ? '#cae0a8' : '#f8d7c0',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6)',
                      }}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
                        {prettyName(tx.merchant ?? tx.description)}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                        {formatShortDate(tx.date)}
                      </span>
                    </div>
                    <span
                      className="shrink-0 text-sm font-medium"
                      style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}
                    >
                      {tx.type === 'credit' ? '+' : '−'}{formatMoney(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Just confirmed */}
        <div
          className="rounded-[20px] border p-4 sm:rounded-3xl sm:p-5"
          style={{
            background: 'rgba(255,253,247,0.45)',
            borderColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px) saturate(140%)',
            boxShadow: '0 8px 28px -8px rgba(45,36,24,0.08)',
          }}
        >
          <div
            className="mb-3.5 flex items-center justify-between border-b border-dashed pb-2.5"
            style={{ borderColor: 'rgba(45,36,24,0.1)' }}
          >
            <span
              className="text-[13px] italic"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
            >
              Just confirmed
            </span>
            <button
              onClick={() => void undo()}
              disabled={undoStack.length === 0 || isLocked}
              aria-label="Undo last categorization"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] not-italic transition-all enabled:cursor-pointer enabled:hover:-translate-y-px enabled:hover:bg-white/90 disabled:cursor-default disabled:opacity-35 motion-reduce:enabled:hover:translate-y-0 sm:text-[11px]"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: 'var(--ink-2)',
                background: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(255,255,255,0.8)',
                touchAction: 'manipulation',
              }}
            >
              <span className="hidden md:inline-flex"><KeyHint char="U" /></span>
              undo
            </button>
          </div>
          <div className="flex min-h-55 flex-col">
            {confirmedTop.length === 0 ? (
              <p className="m-auto py-4 text-center text-[13px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>
                Assign a category to see confirmations here.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {confirmedTop.map((item, i) => (
                  <div
                    key={`${item.txId}-${i}`}
                    className="grid items-center gap-2 rounded-xl px-1.5 py-2"
                    style={{ gridTemplateColumns: '18px 1fr auto' }}
                  >
                    <span
                      className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${lighten(item.categoryColor, 0.3)}, ${item.categoryColor})` }}
                    >
                      <Check aria-hidden="true" className="h-2.5 w-2.5" strokeWidth={2.8} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
                        {prettyName(item.merchant)}
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-[11px] italic"
                        style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: item.categoryColor }}
                        />
                        {item.category}
                      </div>
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}
                    >
                      {item.type === 'credit' ? '+' : '−'}{formatMoney(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function KeyHint({ char }: { char: string }) {
  return (
    <span
      className="inline-flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md text-xs font-medium"
      style={{
        fontFamily: "'Fraunces', serif",
        background: 'rgba(255,255,255,0.6)',
        color: 'var(--ink-2)',
        boxShadow: 'inset 0 0 0 1px rgba(45,36,24,0.08)',
      }}
    >
      {char}
    </span>
  );
}
