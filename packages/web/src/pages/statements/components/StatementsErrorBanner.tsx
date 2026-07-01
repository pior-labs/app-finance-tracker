import { memo } from 'react';
import { RefreshCw } from 'lucide-react';

interface StatementsErrorBannerProps {
  error: string;
  loading: boolean;
  onRetry: () => void;
}

export const StatementsErrorBanner = memo(function StatementsErrorBanner({
  error,
  loading,
  onRetry,
}: StatementsErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
      style={{
        background: 'var(--finlens-danger-surface)',
        borderColor: 'var(--finlens-danger-border)',
        color: 'var(--finlens-danger-ink-strong)',
      }}
    >
      <p className="m-0 text-sm">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={loading}
        className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border-0 px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{ fontFamily: "'Outfit', sans-serif", background: 'rgba(var(--frost-rgb),0.65)', color: 'var(--ink)' }}
      >
        <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  );
});
