import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Category {
  id: number;
  name: string;
  isFavorite?: boolean;
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
  merchant: string;
  category: string;
  amount: number;
}

function formatMoney(cents: number): string {
  const value = Math.abs(cents) / 100;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const categorizedCount = totalTransactions - totalUncategorized + confirmedList.length;
  const remaining = Math.max(0, totalUncategorized - confirmedList.length);
  const progressPct = totalTransactions > 0 ? Math.round((categorizedCount / totalTransactions) * 100) : 0;
  const current = queue[0] ?? null;
  const favoriteCategories = useMemo(() => {
    return categories.filter((category) => category.isFavorite).slice(0, 10);
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
      { merchant: current.merchant ?? current.description, category: category?.name ?? 'Unknown', amount: current.amount },
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
      <div className="flex h-full">
        <div className="flex-1 p-5">
          <div className="h-full min-h-96 animate-pulse rounded-sketch bg-muted" />
        </div>
        <div className="w-72 p-5">
          <div className="h-full min-h-96 animate-pulse rounded-sketch bg-muted" />
        </div>
      </div>
    );
  }

  /* Inbox zero! */
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
    <div className="flex h-full">
      {/* Main stage — card stack */}
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center p-5">
        {current && (
          <div className="w-full max-w-lg">
            {/* Card stack */}
            <div className="relative min-h-105">
              {/* Background cards for depth */}
              {queue.length > 2 && (
                <div
                  className="absolute inset-0 rounded-sketch border-[1.5px] border-border bg-muted"
                  style={{ transform: 'rotate(2deg) translate(8px, 8px)' }}
                />
              )}
              {queue.length > 1 && (
                <div
                  className="absolute inset-0 rounded-sketch border-[1.5px] border-border bg-muted"
                  style={{ transform: 'rotate(-3deg) translate(-6px, 4px)' }}
                />
              )}
              {/* Top card */}
              <Card className="relative" style={{ transform: 'rotate(-0.5deg)' }}>
                <CardContent className="flex h-full flex-col justify-between p-5 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border-[1.3px] border-dashed border-muted-foreground bg-transparent px-2.5 py-0.5 text-xs text-muted-foreground">
                        {current.date}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        card • {current.type}
                      </span>
                    </div>
                    <h2 className="font-hand text-4xl leading-none">{current.merchant ?? current.description}</h2>
                    <p className="text-[13px] text-muted-foreground">{current.description}</p>
                    <div className="font-hand text-5xl text-primary">
                      −{formatMoney(current.amount)}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {favoriteCategories.map((cat, i) => (
                        <button
                          key={cat.id}
                          onClick={() => void assignCategory(cat.id)}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-[1.3px] border-border px-2.5 py-1 text-[13px] shadow-sketch-xs ${
                            i === 0
                              ? 'bg-primary-soft'
                              : 'bg-card'
                          }`}
                        >
                          <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border-[1.2px] border-border bg-muted px-1 font-hand text-sm leading-none">
                            {i === 9 ? 0 : i + 1}
                          </kbd>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">All categories</p>
                      <div className="relative" ref={categoryMenuRef}>
                        <button
                          type="button"
                          aria-haspopup="listbox"
                          aria-expanded={isCategoryMenuOpen}
                          className="flex h-10 w-full items-center justify-between rounded-lg border-[1.3px] border-border bg-card px-3 text-sm shadow-sketch-xs"
                          onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                        >
                          <span className="text-muted-foreground">Choose a category...</span>
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
                  </div>

                  {/* Swipe hints */}
                  <div className="flex items-center justify-between pt-2 font-hand text-lg text-muted-foreground">
                    <button onClick={goBack} className="cursor-pointer hover:text-foreground">← back</button>
                    <button onClick={skip} className="cursor-pointer hover:text-foreground">forward →</button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Side rail */}
      <div className="hidden w-75 flex-col gap-4 border-l-[1.3px] border-dashed border-muted-foreground p-5 lg:flex bg-muted" >
        {/* Progress */}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Progress</p>
          <div className="flex items-baseline gap-2">
            <span className="font-hand text-4xl">{remaining}</span>
            <span className="text-sm text-muted-foreground">left to review</span>
          </div>
          <Progress value={progressPct} variant="good" />
          <p className="text-xs text-muted-foreground">{progressPct}% complete</p>
        </div>

        <hr className="border-border opacity-85" />

        {/* Recently confirmed */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Just confirmed</p>
          {confirmedList.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nothing yet — start categorizing!</p>
          ) : (
            confirmedList.slice(0, 4).map((item, i) => (
              <Card key={i} className="shadow-sketch-sm">
                <CardContent className="space-y-1 p-3">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-bold">{item.merchant}</span>
                    <span className="text-[13px] font-bold">−{formatMoney(item.amount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full border-[1.3px] border-border bg-good-soft px-2 py-0.5 text-[11px] font-bold text-good shadow-none">
                      ✓ {item.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground">· just now</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <hr className="border-border opacity-85" />

        {/* Shortcuts */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Shortcuts</p>
          <div className="flex flex-wrap gap-1.5">
            <KbdChip keys="Num keys" label="favorites" />
            <KbdChip keys="←" label="back" />
            <KbdChip keys="→" label="forward" />
            <KbdChip keys="U" label="undo" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KbdChip({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border-[1.3px] border-border bg-card px-2.5 py-1 text-[13px] shadow-sketch-xs">
      <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border-[1.2px] border-border bg-muted px-1 font-hand text-sm leading-none">
          {keys}
      </kbd>
      {label}
    </span>
  );
}
