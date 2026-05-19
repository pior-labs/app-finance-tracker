import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Category {
  id: number;
  name: string;
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
  amount: number;
  at: number;
}

function formatMoney(cents: number): string {
  const value = Math.abs(cents) / 100;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function relativeTime(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

/**
 * CATEGORIZE FIVE — Wide three-stripe layout.
 * Just-confirmed feed (top, full width) · card stack (centered) · up-next queue (bottom, full width).
 */
export function CategorizeFive() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [queue, setQueue] = useState<Transaction[]>([]);
  const [totalUncategorized, setTotalUncategorized] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmedList, setConfirmedList] = useState<ConfirmedItem[]>([]);
  const [lastAction, setLastAction] = useState<{ txId: number; categoryId: number } | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [, setTick] = useState(0);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  const categorizedCount = totalTransactions - totalUncategorized + confirmedList.length;
  const remaining = Math.max(0, totalUncategorized - confirmedList.length);
  const progressPct = totalTransactions > 0 ? Math.round((categorizedCount / totalTransactions) * 100) : 0;
  const current = queue[0] ?? null;
  const upNext = queue.slice(1);

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

  // Keep relative timestamps fresh
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 10_000);
    return () => window.clearInterval(id);
  }, []);

  const assignCategory = async (categoryId: number) => {
    if (!current) return;
    const category = categories.find((c) => c.id === categoryId);

    setLastAction({ txId: current.id, categoryId });
    setConfirmedList((prev) => [
      {
        txId: current.id,
        merchant: current.merchant ?? current.description,
        category: category?.name ?? 'Unknown',
        amount: current.amount,
        at: Date.now(),
      },
      ...prev,
    ]);
    setQueue((prev) => prev.slice(1));

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

  const jumpTo = (txId: number) => {
    setQueue((prev) => {
      const idx = prev.findIndex((t) => t.id === txId);
      if (idx <= 0) return prev;
      const target = prev[idx];
      return [target, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <div className="h-[520px] w-full max-w-5xl animate-pulse rounded-sketch bg-muted" />
      </div>
    );
  }

  if (remaining === 0 && queue.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-20 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-[1.5px] border-border bg-primary-soft">
          <span className="font-hand text-4xl text-primary">:)</span>
        </div>
        <h2 className="font-hand text-3xl">Inbox zero!</h2>
        <p className="max-w-sm text-[15px] text-muted-foreground">
          All transactions categorized. Treat yourself — or upload the next statement.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/">See dashboard</Link>
          </Button>
          <Button variant="ghost">Upload next statement →</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-5">
      {/* JUST CONFIRMED — top strip */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="font-hand text-xl">Just confirmed</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{confirmedList.length} this session</span>
            {lastAction && (
              <button
                onClick={() => void undo()}
                className="font-hand text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline cursor-pointer"
              >
                undo last (U)
              </button>
            )}
          </div>
        </div>

        {confirmedList.length === 0 ? (
          <div className="rounded-sketch border-[1.3px] border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
            Nothing yet — assign a category to start the feed.
          </div>
        ) : (
          <ul className="divide-y-[1.3px] divide-dashed divide-border rounded-sketch border-[1.3px] border-border bg-card shadow-sketch-xs">
            {confirmedList.slice(0, 3).map((item, i) => (
              <li
                key={`${item.txId}-${i}`}
                className="grid grid-cols-[20px_1fr_180px_120px_70px] items-center gap-3 px-4 py-2.5"
              >
                <span className="font-hand text-lg leading-none text-good">✓</span>
                <span className="truncate text-sm font-bold">{item.merchant}</span>
                <span className="inline-flex w-fit items-center gap-1 rounded-full border-[1.3px] border-border bg-good-soft px-2 py-0.5 text-[11px] font-bold text-good">
                  {item.category}
                </span>
                <span className="text-right font-hand text-base text-foreground">−{formatMoney(item.amount)}</span>
                <span className="text-right text-[11px] text-muted-foreground">{relativeTime(item.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CARD STACK — centered */}
      <section className="flex justify-center">
        {current && (
          <div className="relative w-full max-w-xl">
            {queue.length > 2 && (
              <div
                className="absolute inset-0 rounded-sketch border-[1.5px] border-border bg-muted"
                style={{ transform: 'rotate(1.8deg) translate(7px, 7px)' }}
              />
            )}
            {queue.length > 1 && (
              <div
                className="absolute inset-0 rounded-sketch border-[1.5px] border-border bg-muted"
                style={{ transform: 'rotate(-2.2deg) translate(-6px, 4px)' }}
              />
            )}

            <Card className="relative overflow-hidden" style={{ transform: 'rotate(-0.4deg)' }}>
              {/* Progress strip */}
              <div className="border-b-[1.5px] border-dashed border-border bg-muted/50 px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-hand text-2xl leading-none text-primary">{remaining}</span>
                    <span className="text-xs text-muted-foreground">left · {progressPct}% done</span>
                  </div>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full border-[1.3px] border-border bg-card">
                    <div
                      className="h-full bg-good transition-[width] duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="font-hand text-xs text-muted-foreground">
                    {categorizedCount} / {totalTransactions}
                  </span>
                </div>
              </div>

              <CardContent className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border-[1.3px] border-dashed border-muted-foreground bg-transparent px-2.5 py-0.5 text-xs text-muted-foreground">
                        {current.date}
                      </span>
                      <span className="text-xs text-muted-foreground">card · {current.type}</span>
                    </div>
                    <h2 className="font-hand text-4xl leading-none">{current.merchant ?? current.description}</h2>
                    <p className="text-[13px] text-muted-foreground">{current.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-hand text-5xl leading-none text-primary">
                      −{formatMoney(current.amount)}
                    </div>
                  </div>
                </div>

                <hr className="border-border opacity-85" />

                <div className="space-y-2.5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Tap or press a number</p>
                  <div className="flex flex-wrap gap-2">
                    {favoriteCategories.map((cat, i) => (
                      <button
                        key={cat.id}
                        onClick={() => void assignCategory(cat.id)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-[1.3px] border-border px-2.5 py-1 text-[13px] shadow-sketch-xs transition hover:-translate-y-px hover:bg-primary-soft ${
                          i === 0 ? 'bg-primary-soft' : 'bg-card'
                        }`}
                      >
                        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border-[1.2px] border-border bg-muted px-1 font-hand text-sm leading-none">
                          {i === 9 ? 0 : i + 1}
                        </kbd>
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="relative" ref={categoryMenuRef}>
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isCategoryMenuOpen}
                      className="flex h-10 w-full items-center justify-between rounded-lg border-[1.3px] border-border bg-card px-3 text-sm shadow-sketch-xs"
                      onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                    >
                      <span className="text-muted-foreground">or pick from all {categories.length} categories…</span>
                      <span className="text-xs text-muted-foreground">{isCategoryMenuOpen ? '▲' : '▼'}</span>
                    </button>
                    {isCategoryMenuOpen && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border-[1.3px] border-border bg-card p-1 shadow-sketch">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            className="block w-full rounded-md px-2.5 py-2 text-left text-sm hover:bg-primary-soft"
                            onClick={() => {
                              void assignCategory(cat.id);
                              setIsCategoryMenuOpen(false);
                            }}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <div className="flex items-center justify-between border-t-[1.5px] border-dashed border-border px-6 py-3 font-hand text-lg text-muted-foreground">
                <button onClick={goBack} className="cursor-pointer transition hover:text-foreground">← back</button>
                <div className="flex items-center gap-1.5 font-sans text-xs">
                  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border-[1.2px] border-border bg-muted px-1 font-hand text-sm leading-none">1–0</kbd>
                  <span className="text-muted-foreground">favorites</span>
                  <span className="text-muted-foreground/50">·</span>
                  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border-[1.2px] border-border bg-muted px-1 font-hand text-sm leading-none">U</kbd>
                  <span className="text-muted-foreground">undo</span>
                </div>
                <button onClick={skip} className="cursor-pointer transition hover:text-foreground">forward →</button>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* UP NEXT — bottom strip */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="font-hand text-xl">Up next</h3>
          <span className="text-xs text-muted-foreground">
            {upNext.length} loaded · {remaining} total left
          </span>
        </div>

        {upNext.length === 0 ? (
          <div className="rounded-sketch border-[1.3px] border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
            That was the last one in the queue.
          </div>
        ) : (
          <ul className="divide-y-[1.3px] divide-dashed divide-border rounded-sketch border-[1.3px] border-border bg-card shadow-sketch-xs">
            {upNext.slice(0, 6).map((tx, i) => (
              <li key={tx.id}>
                <button
                  onClick={() => jumpTo(tx.id)}
                  className="grid w-full cursor-pointer grid-cols-[28px_70px_1fr_120px] items-center gap-3 px-4 py-2.5 text-left transition hover:bg-primary-soft"
                >
                  <span className="font-hand text-base text-muted-foreground">{i + 2}.</span>
                  <span className="text-xs text-muted-foreground">{tx.date}</span>
                  <span className="truncate text-sm">
                    <span className="font-bold">{tx.merchant ?? tx.description}</span>
                    {tx.merchant && (
                      <span className="ml-2 text-xs text-muted-foreground">{tx.description}</span>
                    )}
                  </span>
                  <span className="text-right font-hand text-base text-foreground">
                    {tx.type === 'credit' ? '+' : '−'}{formatMoney(tx.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {upNext.length > 6 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            + {upNext.length - 6} more queued
          </p>
        )}
      </section>
    </div>
  );
}
