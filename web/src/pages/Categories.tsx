import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Category {
  id: number;
  name: string;
  color: string;
  isFavorite?: boolean;
}

const PRESET_COLORS = ['#c96442', '#5b8a5a', '#6b8db5', '#a87cc4', '#d4a55a', '#e2738a', '#7ec1c1'];
const DEFAULT_COLOR = PRESET_COLORS[2];
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [colorEditingId, setColorEditingId] = useState<number | null>(null);
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [colorEditValue, setColorEditValue] = useState(DEFAULT_COLOR);
  const [categoryPendingDelete, setCategoryPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    if (!HEX_COLOR_REGEX.test(newColor)) {
      setError('Color must be a valid hex value like #6b8db5.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to create category (${res.status})`);
      }
      setNewName('');
      setNewColor(DEFAULT_COLOR);
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

  const deleteCategory = async () => {
    if (!categoryPendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${categoryPendingDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to delete category (${res.status})`);
      }
      setCategoryPendingDelete(null);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeleting(false);
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

  const updateCategoryColor = async (id: number, color: string) => {
    if (!HEX_COLOR_REGEX.test(color)) {
      setError('Color must be a valid hex value like #6b8db5.');
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to update color (${res.status})`);
      }
      setColorEditingId(null);
      setColorEditValue(DEFAULT_COLOR);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update color');
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
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`h-5.5 w-5.5 cursor-pointer rounded-full border-[1.5px] border-border ${
                    newColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  }`}
                  style={{ background: color }}
                  title="Choose color"
                />
              ))}
            </div>
            <Input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="#6b8db5"
              className="w-28 uppercase"
              maxLength={7}
              aria-label="Custom category color"
            />
            <div className="flex-1" />
            <Button variant="ghost" onClick={() => { setShowNewForm(false); setNewName(''); setNewColor(DEFAULT_COLOR); }}>cancel</Button>
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
            const color = cat.color || DEFAULT_COLOR;
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
                        {colorEditingId === cat.id && (
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {PRESET_COLORS.map((swatch) => (
                              <button
                                key={swatch}
                                type="button"
                                onClick={() => setColorEditValue(swatch)}
                                className={`h-4.5 w-4.5 rounded-full border-[1.3px] border-border ${
                                  swatch.toLowerCase() === colorEditValue.toLowerCase()
                                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                                    : ''
                                }`}
                                style={{ background: swatch }}
                                title="Choose color"
                              />
                            ))}
                            <Input
                              value={colorEditValue}
                              onChange={(e) => setColorEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') void updateCategoryColor(cat.id, colorEditValue);
                              }}
                              placeholder="#6b8db5"
                              className="h-7 w-28 uppercase text-xs"
                              maxLength={7}
                              aria-label={`Custom color for ${cat.name}`}
                            />
                            <Button size="sm" onClick={() => void updateCategoryColor(cat.id, colorEditValue)}>Save</Button>
                          </div>
                        )}
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
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); setColorEditingId(null); }}
                        className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-muted"
                        title="Rename"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => {
                          if (colorEditingId === cat.id) {
                            setColorEditingId(null);
                            setColorEditValue(DEFAULT_COLOR);
                            return;
                          }
                          setColorEditingId(cat.id);
                          setColorEditValue(cat.color ?? DEFAULT_COLOR);
                          setEditingId(null);
                        }}
                        className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-muted"
                        title="Edit color"
                      >
                        ●
                      </button>
                      <button
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-muted"
                        title="Merge into…"
                      >
                        ⇆
                      </button>
                      <button
                        onClick={() => setCategoryPendingDelete(cat)}
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

      {categoryPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-border/45" onClick={() => { if (!deleting) setCategoryPendingDelete(null); }} />
          <div className="relative w-full max-w-md rounded-sketch border-[1.5px] border-border bg-card p-5 shadow-sketch">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-hand text-2xl">Delete category?</h2>
              <button
                onClick={() => setCategoryPendingDelete(null)}
                disabled={deleting}
                className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-muted disabled:opacity-50"
                title="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{categoryPendingDelete.name}</strong>?
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Transactions in this category will be moved to <strong>Other</strong>.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCategoryPendingDelete(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button onClick={() => void deleteCategory()} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
