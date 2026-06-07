export function DashboardLoadingState() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Loading dashboard…</span>
      <div
        aria-hidden="true"
        className="h-25 animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none"
      />
      <div
        aria-hidden="true"
        className="h-70 animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none"
      />
      <div aria-hidden="true" className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr_1.1fr]">
        <div className="h-50 animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none" />
        <div className="h-50 animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none" />
        <div className="h-50 animate-bloom-pulse rounded-[28px] border border-white/60 bg-[rgba(255,253,247,0.5)] motion-reduce:animate-none" />
      </div>
    </div>
  );
}
