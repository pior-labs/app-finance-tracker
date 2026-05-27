import { memo } from 'react';
import { ArrowRight, Upload } from 'lucide-react';
import { StatementPetalMark } from './StatementPetalMark';

interface StatementsEmptyStateProps {
  variant: 'desktop' | 'mobile';
  onUpload: () => void;
}

export const StatementsEmptyState = memo(function StatementsEmptyState({
  variant,
  onUpload,
}: StatementsEmptyStateProps) {
  const isDesktop = variant === 'desktop';

  const content = (
    <div className="flex flex-col items-center gap-4 text-center">
      <StatementPetalMark size={variant} />
      <h3
        className={isDesktop ? 'm-0 text-2xl font-normal' : 'm-0 text-xl font-normal'}
        style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
      >
        No statements yet
      </h3>
      <p className={isDesktop ? 'm-0 max-w-xs text-sm' : 'm-0 max-w-xs text-[13px]'} style={{ color: 'var(--ink-3)' }}>
        Upload your first bank statement and we'll import your transactions automatically.
      </p>
      <button
        type="button"
        onClick={onUpload}
        className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0"
        style={{
          fontFamily: "'Outfit', sans-serif",
          background: 'var(--ink)',
          color: 'var(--cream)',
          boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
          touchAction: 'manipulation',
        }}
      >
        <Upload aria-hidden="true" className="h-4 w-4" />
        Upload statement
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );

  if (isDesktop) return content;

  return (
    <div
      className="rounded-[24px] border p-8 text-center"
      style={{
        background: 'rgba(255,253,247,0.55)',
        borderColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        boxShadow: '0 14px 44px -10px rgba(45,36,24,0.1), inset 0 0 0 1px rgba(255,255,255,0.45)',
      }}
    >
      <div className="mx-auto flex flex-col items-center gap-4">{content}</div>
    </div>
  );
});
