export function DashboardErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border px-6 py-5 text-[15px]"
      style={{
        background: 'var(--finlens-danger-surface)',
        borderColor: 'var(--finlens-danger-border)',
        color: 'var(--finlens-danger-ink-strong)',
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="font-serif text-base font-medium">Couldn't load your dashboard</div>
        <div className="mt-0.5 text-[13px]" style={{ color: 'var(--finlens-danger-ink)' }}>{error}</div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[var(--finlens-danger-ink-strong)] px-4 py-2 text-[13px] font-medium text-cream shadow-[var(--finlens-danger-shadow)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--finlens-danger-ink)]/40 motion-reduce:hover:translate-y-0"
      >
        Try again
      </button>
    </div>
  );
}
