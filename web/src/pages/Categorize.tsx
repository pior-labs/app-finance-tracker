import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePublishCategorizeStats } from '@/hooks/useCategorizeStats';

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

/**
 * CATEGORIZE SIX — Vertical feed (design E).
 * Subtle header counter (no progress bar). Just-confirmed rows above,
 * highlighted current card in the middle, up-next rows below.
 * Shortcuts pinned to the foot of the scrolling column.
 */
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

  const categorizedCount = totalTransactions - totalUncategorized + confirmedList.length;
  const remaining = Math.max(0, totalUncategorized - confirmedList.length);
  const positionInBatch = confirmedList.length + 1;
  const current = queue[0] ?? null;
  const upNext = queue.slice(1);

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
        <div className="h-[520px] w-full max-w-2xl animate-pulse rounded-sketch bg-muted" />
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

  const confirmedTop = confirmedList.slice(0, 4);

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto px-6 py-7">
        <div className="mx-auto flex w-full max-w-2xl flex-col">

          {/* JUST CONFIRMED */}
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Just confirmed
            </p>
            <button
              onClick={() => void undo()}
              disabled={!lastAction}
              className="flex items-center gap-1.5 rounded-lg border-[1.3px] border-border bg-card px-2 py-1 text-[11px] shadow-sketch-xs transition enabled:cursor-pointer enabled:hover:-translate-y-px enabled:hover:bg-primary-soft disabled:opacity-40"
            >
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border-[1.2px] border-border bg-muted px-1 font-hand text-xs leading-none">
                U
              </kbd>
              undo last
            </button>
          </div>
          {confirmedTop.length === 0 ? (
            <div className="rounded-sketch border-[1.3px] border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
              Nothing yet — assign a category to start the feed.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-sketch border-[1.3px] border-border bg-card shadow-sketch-xs">
              {confirmedTop.map((item, i) => (
                <li
                  key={`${item.txId}-${i}`}
                  className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 ${
                    i > 0 ? 'border-t-[1px] border-dashed border-border/60' : ''
                  }`}
                  style={{ opacity: 1 - i * 0.12 }}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="font-hand text-base leading-none text-good">✓</span>
                    <span className="truncate text-sm font-bold">{item.merchant}</span>
                  </span>
                  <span className="inline-flex items-center rounded-full border-[1.3px] border-border bg-good-soft px-2 py-0.5 text-[11px] font-bold text-good">
                    {item.category}
                  </span>
                  <span className="w-16 text-right font-hand text-sm">
                    −{formatMoney(item.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Divider — reviewing now */}
          <div className="flex items-center gap-3 px-2 py-6">
            <div className="h-px flex-1 bg-border" />
            <span className="font-hand text-[11px] uppercase tracking-wider text-muted-foreground">
              reviewing now
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* CURRENT — highlighted card */}
          {current && (
            <Card
              className="border-2 border-primary"
              style={{ boxShadow: '3px 4px 0 0 var(--primary)' }}
            >
              <div className="px-7 pb-5 pt-6">
                <div className="flex items-start justify-between gap-5">
                  <div className="space-y-1.5">
                    <span className="font-hand text-xs text-muted-foreground">
                      {current.date} · {current.type}
                    </span>
                    <h2 className="font-hand text-4xl leading-none">
                      {current.merchant ?? current.description}
                    </h2>
                    <p className="text-[13px] text-muted-foreground">{current.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-hand text-5xl leading-none text-primary">
                      {current.type === 'credit' ? '+' : '−'}{formatMoney(current.amount)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-7 pb-6">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Pick a category
                </p>
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

                <div className="relative mt-6" ref={categoryMenuRef}>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isCategoryMenuOpen}
                    className="flex h-9 w-full items-center justify-between rounded-lg border-[1.3px] border-border bg-card px-3 text-sm shadow-sketch-xs"
                    onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                  >
                    <span className="text-muted-foreground">
                      or pick from all {categories.length} categories…
                    </span>
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

              <div className="flex items-center justify-between rounded-b-sketch border-t-[1.5px] border-dashed border-border bg-muted/40 px-6 py-3.5">
                <button
                  onClick={goBack}
                  className="flex cursor-pointer items-center gap-1.5 font-hand text-sm text-muted-foreground transition hover:text-foreground"
                >
                  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border-[1.2px] border-border bg-muted px-1 font-hand text-sm leading-none shadow-sketch-xs">
                    ←
                  </kbd>
                  skip
                </button>
                <button
                  onClick={skip}
                  className="flex cursor-pointer items-center gap-1.5 font-hand text-sm font-bold text-primary transition hover:opacity-80"
                >
                  forward
                  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border-[1.2px] border-border bg-muted px-1 font-hand text-sm leading-none text-foreground shadow-sketch-xs">
                    →
                  </kbd>
                </button>
              </div>
            </Card>
          )}

          {/* Divider — up next */}
          <div className="flex items-center gap-3 px-2 py-6">
            <div className="h-px flex-1 bg-border" />
            <span className="font-hand text-[11px] uppercase tracking-wider text-muted-foreground">
              up next
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* UP NEXT */}
          {upNext.length === 0 ? (
            <div className="rounded-sketch border-[1.3px] border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
              That was the last one in the queue.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-sketch border-[1.3px] border-border bg-card shadow-sketch-xs">
              {upNext.slice(0, 5).map((tx, i) => (
                <li
                  key={tx.id}
                  className={`grid grid-cols-[56px_1fr_auto] items-center gap-4 px-5 py-3 ${
                    i > 0 ? 'border-t-[1px] border-dashed border-border/60' : ''
                  }`}
                  style={{ opacity: 1 - i * 0.15 }}
                >
                  <span className="font-hand text-xs text-muted-foreground">{tx.date}</span>
                  <span className="truncate text-sm">
                    <span className="font-bold">{tx.merchant ?? tx.description}</span>
                    {tx.merchant && (
                      <span className="ml-2 text-xs text-muted-foreground">{tx.description}</span>
                    )}
                  </span>
                  <span className="w-16 text-right font-hand text-sm">
                    {tx.type === 'credit' ? '+' : '−'}{formatMoney(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {upNext.length > 5 && (
            <p className="mt-2 px-2 text-xs text-muted-foreground">
              + {upNext.length - 5} more in queue
            </p>
          )}


        </div>
      </div>
    </div>
  );
}
