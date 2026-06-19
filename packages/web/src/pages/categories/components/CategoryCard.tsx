import { memo } from 'react';
import { Palette, Pencil, Star, Trash2, X } from 'lucide-react';
import { CategoryColorPicker } from './CategoryColorPicker';
import { DEFAULT_COLOR, favoriteHotkey, lighten } from '../lib/color';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  favoriteIndex?: number;
  editingId: number | null;
  editName: string;
  colorEditingId: number | null;
  colorEditValue: string;
  onEditNameChange: (value: string) => void;
  onStartRename: (category: Category) => void;
  onCancelRename: () => void;
  onSaveRename: (category: Category) => void;
  onToggleFavorite: (category: Category) => void;
  onToggleColorEditor: (category: Category) => void;
  onColorEditValueChange: (color: string) => void;
  onSaveColor: (category: Category) => void;
  onRequestDelete: (category: Category) => void;
}

export const CategoryCard = memo(function CategoryCard({
  category,
  favoriteIndex,
  editingId,
  editName,
  colorEditingId,
  colorEditValue,
  onEditNameChange,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onToggleFavorite,
  onToggleColorEditor,
  onColorEditValueChange,
  onSaveColor,
  onRequestDelete,
}: CategoryCardProps) {
  const color = category.color || DEFAULT_COLOR;
  const hotkey = favoriteIndex !== undefined ? favoriteHotkey(favoriteIndex) : null;
  const isEditing = editingId === category.id;
  const isColorEditing = colorEditingId === category.id;

  return (
    <div
      className="group rounded-[22px] border p-4 transition-shadow hover:shadow-lg motion-reduce:transition-none"
      style={{
        background: `linear-gradient(135deg, ${lighten(color, 0.88)}, rgba(var(--surface-rgb),0.55))`,
        borderColor: 'rgba(var(--frost-rgb),0.8)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        boxShadow: '0 6px 22px -8px rgba(45,36,24,0.08)',
      }}
    >
      <div className="flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${color}, ${lighten(color, 0.3)})`,
            boxShadow: `0 4px 12px -2px ${color}55, inset 0 0 0 1px rgba(var(--frost-rgb),0.4)`,
          }}
        />

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={editName}
                onChange={(event) => onEditNameChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onSaveRename(category);
                  if (event.key === 'Escape') onCancelRename();
                }}
                autoFocus
                aria-label="Category name"
                className="h-11 w-full min-w-0 rounded-full border bg-frost/60 px-3.5 text-[15px] outline-none transition-colors focus:bg-frost/90 focus:ring-2 focus:ring-[var(--accent)]/30 sm:h-8 sm:flex-1 sm:text-sm"
                style={{ borderColor: 'rgba(var(--frost-rgb),0.8)', color: 'var(--ink)', fontFamily: "'Outfit', sans-serif" }}
              />
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSaveRename(category)}
                  className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full border-0 px-4 py-1.5 text-[13px] font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 sm:min-h-0 sm:flex-none sm:px-3 sm:text-xs"
                  style={{ background: 'var(--ink)', color: 'var(--cream)', fontFamily: "'Outfit', sans-serif", boxShadow: '0 4px 12px -4px rgba(45,36,24,0.3)', touchAction: 'manipulation' }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onCancelRename}
                  aria-label="Cancel rename"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-frost/40 text-sm transition-colors hover:bg-frost/80 sm:h-6 sm:w-6 sm:text-xs"
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
              {category.name}
            </span>
          )}
        </div>

        {hotkey && !isEditing ? (
          <span
            aria-hidden="true"
            className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-medium md:inline-flex"
            style={{
              fontFamily: "'Fraunces', serif",
              background: 'rgba(var(--frost-rgb),0.6)',
              color: 'var(--ink-2)',
              boxShadow: 'inset 0 0 0 1px rgba(45,36,24,0.08)',
            }}
            title={`Press ${hotkey} on the Categorize page`}
          >
            {hotkey}
          </span>
        ) : null}

        {!isEditing ? (
          <div className="hidden shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100 motion-reduce:transition-none md:flex">
            <button
              type="button"
              onClick={() => onToggleFavorite(category)}
              aria-label={category.isFavorite ? 'Unfavorite' : 'Favorite'}
              aria-pressed={!!category.isFavorite}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 text-sm transition-all hover:scale-110 motion-reduce:transform-none"
              style={{
                background: category.isFavorite ? 'rgba(248,215,192,0.7)' : 'rgba(var(--frost-rgb),0.4)',
                color: category.isFavorite ? 'var(--accent)' : 'var(--ink-3)',
              }}
              title={category.isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              <Star
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={2.2}
                fill={category.isFavorite ? 'currentColor' : 'none'}
              />
            </button>
            <button
              type="button"
              onClick={() => onStartRename(category)}
              aria-label="Rename"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-frost/40 text-xs transition-colors hover:bg-frost/80"
              style={{ color: 'var(--ink-2)' }}
              title="Rename"
            >
              <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={2.3} />
            </button>
            <button
              type="button"
              onClick={() => onToggleColorEditor(category)}
              aria-label="Edit color"
              aria-expanded={isColorEditing}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-frost/40 text-xs transition-colors hover:bg-frost/80"
              style={{ color: 'var(--ink-2)' }}
              title="Edit color"
            >
              <Palette aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(category)}
              aria-label="Delete"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-frost/40 text-xs transition-colors hover:bg-[rgba(248,215,192,0.7)]"
              style={{ color: 'var(--accent)' }}
              title="Delete"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
        ) : null}
      </div>

      {!isEditing ? (
        <div
          className="-mx-1 mt-3 flex items-center justify-around gap-1 border-t border-dashed pt-2 md:hidden"
          style={{ borderColor: 'rgba(45,36,24,0.1)' }}
        >
          <button
            type="button"
            onClick={() => onToggleFavorite(category)}
            aria-label={category.isFavorite ? 'Unfavorite' : 'Favorite'}
            aria-pressed={!!category.isFavorite}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 text-[13px] font-medium transition-colors"
            style={{
              background: category.isFavorite ? 'rgba(248,215,192,0.7)' : 'transparent',
              color: category.isFavorite ? 'var(--accent)' : 'var(--ink-3)',
              fontFamily: "'Outfit', sans-serif",
              touchAction: 'manipulation',
            }}
          >
            <Star
              aria-hidden="true"
              className="h-3.5 w-3.5"
              strokeWidth={2.2}
              fill={category.isFavorite ? 'currentColor' : 'none'}
            />
            <span>{category.isFavorite ? 'Saved' : 'Favorite'}</span>
          </button>
          <button
            type="button"
            onClick={() => onStartRename(category)}
            aria-label="Rename"
            className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-frost/60"
            style={{ color: 'var(--ink-2)', touchAction: 'manipulation' }}
          >
            <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={2.3} />
          </button>
          <button
            type="button"
            onClick={() => onToggleColorEditor(category)}
            aria-label="Edit color"
            aria-expanded={isColorEditing}
            className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-frost/60"
            style={{ color: 'var(--ink-2)', touchAction: 'manipulation' }}
          >
            <Palette aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => onRequestDelete(category)}
            aria-label="Delete"
            className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-[rgba(248,215,192,0.7)]"
            style={{ color: 'var(--accent)', touchAction: 'manipulation' }}
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      ) : null}

      {isColorEditing ? (
        <div className="mt-3 border-t border-dashed pt-3" style={{ borderColor: 'rgba(45,36,24,0.1)' }}>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <CategoryColorPicker
              selectedColor={colorEditValue}
              hexValue={colorEditValue}
              customColorLabel="Custom color"
              onSelect={onColorEditValueChange}
              onHexChange={onColorEditValueChange}
              onSave={() => onSaveColor(category)}
            />
            <button
              type="button"
              onClick={() => onSaveColor(category)}
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
        </div>
      ) : null}
    </div>
  );
});
