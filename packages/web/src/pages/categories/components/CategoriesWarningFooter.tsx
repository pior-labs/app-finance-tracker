import { memo } from 'react';
import { TriangleAlert } from 'lucide-react';

export const CategoriesWarningFooter = memo(function CategoriesWarningFooter() {
  return (
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
        Deleting a category moves its transactions to <strong style={{ color: 'var(--ink-2)' }}>Other</strong>.
        Merging keeps history.
      </span>
    </div>
  );
});
