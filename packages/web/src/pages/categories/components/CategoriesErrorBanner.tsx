import { memo } from 'react';
import { RotateCcw } from 'lucide-react';

interface CategoriesErrorBannerProps {
  error: string;
  loading: boolean;
  onRetry: () => void;
}

export const CategoriesErrorBanner = memo(function CategoriesErrorBanner({
  error,
  loading,
  onRetry,
}: CategoriesErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-3 text-sm"
      style={{
        background: 'var(--finlens-danger-surface)',
        borderColor: 'var(--finlens-danger-border)',
        color: 'var(--finlens-danger-ink-strong)',
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="font-serif text-base font-medium">Couldn't load categories</div>
        <div className="mt-0.5 text-[13px]" style={{ color: 'var(--finlens-danger-ink)' }}>{error}</div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={loading}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[var(--finlens-danger-ink-strong)] px-4 py-2 text-[13px] font-medium text-cream shadow-[var(--finlens-danger-shadow)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--finlens-danger-ink)]/40 motion-reduce:hover:translate-y-0 disabled:cursor-default disabled:opacity-50"
      >
        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
        Try again
      </button>
    </div>
  );
});
