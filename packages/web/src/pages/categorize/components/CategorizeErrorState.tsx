export function CategorizeErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[rgba(197,112,74,0.4)] bg-[rgba(245,180,160,0.4)] px-6 py-5 text-[15px] text-[#6b3a1f]"
    >
      <div className="min-w-0 flex-1">
        <div className="font-serif text-base font-medium">Couldn't load categorize queue</div>
        <div className="mt-0.5 text-[13px] text-[#7a4b2f]/85">{error}</div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[#6b3a1f] px-4 py-2 text-[13px] font-medium text-cream shadow-[0_6px_18px_-6px_rgba(107,58,31,0.45)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b3a1f]/40 motion-reduce:hover:translate-y-0"
      >
        Try again
      </button>
    </div>
  );
}
