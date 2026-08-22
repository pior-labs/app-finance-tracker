import { memo } from 'react';
import type { FinancialInstitution } from '@finlens/shared/types';

const INSTITUTION_LABELS: Record<FinancialInstitution, string> = {
  rbc: 'RBC',
  cibc: 'CIBC',
};

interface InstitutionBadgeProps {
  institution: FinancialInstitution | null;
}

export const InstitutionBadge = memo(function InstitutionBadge({ institution }: InstitutionBadgeProps) {
  return (
    <span
      className="inline-flex rounded-full border px-3 py-1 text-xs font-medium"
      style={{
        borderColor: 'rgba(var(--frost-rgb),0.65)',
        background: 'rgba(var(--frost-rgb),0.5)',
        color: institution ? 'var(--ink-2)' : 'var(--ink-3)',
      }}
      title={institution ? `Imported from ${INSTITUTION_LABELS[institution]}` : 'Bank could not be identified'}
    >
      {institution ? INSTITUTION_LABELS[institution] : 'Unknown bank'}
    </span>
  );
});
