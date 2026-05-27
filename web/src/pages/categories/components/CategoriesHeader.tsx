import { memo } from 'react';
import { Plus } from 'lucide-react';

interface CategoriesHeaderProps {
  totalCategories: number;
  onShowNewForm: () => void;
}

export const CategoriesHeader = memo(function CategoriesHeader({
  totalCategories,
  onShowNewForm,
}: CategoriesHeaderProps) {
  return (
    <header className="flex flex-col gap-4 px-1 pt-1 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:pt-3">
      <div className="min-w-0">
        <div className="text-[12px] tracking-wide sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
          Manage ·{' '}
          <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
            {totalCategories} categories
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
        onClick={onShowNewForm}
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
  );
});
