import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublishCategorizeStats } from '@/hooks/useCategorizeStats';

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
  at: number;
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

export function CategorizePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [queue, setQueue] = useState<Transaction[]>([]);
  const [totalUncategorized, setTotalUncategorized] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmedList, setConfirmedList] = useState<ConfirmedItem[]>([]);
  const [lastAction, setLastAction] = useState<{ txId: number; categoryId: number } | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const categorizedCount = totalTransactions - totalUncategorized + confirmedList.length;
  const remaining = Math.max(0, totalUncategorized - confirmedList.length);
  const positionInBatch = confirmedList.length + 1;
  const current = queue[0] ?? null;
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
    try {
      const [catRes, txRes, statsRes] = await Promise.all([
        fetch('/api/categories', { credentials: 'include' }),
        fetch('/api/transactions?status=needs_review&limit=20', { credentials: 'include' }),
        fetch('/api/transactions/stats', { credentials: 'include' }),
      ]);
      if (catRes.ok) {
        const cats = (await catRes.json()) as { data: Category[] };
        setCategories(cats.data);
      }
      if (txRes.ok) {
        const txPayload = (await txRes.json()) as { data: Transaction[]; pagination: { total: number } };
        setQueue(txPayload.data);
        setTotalUncategorized(txPayload.pagination.total);
      }
      if (statsRes.ok) {
        const statsPayload = (await statsRes.json()) as { data: { totalTransactionCount: number } };
        setTotalTransactions(statsPayload.data.totalTransactionCount);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const assignCategory = async (categoryId: number) => {
    if (!current) return;
    const category = categories.find((c) => c.id === categoryId);

    setAssigningId(current.id);
    setLastAction({ txId: current.id, categoryId });
    setConfirmedList((prev) => [
      {
        txId: current.id,
        merchant: current.merchant ?? current.description,
        category: category?.name ?? 'Unknown',
        categoryColor: category?.color ?? '#9c8a73',
        amount: current.amount,
        at: Date.now(),
      },
      ...prev,
    ]);

    setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      setAssigningId(null);
    }, 280);

    try {
      const response = await fetch(`/api/transactions/${current.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId, status: 'confirmed' }),
      });
      if (!response.ok) {
        setQueue((prev) => [current, ...prev]);
        setConfirmedList((prev) => prev.slice(1));
        setLastAction(null);
      }
    } catch {
      setQueue((prev) => [current, ...prev]);
      setConfirmedList((prev) => prev.slice(1));
      setLastAction(null);
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
    if (!lastAction) return;
    try {
      await fetch(`/api/transactions/${lastAction.txId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: null, status: 'needs_review' }),
      });
      setConfirmedList((prev) => prev.slice(1));
      setLastAction(null);
      void fetchData();
    } catch {
      // ignore
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
      if ((e.key === 'u' || e.key === 'U') && lastAction) void undo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, favoriteCategories, lastAction]);

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
      <div className="flex flex-col gap-6">
        <div className="h-24 animate-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)]" />
        <div className="h-[420px] animate-pulse rounded-[36px] border border-white/60 bg-[rgba(255,253,247,0.5)]" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="h-10 flex-1 animate-pulse rounded-full border border-white/60 bg-[rgba(255,253,247,0.5)]" />
          ))}
        </div>
      </div>
    );
  }

  /* ─── All done ─── */
  if (remaining === 0 && queue.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        {/* Flower mark */}
        <div className="relative mb-3 h-[90px] w-[90px]">
          {['#cae0a8', '#f8d7c0', '#dcd3f0', '#f5e3a0', '#c6e3d4'].map((color, i) => (
            <span
              key={i}
              className="absolute left-[34px] top-0 h-9 w-[22px] origin-[50%_130%]"
              style={{
                transform: `rotate(${i * 72}deg)`,
                background: color,
                borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
              }}
            />
          ))}
          <span
            className="absolute left-[27px] top-[27px] z-[2] flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #cae0a8, #8eb567)',
              boxShadow: '0 6px 20px rgba(93,138,63,0.3)',
            }}
          >
            ✓
          </span>
        </div>
        <h2
          className="m-0 text-[42px] font-normal tracking-tight"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
        >
          All sorted.
        </h2>
        <p className="m-0 max-w-[420px] text-base leading-relaxed" style={{ color: 'var(--ink-2)' }}>
          Every transaction has a home. Your spending picture is complete.
        </p>
        <div className="mt-2 flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium no-underline transition-transform hover:-translate-y-px"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: 'var(--ink)',
              color: 'var(--cream)',
              boxShadow: '0 8px 22px -6px rgba(45,36,24,0.4)',
            }}
          >
            See dashboard <span>→</span>
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
      <header className="flex flex-wrap items-end justify-between gap-6 px-1 pt-3">
        <div>
          <div className="text-[13px] tracking-wide" style={{ color: 'var(--ink-3)' }}>
            Categorize ·{' '}
            <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
              {remaining} remaining
            </em>
          </div>
          <h1
            className="m-0 my-1.5 text-[52px] font-normal leading-none tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            Sort your{' '}
            <em className="font-light italic" style={{ color: 'var(--accent)' }}>spending</em>
          </h1>
        </div>
        {/* Progress */}
        <div className="flex min-w-[160px] flex-col items-end gap-1.5">
          <div className="italic" style={{ fontFamily: "'Fraunces', serif", fontSize: 14, color: 'var(--ink-3)' }}>
            <span className="not-italic text-[28px] font-normal tracking-tight" style={{ color: 'var(--ink)' }}>
              {confirmedList.length}
            </span>{' '}
            of {totalUncategorized}
          </div>
          <div className="relative h-2 w-40 overflow-hidden rounded-full bg-[rgba(45,36,24,0.06)]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
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
          className="relative overflow-hidden rounded-[36px] border transition-all duration-300"
          style={{
            background: 'rgba(255,253,247,0.6)',
            borderColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(28px) saturate(150%)',
            WebkitBackdropFilter: 'blur(28px) saturate(150%)',
            boxShadow: '0 20px 60px -15px rgba(45,36,24,0.14), inset 0 0 0 1px rgba(255,255,255,0.5)',
            ...(assigningId === current.id
              ? { transform: 'translateY(-12px) scale(0.98)', opacity: 0 }
              : {}),
          }}
        >
          {/* Gradient background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: isCredit
                ? 'radial-gradient(ellipse at 0% 0%, rgba(202,224,168,0.6), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(198,227,212,0.4), transparent 50%)'
                : 'radial-gradient(ellipse at 0% 0%, rgba(248,215,192,0.6), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(245,227,160,0.4), transparent 50%)',
            }}
          />

          {/* Top: meta + amount */}
          <div className="relative z-[1] flex items-start justify-between px-9 pt-8">
            <div className="flex items-center gap-2.5">
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
              className="text-[64px] font-normal leading-none tracking-tight"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)', fontFeatureSettings: "'lnum'" }}
            >
              <span className="align-top text-4xl" style={{ color: 'var(--ink-3)' }}>
                {isCredit ? '+' : '−'}
              </span>
              <span className="align-top text-[32px]" style={{ color: 'var(--ink-3)' }}>$</span>
              {whole}
              <span className="text-[28px]" style={{ color: 'var(--ink-3)' }}>.{centsPart}</span>
            </div>
          </div>

          {/* Merchant name */}
          <div className="relative z-[1] px-9 pb-7 pt-5">
            <h2
              className="m-0 text-[38px] font-normal leading-tight tracking-tight"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
            >
              {prettyName(current.merchant ?? current.description)}
            </h2>
            {current.merchant && (
              <p className="m-0 mt-1.5 max-w-[500px] truncate text-sm" style={{ color: 'var(--ink-3)' }}>
                {current.description}
              </p>
            )}
          </div>

          {/* Category selection */}
          <div className="relative z-[1] px-9 pb-7">
            <div
              className="mb-3.5 text-sm italic"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
            >
              Pick a category
            </div>
            <div className="flex flex-wrap gap-2">
              {favoriteCategories.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => void assignCategory(cat.id)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98]"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: 'var(--ink)',
                    borderColor: 'rgba(255,255,255,0.7)',
                    background: `linear-gradient(135deg, ${lighten(cat.color, 0.7)}, ${lighten(cat.color, 0.82)})`,
                    boxShadow: '0 4px 14px -4px rgba(45,36,24,0.1)',
                  }}
                >
                  <span
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs"
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
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isCategoryMenuOpen}
                onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between rounded-full border px-5 py-2.5 text-sm italic transition-colors hover:bg-white/75"
                style={{
                  fontFamily: "'Fraunces', serif",
                  color: 'var(--ink-3)',
                  background: 'rgba(255,255,255,0.5)',
                  borderColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span>All {categories.length} categories</span>
                <span className="not-italic text-[13px]">{isCategoryMenuOpen ? '⌃' : '⌄'}</span>
              </button>
              {isCategoryMenuOpen && (
                <div
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-[260px] overflow-y-auto rounded-[22px] border p-2"
                  style={{
                    background: 'rgba(255,253,247,0.94)',
                    borderColor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(24px) saturate(140%)',
                    boxShadow: '0 16px 44px -10px rgba(45,36,24,0.2), inset 0 0 0 1px rgba(255,255,255,0.5)',
                  }}
                >
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] border-0 bg-transparent px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-[rgba(45,36,24,0.06)]"
                      style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)' }}
                      onClick={() => {
                        void assignCategory(cat.id);
                        setIsCategoryMenuOpen(false);
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
            className="relative z-[1] flex items-center justify-between border-t border-dashed px-8 py-4"
            style={{ borderColor: 'rgba(45,36,24,0.1)', background: 'rgba(255,255,255,0.25)' }}
          >
            <button
              onClick={goBack}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white/50"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-3)' }}
            >
              <KeyHint char="←" /> Back
            </button>
            <div
              className="text-[13px] italic"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
            >
              {positionInBatch} of {remaining + confirmedList.length}
            </div>
            <button
              onClick={skip}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-transform hover:-translate-y-px"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: 'var(--ink)',
                color: 'var(--cream)',
                border: 0,
                boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
              }}
            >
              Skip{' '}
              <span
                className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-xs font-medium"
                style={{
                  fontFamily: "'Fraunces', serif",
                  background: 'rgba(255,255,255,0.15)',
                  color: 'rgba(253,249,240,0.8)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              >
                →
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Bottom row: confirmed + up next ─── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Just confirmed */}
        <div
          className="rounded-[24px] border p-5"
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
              disabled={!lastAction}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] not-italic transition-all enabled:cursor-pointer enabled:hover:-translate-y-px enabled:hover:bg-white/90 disabled:cursor-default disabled:opacity-35"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: 'var(--ink-2)',
                background: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(255,255,255,0.8)',
              }}
            >
              <KeyHint char="U" /> undo
            </button>
          </div>
          {confirmedTop.length === 0 ? (
            <p className="py-4 text-center text-[13px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>
              Assign a category to see confirmations here.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {confirmedTop.map((item, i) => (
                <div
                  key={`${item.txId}-${i}`}
                  className="grid items-center gap-2 rounded-xl px-1.5 py-2 transition-opacity"
                  style={{
                    gridTemplateColumns: '18px 1fr auto',
                    opacity: 1 - i * 0.18,
                  }}
                >
                  <span
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${lighten(item.categoryColor, 0.3)}, ${item.categoryColor})` }}
                  >
                    ✓
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
                    −{formatMoney(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Up next */}
        <div
          className="rounded-[24px] border p-5"
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
          {upNextPreview.length === 0 ? (
            <p className="py-4 text-center text-[13px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>
              That's the last one in the queue.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {upNextPreview.map((tx, i) => (
                <div
                  key={tx.id}
                  className="grid items-center gap-2.5 rounded-xl px-1.5 py-2 transition-opacity"
                  style={{
                    gridTemplateColumns: '8px 1fr auto',
                    opacity: 1 - i * 0.2,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: isCredit ? '#cae0a8' : '#f8d7c0',
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
    </>
  );
}

function KeyHint({ char }: { char: string }) {
  return (
    <span
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md text-xs font-medium"
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
