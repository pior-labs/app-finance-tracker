import { useEffect, useState } from 'react';
import { Palette, Pencil, Plus, RotateCcw, Star, Trash2, TriangleAlert, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
  isFavorite?: boolean;
  favoritedAt?: string | null;
}

const FAVORITE_HOTKEY_LIMIT = 10;

function favoriteHotkey(index: number): string | null {
  if (index < 0 || index >= FAVORITE_HOTKEY_LIMIT) return null;
  return index === 9 ? '0' : String(index + 1);
}

const PRESET_COLORS = ['#c96442', '#5b8a5a', '#6b8db5', '#a87cc4', '#d4a55a', '#e2738a', '#7ec1c1'];
const DEFAULT_COLOR = PRESET_COLORS[2];
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

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

  useEffect(() => {
    if (!categoryPendingDelete || deleting) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCategoryPendingDelete(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [categoryPendingDelete, deleting]);

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
    const next = !category.isFavorite;
    const nextFavoritedAt = next ? new Date().toISOString() : null;
    setError(null);
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, isFavorite: next, favoritedAt: nextFavoritedAt } : c
      )
    );
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: next }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to update favorite (${res.status})`);
      }
    } catch (err) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id
            ? { ...c, isFavorite: category.isFavorite, favoritedAt: category.favoritedAt ?? null }
            : c
        )
      );
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

  const favorites = categories
    .filter((c) => c.isFavorite)
    .sort((a, b) => {
      const aAt = a.favoritedAt ? new Date(a.favoritedAt).getTime() : 0;
      const bAt = b.favoritedAt ? new Date(b.favoritedAt).getTime() : 0;
      return aAt - bAt;
    });
  const rest = categories.filter((c) => !c.isFavorite);

  const renderColorSwatches = (
    selectedColor: string,
    onSelect: (color: string) => void,
    hexValue: string,
    onHexChange: (val: string) => void,
    onSave: () => void,
  ) => (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      {PRESET_COLORS.map((swatch) => (
        <button
          key={swatch}
          type="button"
          onClick={() => onSelect(swatch)}
          aria-label={`Use color ${swatch}`}
          aria-pressed={swatch.toLowerCase() === selectedColor.toLowerCase()}
          className="h-9 w-9 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 motion-reduce:transform-none sm:h-7 sm:w-7"
          style={{
            background: swatch,
            borderColor: swatch.toLowerCase() === selectedColor.toLowerCase()
              ? 'var(--ink)'
              : 'rgba(255,255,255,0.6)',
            boxShadow: swatch.toLowerCase() === selectedColor.toLowerCase()
              ? `0 0 0 3px ${lighten(swatch, 0.6)}`
              : '0 2px 6px -2px rgba(45,36,24,0.15)',
            touchAction: 'manipulation',
          }}
        />
      ))}
      <input
        value={hexValue}
        onChange={(e) => onHexChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }}
        placeholder="#6b8db5"
        maxLength={7}
        aria-label="Custom color"
        className="h-9 w-24 rounded-full border bg-white/50 px-2.5 text-center text-xs uppercase outline-none transition-colors focus:bg-white/80 focus:ring-2 focus:ring-[var(--accent)]/30 sm:h-7"
        style={{ borderColor: 'rgba(255,255,255,0.8)', color: 'var(--ink)', fontFamily: "'Outfit', sans-serif" }}
      />
      <button
        type="button"
        onClick={onSave}
        className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-0 px-4 py-1.5 text-[13px] font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 sm:min-h-0 sm:px-3.5 sm:text-xs"
        style={{
          fontFamily: "'Outfit', sans-serif",
          background: 'var(--ink)',
          color: 'var(--cream)',
          boxShadow: '0 4px 12px -4px rgba(45,36,24,0.3)',
          touchAction: 'manipulation',
        }}
      >
        Save
      </button>
    </div>
  );

  const renderCard = (cat: Category, favoriteIndex: number | null = null) => {
    const color = cat.color || DEFAULT_COLOR;
    const hotkey = favoriteIndex !== null ? favoriteHotkey(favoriteIndex) : null;
    const isEditing = editingId === cat.id;
    const isColorEditing = colorEditingId === cat.id;

    return (
      <div
        key={cat.id}
        className="group rounded-[22px] border p-4 transition-shadow hover:shadow-lg motion-reduce:transition-none"
        style={{
          background: `linear-gradient(135deg, ${lighten(color, 0.88)}, rgba(255,253,247,0.55))`,
          borderColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          boxShadow: '0 6px 22px -8px rgba(45,36,24,0.08)',
        }}
      >
        <div className="flex items-center gap-3.5">
          {/* Color swatch */}
          <span
            aria-hidden="true"
            className="h-9 w-9 shrink-0 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${color}, ${lighten(color, 0.3)})`,
              boxShadow: `0 4px 12px -2px ${color}55, inset 0 0 0 1px rgba(255,255,255,0.4)`,
            }}
          />

          {/* Name / Edit */}
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void renameCategory(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                  aria-label="Category name"
                  className="h-11 w-full min-w-0 rounded-full border bg-white/60 px-3.5 text-[15px] outline-none transition-colors focus:bg-white/90 focus:ring-2 focus:ring-[var(--accent)]/30 sm:h-8 sm:flex-1 sm:text-sm"
                  style={{ borderColor: 'rgba(255,255,255,0.8)', color: 'var(--ink)', fontFamily: "'Outfit', sans-serif" }}
                />
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void renameCategory(cat.id)}
                    className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full border-0 px-4 py-1.5 text-[13px] font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 sm:min-h-0 sm:flex-none sm:px-3 sm:text-xs"
                    style={{ background: 'var(--ink)', color: 'var(--cream)', fontFamily: "'Outfit', sans-serif", boxShadow: '0 4px 12px -4px rgba(45,36,24,0.3)', touchAction: 'manipulation' }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel rename"
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-sm transition-colors hover:bg-white/80 sm:h-6 sm:w-6 sm:text-xs"
                    style={{ color: 'var(--ink-3)', touchAction: 'manipulation' }}
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            ) : (
              <span
                className="block truncate text-base font-medium sm:text-lg"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
              >
                {cat.name}
              </span>
            )}
          </div>

          {/* Hotkey badge (desktop only — keyboard-only affordance) */}
          {hotkey && !isEditing && (
            <span
              aria-hidden="true"
              className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-medium md:inline-flex"
              style={{
                fontFamily: "'Fraunces', serif",
                background: 'rgba(255,255,255,0.6)',
                color: 'var(--ink-2)',
                boxShadow: 'inset 0 0 0 1px rgba(45,36,24,0.08)',
              }}
              title={`Press ${hotkey} on the Categorize page`}
            >
              {hotkey}
            </span>
          )}

          {/* Desktop actions — inline, hover-fade */}
          {!isEditing && (
            <div className="hidden shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100 motion-reduce:transition-none md:flex">
              <button
                type="button"
                onClick={() => void toggleFavorite(cat)}
                aria-label={cat.isFavorite ? 'Unfavorite' : 'Favorite'}
                aria-pressed={!!cat.isFavorite}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 text-sm transition-all hover:scale-110 motion-reduce:transform-none"
                style={{
                  background: cat.isFavorite ? 'rgba(248,215,192,0.7)' : 'rgba(255,255,255,0.4)',
                  color: cat.isFavorite ? 'var(--accent)' : 'var(--ink-3)',
                }}
                title={cat.isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                <Star
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={2.2}
                  fill={cat.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
              <button
                type="button"
                onClick={() => { setEditingId(cat.id); setEditName(cat.name); setColorEditingId(null); }}
                aria-label="Rename"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-xs transition-colors hover:bg-white/80"
                style={{ color: 'var(--ink-2)' }}
                title="Rename"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={2.3} />
              </button>
              <button
                type="button"
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
                aria-label="Edit color"
                aria-expanded={isColorEditing}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-xs transition-colors hover:bg-white/80"
                style={{ color: 'var(--ink-2)' }}
                title="Edit color"
              >
                <Palette aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={() => setCategoryPendingDelete(cat)}
                aria-label="Delete"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-xs transition-colors hover:bg-[rgba(248,215,192,0.7)]"
                style={{ color: 'var(--accent)' }}
                title="Delete"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile actions — full-width bar with 44px touch targets */}
        {!isEditing && (
          <div
            className="-mx-1 mt-3 flex items-center justify-around gap-1 border-t border-dashed pt-2 md:hidden"
            style={{ borderColor: 'rgba(45,36,24,0.1)' }}
          >
            <button
              type="button"
              onClick={() => void toggleFavorite(cat)}
              aria-label={cat.isFavorite ? 'Unfavorite' : 'Favorite'}
              aria-pressed={!!cat.isFavorite}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 text-[13px] font-medium transition-colors"
              style={{
                background: cat.isFavorite ? 'rgba(248,215,192,0.7)' : 'transparent',
                color: cat.isFavorite ? 'var(--accent)' : 'var(--ink-3)',
                fontFamily: "'Outfit', sans-serif",
                touchAction: 'manipulation',
              }}
            >
              <Star
                aria-hidden="true"
                className="h-3.5 w-3.5"
                strokeWidth={2.2}
                fill={cat.isFavorite ? 'currentColor' : 'none'}
              />
              <span>{cat.isFavorite ? 'Saved' : 'Favorite'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setEditingId(cat.id); setEditName(cat.name); setColorEditingId(null); }}
              aria-label="Rename"
              className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-white/60"
              style={{ color: 'var(--ink-2)', touchAction: 'manipulation' }}
            >
              <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={2.3} />
            </button>
            <button
              type="button"
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
              aria-label="Edit color"
              aria-expanded={isColorEditing}
              className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-white/60"
              style={{ color: 'var(--ink-2)', touchAction: 'manipulation' }}
            >
              <Palette aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={() => setCategoryPendingDelete(cat)}
              aria-label="Delete"
              className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-[rgba(248,215,192,0.7)]"
              style={{ color: 'var(--accent)', touchAction: 'manipulation' }}
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
        )}

        {/* Color editing row */}
        {isColorEditing && (
          <div className="mt-3 border-t border-dashed pt-3" style={{ borderColor: 'rgba(45,36,24,0.1)' }}>
            {renderColorSwatches(
              colorEditValue,
              (c) => setColorEditValue(c),
              colorEditValue,
              (v) => setColorEditValue(v),
              () => void updateCategoryColor(cat.id, colorEditValue),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6" aria-busy={loading}>
      {/* ─── Header ─── */}
      <header className="flex flex-col gap-4 px-1 pt-1 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:pt-3">
        <div className="min-w-0">
          <div className="text-[12px] tracking-wide sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
            Manage ·{' '}
            <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
              {categories.length} categories
            </em>
          </div>
          <h1
            className="m-0 my-1.5 text-[34px] font-normal leading-[1.05] tracking-tight sm:text-[42px] sm:leading-none md:text-[52px]"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            Categories
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-5 py-3 text-[15px] font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 sm:w-auto"
          style={{
            fontFamily: "'Outfit', sans-serif",
            background: 'var(--ink)',
            color: 'var(--cream)',
            boxShadow: '0 8px 22px -6px rgba(45,36,24,0.4)',
            touchAction: 'manipulation',
          }}
        >
          <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
          New category
        </button>
      </header>

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
            <div className="font-serif text-base font-medium">Couldn't load categories</div>
            <div className="mt-0.5 text-[13px] text-[#7a4b2f]/85">{error}</div>
          </div>
          <button
            type="button"
            onClick={() => void fetchCategories()}
            disabled={loading}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[#6b3a1f] px-4 py-2 text-[13px] font-medium text-cream shadow-[0_6px_18px_-6px_rgba(107,58,31,0.45)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b3a1f]/40 motion-reduce:hover:translate-y-0 disabled:cursor-default disabled:opacity-50"
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
            Try again
          </button>
        </div>
      )}

      {/* ─── New category form ─── */}
      {showNewForm && (
        <div
          className="rounded-[24px] border p-4 sm:p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(245,227,160,0.3), rgba(255,253,247,0.55))',
            borderColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            boxShadow: '0 10px 32px -8px rgba(45,36,24,0.1)',
          }}
        >
          <div
            className="mb-3 text-sm italic sm:mb-4"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
          >
            New category
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Coffee shops"
              onKeyDown={(e) => { if (e.key === 'Enter') void createCategory(); }}
              autoFocus
              aria-label="Category name"
              className="h-11 w-full rounded-full border bg-white/60 px-4 text-[15px] outline-none transition-colors placeholder:text-[var(--ink-3)] focus:bg-white/90 focus:ring-2 focus:ring-[var(--accent)]/30 sm:h-10 sm:w-56 sm:text-sm"
              style={{ borderColor: 'rgba(255,255,255,0.8)', color: 'var(--ink)', fontFamily: "'Outfit', sans-serif" }}
            />
            {/* Swatches + hex */}
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setNewColor(swatch)}
                  aria-label={`Use color ${swatch}`}
                  aria-pressed={newColor === swatch}
                  className="h-9 w-9 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 motion-reduce:transform-none sm:h-8 sm:w-8"
                  style={{
                    background: swatch,
                    borderColor: newColor === swatch ? 'var(--ink)' : 'rgba(255,255,255,0.6)',
                    boxShadow: newColor === swatch
                      ? `0 0 0 3px ${lighten(swatch, 0.6)}`
                      : '0 2px 6px -2px rgba(45,36,24,0.15)',
                    touchAction: 'manipulation',
                  }}
                />
              ))}
              <input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="#6b8db5"
                maxLength={7}
                aria-label="Custom category color"
                className="h-9 w-24 rounded-full border bg-white/50 px-2.5 text-center text-xs uppercase outline-none transition-colors focus:bg-white/80 focus:ring-2 focus:ring-[var(--accent)]/30 sm:h-8"
                style={{ borderColor: 'rgba(255,255,255,0.8)', color: 'var(--ink)', fontFamily: "'Outfit', sans-serif" }}
              />
            </div>
            <div className="hidden sm:block sm:flex-1" />
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => { setShowNewForm(false); setNewName(''); setNewColor(DEFAULT_COLOR); }}
                className="min-h-11 flex-1 cursor-pointer rounded-full border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white/50 sm:flex-none"
                style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)', touchAction: 'manipulation' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void createCategory()}
                disabled={creating || !newName.trim()}
                className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 px-5 py-2 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 disabled:cursor-default disabled:opacity-50 sm:flex-none"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
                  touchAction: 'manipulation',
                }}
              >
                {creating ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Loading ─── */}
      {loading ? (
        <div role="status" aria-live="polite" aria-busy="true" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <span className="sr-only">Loading categories…</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-16 animate-pulse rounded-[22px] border"
              style={{
                background: 'rgba(255,253,247,0.5)',
                borderColor: 'rgba(255,255,255,0.6)',
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {categories.length === 0 && (
            <section
              className="rounded-[24px] border px-5 py-12 text-center"
              style={{
                background: 'rgba(255,253,247,0.55)',
                borderColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px) saturate(140%)',
                WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              }}
            >
              <h2
                className="m-0 text-[28px] font-normal tracking-tight sm:text-[32px]"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
              >
                No categories yet
              </h2>
              <p className="mx-auto mt-2.5 mb-0 max-w-[440px] text-[14px] sm:text-[15px]" style={{ color: 'var(--ink-2)' }}>
                Create your first category to organize transactions faster in the categorize flow.
              </p>
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-5 py-3 text-[14px] font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 sm:text-[15px]"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  boxShadow: '0 8px 22px -6px rgba(45,36,24,0.4)',
                  touchAction: 'manipulation',
                }}
              >
                <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
                New category
              </button>
            </section>
          )}

          {/* ─── Favorites ─── */}
          {favorites.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2.5 px-1">
                <Star
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={2.2}
                  style={{ color: 'var(--accent)', fill: 'currentColor' }}
                />
                <h2
                  className="m-0 text-xl font-normal"
                  style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                >
                  Favorites
                </h2>
                <span
                  className="rounded-full bg-[rgba(45,36,24,0.06)] px-2.5 py-0.5 text-xs"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {favorites.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {favorites.map((cat, i) => renderCard(cat, i))}
              </div>
            </section>
          )}

          {/* ─── All categories ─── */}
          {rest.length > 0 && (
            <section>
              {favorites.length > 0 && (
                <div className="mb-4 border-t border-dashed" style={{ borderColor: 'rgba(45,36,24,0.1)' }} />
              )}
              <div className="mb-4 flex items-center gap-2.5 px-1">
                <h2
                  className="m-0 text-xl font-normal"
                  style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                >
                  All categories
                </h2>
                <span
                  className="rounded-full bg-[rgba(45,36,24,0.06)] px-2.5 py-0.5 text-xs"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {rest.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {rest.map((cat) => renderCard(cat))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ─── Warning footer ─── */}
      <div
        className="flex items-start gap-2.5 rounded-[20px] border px-4 py-3 text-[12px] leading-snug sm:items-center sm:px-5 sm:py-3.5 sm:text-[13px]"
        style={{
          background: 'rgba(255,253,247,0.45)',
          borderColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(16px) saturate(130%)',
          WebkitBackdropFilter: 'blur(16px) saturate(130%)',
          color: 'var(--ink-3)',
        }}
      >
        <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" strokeWidth={2.3} />
        <span>
          Deleting a category moves its transactions to <strong style={{ color: 'var(--ink-2)' }}>Other</strong>. Merging keeps history.
        </span>
      </div>

      {/* ─── Delete confirmation modal ─── */}
      {categoryPendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-category-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(45,36,24,0.3)', backdropFilter: 'blur(6px)' }}
            onClick={() => { if (!deleting) setCategoryPendingDelete(null); }}
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-md rounded-t-[28px] border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-[28px] sm:p-7 sm:pb-7"
            style={{
              background: 'rgba(255,253,247,0.94)',
              borderColor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              boxShadow: '0 24px 60px -12px rgba(45,36,24,0.25), inset 0 0 0 1px rgba(255,255,255,0.5)',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
              <h2
                id="delete-category-title"
                className="m-0 text-[22px] font-normal sm:text-2xl"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
              >
                Delete category?
              </h2>
              <button
                type="button"
                onClick={() => setCategoryPendingDelete(null)}
                disabled={deleting}
                aria-label="Close"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-sm transition-colors hover:bg-white/80 disabled:opacity-50 sm:h-7 sm:w-7 sm:text-xs"
                style={{ color: 'var(--ink-3)', touchAction: 'manipulation' }}
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            </div>
            <p className="text-sm" style={{ color: 'var(--ink-2)' }}>
              Are you sure you want to delete{' '}
              <strong style={{ color: 'var(--ink)' }}>{categoryPendingDelete.name}</strong>?
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--ink-3)' }}>
              Transactions in this category will be moved to <strong>Other</strong>.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCategoryPendingDelete(null)}
                disabled={deleting}
                className="min-h-11 cursor-pointer rounded-full border bg-transparent px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/50 disabled:opacity-50"
                style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)', touchAction: 'manipulation' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void deleteCategory()}
                disabled={deleting}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-0 px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 disabled:cursor-default disabled:opacity-50"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: 'var(--accent)',
                  color: 'white',
                  boxShadow: '0 6px 18px -6px rgba(197,112,74,0.4)',
                  touchAction: 'manipulation',
                }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
