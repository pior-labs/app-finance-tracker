import { memo } from 'react';

const LOADING_ROWS = Array.from({ length: 6 }, (_, index) => index);

export const CategoriesLoadingState = memo(function CategoriesLoadingState() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <span className="sr-only">Loading categories...</span>
      {LOADING_ROWS.map((index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-16 animate-pulse rounded-[22px] border"
          style={{
            background: 'rgba(var(--surface-rgb),0.5)',
            borderColor: 'rgba(var(--frost-rgb),0.6)',
            animationDelay: `${index * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
});
