import { memo } from 'react';
import type { StatementAccountType } from '@finlens/shared/types';

interface AccountTypeBadgeProps {
  accountType: StatementAccountType;
}

export const AccountTypeBadge = memo(function AccountTypeBadge({ accountType }: AccountTypeBadgeProps) {
  const isCreditCard = accountType === 'credit_card';

  return (
    <span
      className="inline-flex rounded-full border px-3 py-1 text-xs font-medium"
      style={{
        borderColor: 'rgba(var(--frost-rgb),0.6)',
        background: isCreditCard ? 'var(--finlens-success-surface-strong)' : 'var(--finlens-danger-surface)',
        color: isCreditCard ? 'var(--finlens-success-ink)' : 'var(--finlens-danger-ink)',
      }}
      title={isCreditCard ? 'Imported from a credit-card statement' : 'Imported from a debit-card statement'}
    >
      {isCreditCard ? 'Credit' : 'Debit'}
    </span>
  );
});
