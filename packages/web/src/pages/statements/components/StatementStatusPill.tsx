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
          background: 'rgba(248,215,192,0.7)',
          color: 'var(--accent)',
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
        background: 'rgba(202,224,168,0.6)',
        color: '#3d6b1f',
        border: '1px solid rgba(var(--frost-rgb),0.5)',
      }}
    >
      <Check aria-hidden="true" className="h-3 w-3" />
      imported
    </span>
  );
});
