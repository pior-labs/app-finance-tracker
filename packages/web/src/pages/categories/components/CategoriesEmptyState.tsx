import { memo } from 'react';
import { Plus } from 'lucide-react';

interface CategoriesEmptyStateProps {
  onShowNewForm: () => void;
}

export const CategoriesEmptyState = memo(function CategoriesEmptyState({
  onShowNewForm,
}: CategoriesEmptyStateProps) {
  return (
    <section
      className="rounded-[24px] border px-5 py-12 text-center"
      style={{
        background: 'rgba(var(--surface-rgb),0.55)',
        borderColor: 'rgba(var(--frost-rgb),0.8)',
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
        onClick={onShowNewForm}
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
  );
});
