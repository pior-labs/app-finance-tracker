import { DesignSwitcher } from '@/components/DesignSwitcher';

const serif = "'Cormorant Garamond', 'Times New Roman', serif";
const sans = "'Inter Tight', system-ui, sans-serif";

const palette = {
  washi: '#f1e9d9',
  washiDeep: '#e8dcc4',
  ink: '#2a2520',
  sumi: '#1a1612',
  persimmon: '#b45439',
  moss: '#7a8658',
  clay: '#c89a6a',
  stone: '#9a8b76'
};

const cats = [
  { name: 'Groceries',     jp: '食料品',   amt: 842.17 },
  { name: 'Travel',        jp: '旅',       amt: 620.40 },
  { name: 'Dining',        jp: '外食',     amt: 521.88 },
  { name: 'Shopping',      jp: '買い物',   amt: 412.00 },
  { name: 'Transport',     jp: '交通',     amt: 287.33 },
  { name: 'Utilities',     jp: '光熱費',   amt: 245.12 },
  { name: 'Health',        jp: '健康',     amt: 184.50 },
  { name: 'Subscriptions', jp: '購読',     amt: 178.49 }
];

const recent = [
  { d: '三月 28', desc: 'Bi-Rite Market',   cat: 'Groceries',  amt: -42.18 },
  { d: '三月 27', desc: 'Alaska Air',        cat: 'Travel',     amt: -318.40 },
  { d: '三月 26', desc: 'Tartine',           cat: 'Dining',     amt: -23.50 },
  { d: '三月 25', desc: 'Clipper',           cat: 'Transport',  amt: -60.00 },
  { d: '三月 24', desc: 'Payday',            cat: 'Income',     amt:  4280.00 }
];

export function DesignSeven() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        background: palette.washi,
        color: palette.ink,
        fontFamily: sans,
        // Subtle paper fibers
        backgroundImage: `
          radial-gradient(circle at 25% 10%, ${palette.washiDeep}99, transparent 35%),
          radial-gradient(circle at 80% 90%, ${palette.washiDeep}66, transparent 45%)
        `
      }}
    >
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }}
      />

      <DesignSwitcher tone="light" />

      {/* Top strip */}
      <header className="relative flex items-center justify-between px-8 md:px-20 py-8">
        <div className="flex items-baseline gap-3">
          <div
            className="text-3xl"
            style={{ fontFamily: serif, fontWeight: 500, fontStyle: 'italic' }}
          >
            finlens
          </div>
          <div
            className="text-xs tracking-[0.3em] uppercase opacity-60"
            style={{ fontFamily: sans }}
          >
            · fin · lens
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-10 text-xs tracking-[0.25em] uppercase opacity-60">
          <a>Month</a>
          <a>Ledger</a>
          <a>Review</a>
          <a>Upload</a>
        </nav>
        <div
          className="text-xs tracking-[0.25em] uppercase opacity-50"
          style={{ fontFamily: sans }}
        >
          Mar · XXIX · MMXXVI
        </div>
      </header>

      {/* Hero — ensō */}
      <section className="relative px-8 md:px-20 pt-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 lg:order-2 flex justify-center">
            <Enso amount="3,847" cents=".52" />
          </div>

          <div className="lg:col-span-7 lg:order-1 relative">
            <div
              className="text-xs tracking-[0.3em] uppercase opacity-60 mb-8"
              style={{ fontFamily: sans }}
            >
              March · a quiet month
            </div>

            <h1
              className="leading-[0.95]"
              style={{
                fontFamily: serif,
                fontSize: 'clamp(48px, 7vw, 92px)',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: '-0.01em'
              }}
            >
              Less,
              <br />
              <span style={{ fontStyle: 'normal', fontWeight: 300 }}>
                and enough.
              </span>
            </h1>

            <div
              className="mt-10 text-lg leading-[1.9] max-w-lg"
              style={{ color: palette.sumi, fontWeight: 400 }}
            >
              March settled at{' '}
              <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '22px' }}>
                $3,847.52
              </span>
              . Six point eight percent below February — not a victory so much
              as a return to rhythm. The cupboard was full. The coffees were
              fewer. A single trip, taken well.
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
              <Stat label="vs. February" value="−6.8%" />
              <VRule />
              <Stat label="Transactions" value="148" />
              <VRule />
              <Stat label="To review" value="7" accent={palette.persimmon} />
            </div>

            <div className="mt-12 flex flex-wrap gap-5">
              <MinimalButton primary>Upload a statement</MinimalButton>
              <MinimalButton>Review queue</MinimalButton>
            </div>
          </div>
        </div>
      </section>

      {/* Brush divider */}
      <BrushDivider />

      {/* Categories — vertical reading */}
      <section className="relative px-8 md:px-20 py-20">
        <div className="flex items-baseline justify-between mb-12">
          <h2
            className="text-4xl md:text-5xl"
            style={{
              fontFamily: serif,
              fontWeight: 400,
              fontStyle: 'italic',
              letterSpacing: '-0.01em'
            }}
          >
            What we tended to
          </h2>
          <div
            className="text-xs tracking-[0.3em] uppercase opacity-60"
            style={{ fontFamily: sans }}
          >
            Category · 八つ
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20">
          {cats.map((c, i) => {
            const max = 842.17;
            const pct = (c.amt / max) * 100;
            return (
              <div
                key={c.name}
                className="group py-7 border-b"
                style={{ borderColor: `${palette.ink}1a` }}
              >
                <div className="flex items-baseline justify-between gap-6 mb-3">
                  <div className="flex items-baseline gap-4 min-w-0">
                    <span
                      className="text-2xl"
                      style={{
                        fontFamily: serif,
                        fontWeight: 400,
                        color: palette.ink
                      }}
                    >
                      {c.name}
                    </span>
                    <span
                      className="text-sm opacity-50"
                      style={{ fontFamily: serif }}
                    >
                      {c.jp}
                    </span>
                  </div>
                  <span
                    className="text-2xl tabular-nums"
                    style={{ fontFamily: serif, fontStyle: 'italic' }}
                  >
                    ${c.amt.toFixed(2)}
                  </span>
                </div>
                {/* Hairline progress with single persimmon dot */}
                <div className="relative h-px" style={{ background: `${palette.ink}14` }}>
                  <div
                    className="absolute top-0 left-0 h-px transition-all"
                    style={{
                      width: `${pct}%`,
                      background: palette.ink,
                      opacity: 0.35
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 size-2 rounded-full transition-all"
                    style={{
                      left: `calc(${pct}% - 4px)`,
                      background: i === 0 ? palette.persimmon : palette.ink,
                      opacity: i === 0 ? 1 : 0.55
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <BrushDivider />

      {/* Recent — haiku-like */}
      <section className="relative px-8 md:px-20 py-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2
              className="text-4xl md:text-5xl leading-[1.05]"
              style={{
                fontFamily: serif,
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: '-0.01em'
              }}
            >
              The past week,
              <br />
              in five entries.
            </h2>
            <p
              className="mt-6 text-base opacity-70 leading-relaxed max-w-sm"
              style={{ color: palette.sumi }}
            >
              A reduced view. The full ledger waits — 148 moments this month,
              each one a small decision.
            </p>
            <a
              className="mt-8 inline-block text-sm tracking-[0.25em] uppercase border-b pb-1 cursor-pointer"
              style={{ borderColor: palette.persimmon, color: palette.persimmon }}
            >
              Read the whole month →
            </a>
          </div>

          <div className="lg:col-span-8 space-y-2">
            {recent.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-[80px_1fr_auto] items-baseline gap-6 py-5 border-b"
                style={{ borderColor: `${palette.ink}14` }}
              >
                <div
                  className="text-sm tracking-[0.2em] uppercase opacity-60"
                  style={{ fontFamily: sans }}
                >
                  {t.d}
                </div>
                <div>
                  <div
                    className="text-2xl"
                    style={{ fontFamily: serif, fontWeight: 400 }}
                  >
                    {t.desc}
                  </div>
                  <div
                    className="text-xs tracking-[0.2em] uppercase opacity-45 mt-1"
                    style={{ fontFamily: sans }}
                  >
                    {t.cat}
                  </div>
                </div>
                <div
                  className="text-2xl tabular-nums text-right"
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    color: t.amt > 0 ? palette.moss : palette.ink
                  }}
                >
                  {t.amt > 0 ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-24 text-center text-xs tracking-[0.35em] uppercase opacity-40"
          style={{ fontFamily: sans }}
        >
          — nothing kept that is not needed —
        </div>
      </section>
    </div>
  );
}

function Enso({ amount, cents }: { amount: string; cents: string }) {
  return (
    <div className="relative" style={{ width: 'min(420px, 80vw)', aspectRatio: '1' }}>
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="brush7" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
            <feDisplacementMap in="SourceGraphic" scale="3" />
          </filter>
        </defs>
        <path
          d="M 200 40
             A 160 160 0 1 1 60 220
             A 160 160 0 0 1 210 60"
          fill="none"
          stroke="#2a2520"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="960 30 12 24"
          opacity="0.9"
          filter="url(#brush7)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="text-xs tracking-[0.35em] uppercase opacity-60 mb-2"
          style={{ fontFamily: 'Inter Tight, sans-serif' }}
        >
          spent · march
        </div>
        <div
          className="text-6xl md:text-7xl tabular-nums"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '-0.02em'
          }}
        >
          <span>${amount}</span>
          <span className="opacity-60" style={{ fontSize: '0.45em' }}>
            {cents}
          </span>
        </div>
        <div
          className="mt-2 text-xs tracking-[0.3em] uppercase"
          style={{
            color: '#b45439',
            fontFamily: 'Inter Tight, sans-serif'
          }}
        >
          ↓ 6.8%
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <div
        className="text-[10px] tracking-[0.3em] uppercase opacity-55 mb-1"
        style={{ fontFamily: 'Inter Tight, sans-serif' }}
      >
        {label}
      </div>
      <div
        className="text-3xl tabular-nums"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 500,
          color: accent
        }}
      >
        {value}
      </div>
    </div>
  );
}

function VRule() {
  return (
    <div
      className="hidden sm:block h-10 w-px"
      style={{ background: '#2a252020' }}
    />
  );
}

function MinimalButton({
  children,
  primary
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      className="px-7 py-3 text-sm tracking-[0.2em] uppercase transition hover:-translate-y-0.5"
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        fontWeight: 500,
        borderRadius: '999px',
        background: primary ? '#2a2520' : 'transparent',
        color: primary ? '#f1e9d9' : '#2a2520',
        border: primary ? 'none' : '1px solid #2a252044'
      }}
    >
      {children}
    </button>
  );
}

function BrushDivider() {
  return (
    <div className="flex justify-center py-4">
      <svg width="220" height="14" viewBox="0 0 220 14" fill="none" className="opacity-70">
        <path
          d="M5 8 C 40 3, 80 11, 120 6 S 180 10, 215 7"
          stroke="#2a2520"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="205" cy="7" r="2.5" fill="#b45439" />
      </svg>
    </div>
  );
}
