import { memo } from 'react';
import { Star } from 'lucide-react';
import { CategoryCard } from './CategoryCard';
import type { Category } from '../types';

interface CategoriesSectionProps {
  title: string;
  categories: Category[];
  showFavoriteIcon?: boolean;
  showDivider?: boolean;
  passFavoriteIndexes?: boolean;
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

export const CategoriesSection = memo(function CategoriesSection({
  title,
  categories,
  showFavoriteIcon = false,
  showDivider = false,
  passFavoriteIndexes = false,
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
}: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section>
      {showDivider ? <div className="mb-4 border-t border-dashed" style={{ borderColor: 'rgba(45,36,24,0.1)' }} /> : null}
      <div className="mb-4 flex items-center gap-2.5 px-1">
        {showFavoriteIcon ? (
          <Star
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={2.2}
            style={{ color: 'var(--accent)', fill: 'currentColor' }}
          />
        ) : null}
        <h2
          className="m-0 text-xl font-normal"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
        >
          {title}
        </h2>
        <span
          className="rounded-full bg-[rgba(45,36,24,0.06)] px-2.5 py-0.5 text-xs"
          style={{ color: 'var(--ink-3)' }}
        >
          {categories.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            favoriteIndex={passFavoriteIndexes ? index : undefined}
            editingId={editingId}
            editName={editName}
            colorEditingId={colorEditingId}
            colorEditValue={colorEditValue}
            onEditNameChange={onEditNameChange}
            onStartRename={onStartRename}
            onCancelRename={onCancelRename}
            onSaveRename={onSaveRename}
            onToggleFavorite={onToggleFavorite}
            onToggleColorEditor={onToggleColorEditor}
            onColorEditValueChange={onColorEditValueChange}
            onSaveColor={onSaveColor}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </div>
    </section>
  );
});
