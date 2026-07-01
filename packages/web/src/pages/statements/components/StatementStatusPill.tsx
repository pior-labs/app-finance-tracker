import { memo } from 'react';
import { Check } from 'lucide-react';

interface StatementStatusPillProps {
  status: 'imported' | 'failed';
  className?: string;
}

export const StatementStatusPill = memo(function StatementStatusPill({
  status,
  className = '',
}: StatementStatusPillProps) {
  if (status === 'failed') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${className}`}
        style={{
          background: 'var(--finlens-danger-surface)',
          color: 'var(--finlens-danger-ink)',
          border: '1px solid rgba(var(--frost-rgb),0.5)',
        }}
      >
        failed
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${className}`}
      style={{
        background: 'var(--finlens-success-surface)',
        color: 'var(--finlens-success-ink)',
        border: '1px solid rgba(var(--frost-rgb),0.5)',
      }}
    >
      <Check aria-hidden="true" className="h-3 w-3" />
      imported
    </span>
  );
});
