import { ArrowRight, LoaderCircle } from 'lucide-react';

type SsoSignInButtonProps = {
  loading: boolean;
  errorId: string;
  hasError: boolean;
  onClick: () => void;
};

export function SsoSignInButton({ loading, errorId, hasError, onClick }: SsoSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-describedby={hasError ? errorId : undefined}
      className="group relative inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full border border-ink/15 bg-ink px-6 py-3 font-sans text-[15px] font-medium text-cream shadow-[var(--finlens-action-shadow)] transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-px hover:bg-[var(--finlens-action-hover-bg)] hover:shadow-[var(--finlens-action-shadow-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-progress disabled:opacity-80 motion-reduce:hover:translate-y-0"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, var(--finlens-accent-surface), transparent 60%)',
        }}
      />
      <span className="relative">{loading ? 'Redirecting…' : 'Continue with Pior Labs'}</span>
      {loading ? (
        <LoaderCircle aria-hidden="true" className="relative h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight
          aria-hidden="true"
          className="relative h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        />
      )}
    </button>
  );
}
