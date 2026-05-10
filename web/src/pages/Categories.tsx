import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Category {
  id: number;
  name: string;
  isFavorite?: boolean;
  transactionCount?: number;
  totalCents?: number;
}

const PRESET_COLORS = ['#c96442', '#5b8a5a', '#6b8db5', '#a87cc4', '#d4a55a', '#e2738a', '#7ec1c1'];

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categories', { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
      const payload = (await res.json()) as { data: Category[] };
      setCategories(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const createCategory = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to create category (${res.status})`);
      }
      setNewName('');
      setShowNewForm(false);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const renameCategory = async (id: number) => {
    if (!editName.trim()) return;
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to rename category (${res.status})`);
      }
      setEditingId(null);
      setEditName('');
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename category');
    }
  };

  const deleteCategory = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to delete category (${res.status})`);
      }
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const toggleFavorite = async (category: Category) => {
    setError(null);
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !category.isFavorite }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to update favorite (${res.status})`);
      }
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">
            Manage your categories — changes apply to all transactions.
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>+ New category</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* New category form */}
      {showNewForm && (
        <Card className="bg-accent-soft">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <span className="text-[13px] font-bold">New category:</span>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Coffee shops"
              className="w-52"
              onKeyDown={(e) => { if (e.key === 'Enter') void createCategory(); }}
              autoFocus
            />
            <div className="flex gap-1.5">
              {PRESET_COLORS.map((color) => (
                <span
                  key={color}
                  className="h-5.5 w-5.5 cursor-pointer rounded-full border-[1.5px] border-border"
                  style={{ background: color }}
                />
              ))}
            </div>
            <div className="flex-1" />
            <Button variant="ghost" onClick={() => { setShowNewForm(false); setNewName(''); }}>cancel</Button>
            <Button onClick={() => void createCategory()} disabled={creating || !newName.trim()}>add →</Button>
          </CardContent>
        </Card>
      )}

      {/* Category grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-sketch bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((cat) => {
            const color = PRESET_COLORS[cat.id % PRESET_COLORS.length];
            return (
              <Card key={cat.id} className="shadow-sketch-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <span
                    className="h-7 w-7 shrink-0 rounded-full border-[1.5px] border-border"
                    style={{ background: color }}
                  />
                  <div className="min-w-0 flex-1">
                    {editingId === cat.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') void renameCategory(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => void renameCategory(cat.id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>✕</Button>
                      </div>
                    ) : (
                      <>
                        <div className="font-hand text-lg">{cat.name}</div>
                        <p className="text-xs text-muted-foreground">
                          {cat.transactionCount ?? '—'} transactions
                          {cat.totalCents != null && ` · $${(cat.totalCents / 100).toFixed(2)} this month`}
                        </p>
                      </>
                    )}
                  </div>
                  {editingId !== cat.id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => void toggleFavorite(cat)}
                        className={`flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border font-hand text-sm hover:bg-muted ${
                          cat.isFavorite ? 'bg-primary-soft text-primary' : 'bg-card'
                        }`}
                        title={cat.isFavorite ? 'Unfavorite' : 'Favorite'}
                      >
                        ★
                      </button>
                      <button
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-muted"
                        title="Rename"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-muted"
                        title="Merge into…"
                      >
                        ⇆
                      </button>
                      <button
                        onClick={() => void deleteCategory(cat.id)}
                        className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm text-primary hover:bg-primary-soft"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Warning */}
      <Card className="bg-muted shadow-sketch-sm">
        <CardContent className="flex items-center gap-2 p-3 text-[13px]">
          <span>⚠</span>
          <span>Deleting a category moves its transactions to <strong>Other</strong>. Merging keeps history.</span>
        </CardContent>
      </Card>
    </div>
  );
}
