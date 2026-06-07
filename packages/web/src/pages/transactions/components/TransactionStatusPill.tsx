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
          background: 'rgba(202,224,168,0.6)',
          color: '#3d6b1f',
          border: '1px solid rgba(255,255,255,0.5)',
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
        background: 'rgba(248,215,192,0.6)',
        color: 'var(--ink-2)',
        border: '1px solid rgba(255,255,255,0.5)',
      }}
    >
      <AlertCircle aria-hidden="true" className="h-3 w-3" strokeWidth={2.4} />
      {mobile ? 'Needs review' : 'Review'}
    </span>
  );
}
