import { DesignSwitcher } from '@/components/DesignSwitcher';

const display = "'DM Serif Display', Georgia, serif";
const body = "'Nunito', system-ui, sans-serif";

// Eames / Heath ceramics warmth
const c = {
  cream: '#f3e6cf',
  creamDeep: '#ead7b5',
  ink: '#2a1f16',
  mustard: '#e2a238',
  orange: '#d66236',
  teal: '#3a7e82',
  brick: '#a6412b',
  olive: '#7d8a3c',
  rose: '#d98a7a'
};

const cats = [
  { name: 'Groceries',     amt: 842.17, color: c.olive,   pct: 21.9 },
  { name: 'Travel',        amt: 620.40, color: c.teal,    pct: 16.1 },
  { name: 'Dining',        amt: 521.88, color: c.orange,  pct: 13.6 },
  { name: 'Shopping',      amt: 412.00, color: c.rose,    pct: 10.7 },
  { name: 'Transport',     amt: 287.33, color: c.mustard, pct: 7.5 },
  { name: 'Utilities',     amt: 245.12, color: c.brick,   pct: 6.4 },
  { name: 'Health',        amt: 184.50, color: '#8a6d4f', pct: 4.8 },
  { name: 'Subscriptions', amt: 178.49, color: '#b9934a', pct: 4.6 },
  { name: 'Other',         amt: 555.63, color: c.creamDeep, pct: 14.4 }
];

const recent = [
  { d: 'Mar 28', desc: 'Bi-Rite Market',  cat: 'Groceries',  amt: -42.18, color: c.olive },
  { d: 'Mar 27', desc: 'Alaska Air',       cat: 'Travel',     amt: -318.40, color: c.teal },
  { d: 'Mar 26', desc: 'Tartine',          cat: 'Dining',     amt: -23.50,  color: c.orange },
  { d: 'Mar 25', desc: 'Clipper',          cat: 'Transport',  amt: -60.00,  color: c.mustard },
  { d: 'Mar 24', desc: 'Payday',           cat: 'Income',     amt:  4280.00,color: c.olive }
];

// Compute donut arcs
function donutArcs(data: { color: string; pct: number }[]) {
  const r = 88;
  const cx = 100;
  const cy = 100;
  let cumulative = 0;
  const total = data.reduce((a, b) => a + b.pct, 0);
  return data.map((d) => {
    const startAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    cumulative += d.pct;
    const endAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(startAngle) * r;
    const y1 = cy + Math.sin(startAngle) * r;
    const x2 = cx + Math.cos(endAngle) * r;
    const y2 = cy + Math.sin(endAngle) * r;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return {
      color: d.color,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
    };
  });
}

export function DesignEight() {
  const arcs = donutArcs(cats);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: c.cream,
        color: c.ink,
        fontFamily: body
      }}
    >
      <DesignSwitcher tone="light" />

      {/* Background arcs */}
      <svg
        className="pointer-events-none fixed top-0 right-0 opacity-80"
        width="620"
        height="620"
        viewBox="0 0 620 620"
        style={{ transform: 'translate(25%, -30%)' }}
      >
        <circle cx="310" cy="310" r="300" fill={c.mustard} opacity="0.25" />
        <circle cx="310" cy="310" r="220" fill={c.orange} opacity="0.2" />
        <circle cx="310" cy="310" r="140" fill={c.brick} opacity="0.18" />
      </svg>
      <svg
        className="pointer-events-none fixed bottom-0 left-0 opacity-90"
        width="400"
        height="400"
        viewBox="0 0 400 400"
        style={{ transform: 'translate(-40%, 35%)' }}
      >
        <circle cx="200" cy="200" r="200" fill={c.teal} opacity="0.22" />
        <circle cx="200" cy="200" r="130" fill={c.olive} opacity="0.25" />
      </svg>

      {/* Nav */}
      <header className="relative flex items-center justify-between px-8 md:px-16 pt-8">
        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-full flex items-center justify-center"
            style={{
              background: c.ink,
              color: c.cream,
              fontFamily: display,
              fontStyle: 'italic',
              fontSize: '22px'
            }}
          >
            f
          </div>
          <div
            className="text-2xl"
            style={{ fontFamily: display, letterSpacing: '-0.01em' }}
          >
            Finlens
          </div>
        </div>
        <div
          className="hidden md:flex gap-2 p-1 rounded-full"
          style={{ background: `${c.ink}12` }}
        >
          {['Overview', 'Ledger', 'Review 7', 'Upload'].map((t, i) => (
            <a
              key={t}
              className="px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition"
              style={{
                background: i === 0 ? c.ink : 'transparent',
                color: i === 0 ? c.cream : c.ink
              }}
            >
              {t}
            </a>
          ))}
        </div>
        <div className="text-sm opacity-70">March 2026</div>
      </header>

      {/* Hero with dial */}
      <section className="relative px-8 md:px-16 pt-14 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 z-10">
          <div className="text-sm uppercase tracking-[0.3em] opacity-60 mb-5 font-bold">
            The Month · In the Round
          </div>
          <h1
            className="leading-[0.95]"
            style={{
              fontFamily: display,
              fontSize: 'clamp(56px, 9vw, 132px)',
              letterSpacing: '-0.02em'
            }}
          >
            <em style={{ color: c.orange }}>Thirty-nine</em>
            <br />
            hundred,
            <br />
            <em style={{ color: c.teal }}>give or take.</em>
          </h1>
          <p className="mt-6 text-lg leading-relaxed max-w-lg opacity-80">
            March outflow landed at <b>$3,847.52</b> — a softer month by nearly
            seven percent. The dial turns. The coffee is still good. The porch
            is sunny again.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <RoundButton bg={c.ink} fg={c.cream}>
              Upload statement
            </RoundButton>
            <RoundButton bg="transparent" fg={c.ink} border>
              Review 7 transactions
            </RoundButton>
          </div>
        </div>

        {/* Donut dial */}
        <div className="lg:col-span-6 flex justify-center z-10">
          <div className="relative" style={{ width: 'min(460px, 85vw)', aspectRatio: '1' }}>
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(
                  ${c.ink} 0deg 8deg,
                  transparent 8deg 38deg,
                  ${c.ink} 38deg 46deg,
                  transparent 46deg 76deg,
                  ${c.ink} 76deg 84deg,
                  transparent 84deg 360deg
                )`,
                mask: 'radial-gradient(circle, transparent 48%, black 49%, black 50%, transparent 51%)',
                WebkitMask:
                  'radial-gradient(circle, transparent 48%, black 49%, black 50%, transparent 51%)',
                opacity: 0.4
              }}
            />
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full relative"
              style={{
                filter: 'drop-shadow(0 18px 40px rgba(42,31,22,0.25))'
              }}
            >
              {arcs.map((a, i) => (
                <path key={i} d={a.path} fill={a.color} />
              ))}
              <circle cx="100" cy="100" r="54" fill={c.cream} />
              <circle
                cx="100"
                cy="100"
                r="54"
                fill="none"
                stroke={c.ink}
                strokeOpacity="0.1"
                strokeWidth="0.5"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[10px] tracking-[0.35em] uppercase opacity-60 font-bold">
                Total
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: display,
                  fontSize: 'clamp(36px, 4.5vw, 54px)',
                  letterSpacing: '-0.02em',
                  color: c.ink
                }}
              >
                $3,847
              </div>
              <div
                className="text-sm font-bold -mt-1"
                style={{ color: c.orange }}
              >
                ↓ 6.8% vs. Feb
              </div>
            </div>

            {/* Tick marks */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                const x1 = 100 + Math.cos(a) * 96;
                const y1 = 100 + Math.sin(a) * 96;
                const x2 = 100 + Math.cos(a) * 99;
                const y2 = 100 + Math.sin(a) * 99;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={c.ink}
                    strokeWidth="0.6"
                    opacity="0.35"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </section>

      {/* Category legend */}
      <section className="relative px-8 md:px-16 pb-14 z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cats.slice(0, 5).map((cat) => (
            <div
              key={cat.name}
              className="rounded-[28px] p-5 transition hover:-translate-y-1 cursor-pointer"
              style={{
                background: `${cat.color}e0`,
                color: cat.color === c.creamDeep ? c.ink : '#fff8ee'
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-85">
                <span className="size-2 rounded-full bg-current" />
                {cat.name}
              </div>
              <div
                className="text-4xl mt-2 tabular-nums"
                style={{ fontFamily: display, letterSpacing: '-0.02em' }}
              >
                ${Math.floor(cat.amt)}
              </div>
              <div className="text-xs opacity-80 mt-0.5 font-semibold">
                {cat.pct.toFixed(1)}% of the month
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column: stats + recent */}
      <section className="relative px-8 md:px-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        {/* Stats side */}
        <div className="lg:col-span-4 grid gap-4">
          <BigStat bg={c.mustard} fg={c.ink} label="Saved vs. February" value="$280.89" sub="roughly one dinner out" />
          <BigStat bg={c.teal}    fg={c.cream} label="Auto-categorized"    value="95%"       sub="141 of 148 entries" />
          <BigStat bg={c.brick}   fg={c.cream} label="Needs your eye"       value="7 items"   sub="low-confidence" accent />
        </div>

        {/* Recent */}
        <div
          className="lg:col-span-8 rounded-[32px] overflow-hidden"
          style={{
            background: c.creamDeep,
            border: `1.5px solid ${c.ink}15`,
            boxShadow: '0 12px 40px -16px rgba(42,31,22,0.25)'
          }}
        >
          <div className="px-7 py-5 flex items-center justify-between border-b" style={{ borderColor: `${c.ink}15` }}>
            <h2
              className="text-3xl"
              style={{ fontFamily: display, letterSpacing: '-0.01em' }}
            >
              Recent <em style={{ color: c.orange }}>goings-on</em>
            </h2>
            <a className="text-sm font-bold opacity-70 cursor-pointer">
              See all 148 →
            </a>
          </div>
          <ul>
            {recent.map((t, i) => (
              <li
                key={i}
                className="flex items-center gap-5 px-7 py-5 hover:bg-black/5 transition border-b last:border-b-0"
                style={{ borderColor: `${c.ink}10` }}
              >
                <div
                  className="size-12 rounded-full shrink-0"
                  style={{ background: t.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold truncate" style={{ fontFamily: display }}>
                    {t.desc}
                  </div>
                  <div className="text-xs uppercase tracking-widest opacity-60 mt-0.5 font-bold">
                    {t.d} · {t.cat}
                  </div>
                </div>
                <div
                  className="text-2xl tabular-nums"
                  style={{
                    fontFamily: display,
                    color: t.amt > 0 ? c.olive : c.ink,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {t.amt > 0 ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function RoundButton({
  children,
  bg,
  fg,
  border
}: {
  children: React.ReactNode;
  bg: string;
  fg: string;
  border?: boolean;
}) {
  return (
    <button
      className="px-6 py-3 text-[15px] font-extrabold transition hover:-translate-y-0.5"
      style={{
        background: bg,
        color: fg,
        borderRadius: '999px',
        border: border ? `2px solid ${c.ink}` : 'none',
        fontFamily: "'Nunito', sans-serif"
      }}
    >
      {children}
    </button>
  );
}

function BigStat({
  bg,
  fg,
  label,
  value,
  sub,
  accent
}: {
  bg: string;
  fg: string;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-[28px] p-6 transition hover:-translate-y-0.5"
      style={{
        background: bg,
        color: fg,
        boxShadow: '0 10px 30px -16px rgba(42,31,22,0.3)'
      }}
    >
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-85">
        <span>{label}</span>
        {accent && <span className="size-2 rounded-full bg-current animate-pulse" />}
      </div>
      <div
        className="text-5xl mt-2 tabular-nums"
        style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.02em' }}
      >
        {value}
      </div>
      <div className="text-sm opacity-85 mt-1 font-semibold">{sub}</div>
    </div>
  );
}
