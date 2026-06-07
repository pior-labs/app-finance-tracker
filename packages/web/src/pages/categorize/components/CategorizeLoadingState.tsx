export function CategorizeLoadingState() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Loading categorize queue...</span>
      <div aria-hidden="true" className="h-24 animate-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)]" />
      <div aria-hidden="true" className="h-105 animate-pulse rounded-[36px] border border-white/60 bg-[rgba(255,253,247,0.5)]" />
      <div aria-hidden="true" className="flex gap-3">
        {[1, 2, 3, 4].map((k) => (
          <div key={k} className="h-10 flex-1 animate-pulse rounded-full border border-white/60 bg-[rgba(255,253,247,0.5)]" />
        ))}
      </div>
    </div>
  );
}
