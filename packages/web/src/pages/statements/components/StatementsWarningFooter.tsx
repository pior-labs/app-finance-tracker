import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';

export const StatementsWarningFooter = memo(function StatementsWarningFooter() {
  return (
    <div
      className="flex items-start gap-2.5 rounded-[20px] border px-4 py-3 text-[12px] leading-snug sm:items-center sm:px-5 sm:py-3.5 sm:text-[13px]"
      style={{
        background: 'rgba(var(--surface-rgb),0.45)',
        borderColor: 'rgba(var(--frost-rgb),0.7)',
        backdropFilter: 'blur(16px) saturate(130%)',
        WebkitBackdropFilter: 'blur(16px) saturate(130%)',
        color: 'var(--ink-3)',
      }}
    >
      <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>
        Deleting a statement removes its transactions too.{' '}
        <strong style={{ color: 'var(--ink-2)' }}>Re-parse</strong> tries again with the latest parser - non-destructive.
      </span>
    </div>
  );
});
