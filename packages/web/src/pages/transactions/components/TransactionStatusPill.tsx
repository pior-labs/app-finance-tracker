import { AlertCircle, Check } from 'lucide-react';
import type { TransactionStatus } from '../types';

export function TransactionStatusPill({
  status,
  mobile = false,
}: {
  status: TransactionStatus;
  mobile?: boolean;
}) {
  const className = mobile
    ? 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold'
    : 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold';

  if (status === 'confirmed') {
    return (
      <span
        className={className}
        style={{
          background: 'var(--finlens-success-surface)',
          color: 'var(--finlens-success-ink)',
          border: '1px solid rgba(var(--frost-rgb),0.5)',
        }}
      >
        <Check aria-hidden="true" className="h-3 w-3" strokeWidth={2.6} />
        Confirmed
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        background: 'var(--finlens-danger-surface)',
        color: 'var(--finlens-danger-ink)',
        border: '1px solid rgba(var(--frost-rgb),0.5)',
      }}
    >
      <AlertCircle aria-hidden="true" className="h-3 w-3" strokeWidth={2.4} />
      {mobile ? 'Needs review' : 'Review'}
    </span>
  );
}
