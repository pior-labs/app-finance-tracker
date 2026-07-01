import { memo } from 'react';
import { CategoryColorPicker } from './CategoryColorPicker';

interface CreateCategoryFormProps {
  newName: string;
  newColor: string;
  creating: boolean;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}

export const CreateCategoryForm = memo(function CreateCategoryForm({
  newName,
  newColor,
  creating,
  onNameChange,
  onColorChange,
  onCancel,
  onCreate,
}: CreateCategoryFormProps) {
  return (
    <div
      className="rounded-[24px] border p-4 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, var(--finlens-warning-surface), rgba(var(--surface-rgb),0.55))',
        borderColor: 'rgba(var(--frost-rgb),0.8)',
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
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="e.g. Coffee shops"
          onKeyDown={(event) => {
            if (event.key === 'Enter') onCreate();
          }}
          autoFocus
          aria-label="Category name"
          className="h-11 w-full rounded-full border bg-frost/60 px-4 text-[15px] outline-none transition-colors placeholder:text-[var(--ink-3)] focus:bg-frost/90 focus:ring-2 focus:ring-[var(--accent)]/30 sm:h-10 sm:w-56 sm:text-sm"
          style={{ borderColor: 'rgba(var(--frost-rgb),0.8)', color: 'var(--ink)', fontFamily: "'Outfit', sans-serif" }}
        />
        <CategoryColorPicker
          selectedColor={newColor}
          hexValue={newColor}
          customColorLabel="Custom category color"
          swatchSizeClassName="h-9 w-9 sm:h-8 sm:w-8"
          onSelect={onColorChange}
          onHexChange={onColorChange}
        />
        <div className="hidden sm:block sm:flex-1" />
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 flex-1 cursor-pointer rounded-full border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-frost/50 sm:flex-none"
            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)', touchAction: 'manipulation' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreate}
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
            {creating ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
});
