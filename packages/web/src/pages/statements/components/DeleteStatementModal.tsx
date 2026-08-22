import { memo, useEffect, useRef, useState } from 'react';
import { ArrowLeft, TriangleAlert, X } from 'lucide-react';
import { formatPeriod, getInstitutionLabel } from '../lib/format';
import type { StatementListItem } from '../types';

interface DeleteStatementModalProps {
  statement: StatementListItem;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteStatementModal = memo(function DeleteStatementModal({
  statement,
  deleting,
  onClose,
  onConfirm,
}: DeleteStatementModalProps) {
  const [step, setStep] = useState<'impact' | 'final'>('impact');
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    initialFocusRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (deleting) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleting, onClose]);

  const transactionLabel = `${statement.transactionCount} ${statement.transactionCount === 1 ? 'transaction' : 'transactions'}`;
  const institutionLabel = getInstitutionLabel(statement.institution);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-statement-title"
      aria-describedby="delete-statement-description"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(45,36,24,0.34)', backdropFilter: 'blur(7px)' }}
        onClick={() => {
          if (!deleting) onClose();
        }}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-md rounded-t-[28px] border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-[28px] sm:p-7 sm:pb-7"
        style={{
          background: 'rgba(var(--surface-rgb),0.97)',
          borderColor: 'rgba(var(--frost-rgb),0.8)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          boxShadow: '0 24px 60px -12px rgba(45,36,24,0.28), inset 0 0 0 1px rgba(var(--frost-rgb),0.5)',
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: 'var(--finlens-danger-ink)' }}>
              Step {step === 'impact' ? '1' : '2'} of 2
            </div>
            <h2
              id="delete-statement-title"
              className="m-0 text-[22px] font-normal sm:text-2xl"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
            >
              {step === 'impact' ? 'Delete this statement?' : 'Are you absolutely sure?'}
            </h2>
          </div>
          <button
            ref={initialFocusRef}
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close deletion confirmation"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-frost/40 transition-colors hover:bg-frost/80 disabled:opacity-50 sm:h-8 sm:w-8"
            style={{ color: 'var(--ink-3)', touchAction: 'manipulation' }}
          >
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>

        {step === 'impact' ? (
          <>
            <p id="delete-statement-description" className="text-sm leading-6" style={{ color: 'var(--ink-2)' }}>
              This will remove the <strong style={{ color: 'var(--ink)' }}>{institutionLabel}</strong> statement for{' '}
              <strong style={{ color: 'var(--ink)' }}>{formatPeriod(statement.periodStart, statement.periodEnd)}</strong>.
            </p>
            <div
              className="mt-4 rounded-[18px] border p-4"
              style={{ background: 'var(--finlens-danger-surface)', borderColor: 'rgba(var(--frost-rgb),0.7)' }}
            >
              <div className="flex items-start gap-3">
                <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--finlens-danger-ink)' }} />
                <p className="m-0 text-[13px] leading-5" style={{ color: 'var(--ink-2)' }}>
                  <strong style={{ color: 'var(--ink)' }}>{transactionLabel}</strong> imported from this file will also be deleted.
                </p>
              </div>
            </div>
          </>
        ) : (
          <p id="delete-statement-description" className="text-sm leading-6" style={{ color: 'var(--ink-2)' }}>
            This action cannot be undone. The statement and its {transactionLabel} will be permanently removed from FinLens.
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          {step === 'final' ? (
            <button
              ref={initialFocusRef}
              type="button"
              onClick={() => setStep('impact')}
              disabled={deleting}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border bg-transparent px-5 py-2.5 text-sm font-medium transition-colors hover:bg-frost/50 disabled:opacity-50"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)', touchAction: 'manipulation' }}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Go back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 cursor-pointer rounded-full border bg-transparent px-5 py-2.5 text-sm font-medium transition-colors hover:bg-frost/50"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)', touchAction: 'manipulation' }}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={step === 'impact' ? () => setStep('final') : onConfirm}
            disabled={deleting}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-0 px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 disabled:cursor-default disabled:opacity-50"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: step === 'final' ? 'var(--finlens-danger-ink)' : 'var(--ink)',
              color: 'white',
              boxShadow: step === 'final' ? 'var(--finlens-danger-shadow)' : '0 6px 18px -6px rgba(45,36,24,0.35)',
              touchAction: 'manipulation',
            }}
          >
            {deleting ? 'Deleting…' : step === 'impact' ? 'Continue' : 'Yes, permanently delete'}
          </button>
        </div>
      </div>
    </div>
  );
});
