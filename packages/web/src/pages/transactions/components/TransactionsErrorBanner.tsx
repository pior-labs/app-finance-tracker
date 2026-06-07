import { memo } from 'react';
import { RotateCcw } from 'lucide-react';

interface TransactionsErrorBannerProps {
  error: string;
  onRetry: () => void;
}

export const TransactionsErrorBanner = memo(function TransactionsErrorBanner({
  error,
  onRetry,
}: TransactionsErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-3 text-sm"
      style={{
        background: 'rgba(245,180,160,0.4)',
        borderColor: 'rgba(197,112,74,0.4)',
        color: '#6b3a1f',
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="font-serif text-base font-medium">Couldn't load transactions</div>
        <div className="mt-0.5 text-[13px] text-[#7a4b2f]/85">{error}</div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[#6b3a1f] px-4 py-2 text-[13px] font-medium text-cream shadow-[0_6px_18px_-6px_rgba(107,58,31,0.45)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b3a1f]/40 motion-reduce:hover:translate-y-0"
      >
        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
        Try again
      </button>
    </div>
  );
});
