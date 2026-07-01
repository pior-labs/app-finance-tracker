export function Donut({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const off = c - (c * pct) / 100;

  return (
    <svg viewBox="0 0 80 80" width="80" height="80" role="img" aria-label={`${pct} percent categorized`}>
      <defs>
        <linearGradient id="dash-donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--finlens-success-ink)" />
          <stop offset="100%" stopColor="var(--good-soft)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r={r} stroke="rgba(0,0,0,0.07)" strokeWidth="10" fill="none" />
      <circle
        cx="40"
        cy="40"
        r={r}
        stroke="url(#dash-donut-grad)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 40 40)"
      />
    </svg>
  );
}
