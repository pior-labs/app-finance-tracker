import { DesignSwitcher } from '@/components/DesignSwitcher';

const hand = "'Caveat', 'Comic Sans MS', cursive";
const body = "'Lora', Georgia, serif";

const palette = {
  paper: '#f5ecd6',
  paperDeep: '#ece0c4',
  ink: '#3a2a1f',
  rule: '#c8b992',
  margin: '#d88a7a',
  coral: '#d04a3a',
  leaf: '#6b7a42',
  honey: '#d9992a',
  tape: '#f6d99c'
};

const entries = [
  { d: 'Sat 28',  desc: 'Bi-Rite Market',    cat: 'Groceries',  amt: -42.18,   note: 'peaches were perfect',    check: true },
  { d: 'Fri 27',  desc: 'Alaska → Portland', cat: 'Travel',     amt: -318.40,  note: 'worth every cent',        check: true },
  { d: 'Thu 26',  desc: 'Tartine',           cat: 'Dining',     amt: -23.50,   note: 'morning bun + americano', check: true },
  { d: 'Wed 25',  desc: 'Clipper autoload',  cat: 'Transport',  amt: -60.00,   note: '',                        check: true },
  { d: 'Tue 24',  desc: 'Payday ✺',          cat: 'Income',     amt:  4280.00, note: 'finally',                 check: true },
  { d: 'Mon 23',  desc: '?? POS 4821',       cat: 'review me',  amt: -84.20,   note: 'need to remember',        check: false }
];

const cats = [
  { name: 'Groceries',  amt: 842,  tint: '#b7cba0' },
  { name: 'Travel',     amt: 620,  tint: '#a5c1cf' },
  { name: 'Dining',     amt: 522,  tint: '#e8a789' },
  { name: 'Shopping',   amt: 412,  tint: '#c9a1bc' },
  { name: 'Transport',  amt: 287,  tint: '#e7c67a' },
  { name: 'Subs',       amt: 178,  tint: '#b9a27e' }
];

export function DesignSix() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        background: palette.paper,
        color: palette.ink,
        fontFamily: body,
        // Faint horizontal rule paper
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 31px, ${palette.rule}66 31px 32px)`,
        backgroundPosition: '0 80px'
      }}
    >
      <DesignSwitcher tone="light" />

      {/* Margin line */}
      <div
        className="pointer-events-none fixed top-0 bottom-0 w-px z-0"
        style={{ left: 'min(88px, 8vw)', background: palette.margin, opacity: 0.6 }}
      />

      {/* Header */}
      <header
        className="relative z-10 pt-10 md:pt-14 pb-6 pr-8 md:pr-16"
        style={{ paddingLeft: 'min(120px, 10vw)' }}
      >
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <div
              className="text-xs uppercase tracking-[0.3em] opacity-60"
              style={{ fontFamily: body }}
            >
              finlens · a ledger for two
            </div>
            <h1
              className="text-6xl md:text-8xl mt-1"
              style={{ fontFamily: hand, fontWeight: 700, lineHeight: 0.9 }}
            >
              March, mostly.
            </h1>
          </div>
          <div
            className="text-right text-sm italic"
            style={{ color: palette.leaf }}
          >
            <div style={{ fontFamily: hand, fontSize: '28px' }}>Sun · 29 · '26</div>
            <div className="opacity-70">pg. 3 of this month</div>
          </div>
        </div>
      </header>

      {/* Dear entry */}
      <section
        className="relative z-10 pb-10 pr-8 md:pr-16"
        style={{ paddingLeft: 'min(120px, 10vw)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <p
              className="text-[22px] leading-[32px] md:text-[26px] md:leading-[36px]"
              style={{ fontFamily: body }}
            >
              <span style={{ fontFamily: hand, fontSize: '44px', marginRight: '6px' }}>
                Dear ledger,
              </span>
              <br />
              we spent a little less than last month — about the price of one
              very good dinner out — and it felt, for once, deliberate. Groceries
              stayed honest. Portland happened. The coffees added up, as they
              do.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <HandCircle amount="$3,847.52" />
              <div
                className="text-lg leading-relaxed max-w-xs"
                style={{ fontFamily: hand, fontSize: '26px', color: palette.leaf }}
              >
                ↓ saved $280 vs. Feb<br />
                <span style={{ color: palette.coral }}>7 tx need a look ↙</span>
              </div>
            </div>
          </div>

          {/* Sticky note */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Washi tape */}
              <div
                className="absolute -top-3 left-8 w-20 h-6 rotate-[-4deg] z-10"
                style={{
                  background: palette.tape,
                  opacity: 0.85,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0 4px, transparent 4px 8px)'
                }}
              />
              <div
                className="w-[300px] md:w-[340px] p-6 rotate-[2deg] shadow-xl"
                style={{
                  background: '#fff8d8',
                  fontFamily: hand,
                  boxShadow: '4px 12px 28px -8px rgba(60,40,20,0.35)'
                }}
              >
                <div
                  className="text-sm uppercase tracking-widest opacity-60"
                  style={{ fontFamily: body, letterSpacing: '0.2em' }}
                >
                  to-do
                </div>
                <ul className="mt-3 space-y-3 text-2xl">
                  <li className="flex items-start gap-3">
                    <Checkbox checked />
                    <span className="line-through opacity-70">upload Feb statement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Checkbox checked />
                    <span className="line-through opacity-70">review 4 big txns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Checkbox />
                    <span>
                      review{' '}
                      <span style={{ color: palette.coral }}>7 mystery charges</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Checkbox />
                    <span>cancel one subscription (any!)</span>
                  </li>
                </ul>
                <div
                  className="mt-5 text-lg opacity-60"
                  style={{ fontStyle: 'italic' }}
                >
                  — love, you
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hand-drawn divider */}
      <div className="relative z-10 my-6 flex justify-center opacity-50">
        <svg width="180" height="22" viewBox="0 0 180 22" fill="none" style={{ color: palette.ink }}>
          <path
            d="M5 14 C 25 6, 45 18, 70 10 S 110 20, 140 8 S 170 14, 175 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="90" cy="14" r="3" fill="currentColor" opacity="0.5" />
        </svg>
      </div>

      {/* Categories — polaroid cards on tape */}
      <section
        className="relative z-10 pb-14 pr-8 md:pr-16"
        style={{ paddingLeft: 'min(120px, 10vw)' }}
      >
        <h2
          className="mb-6 text-5xl"
          style={{ fontFamily: hand, fontWeight: 700 }}
        >
          where it went ↓
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {cats.map((c, i) => {
            const tilts = [-2.5, 1.8, -1.2, 2.3, -1.8, 1.4];
            const tilt = tilts[i % tilts.length];
            return (
              <div
                key={c.name}
                className="relative"
                style={{ transform: `rotate(${tilt}deg)` }}
              >
                {/* Tape */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 rotate-[-2deg] z-10"
                  style={{
                    background: palette.tape,
                    opacity: 0.75,
                    backgroundImage:
                      'repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0 3px, transparent 3px 6px)'
                  }}
                />
                <div
                  className="bg-white pt-8 pb-5 px-5 shadow-lg"
                  style={{
                    boxShadow: '3px 10px 22px -6px rgba(60,40,20,0.28)'
                  }}
                >
                  <div
                    className="aspect-[5/3] mb-3 flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: c.tint,
                      borderRadius: '2px'
                    }}
                  >
                    <div
                      className="text-[64px] leading-none opacity-95"
                      style={{
                        fontFamily: hand,
                        fontWeight: 700,
                        color: palette.ink
                      }}
                    >
                      ${c.amt}
                    </div>
                    {/* little scribble */}
                    <svg
                      className="absolute bottom-2 right-3 opacity-40"
                      width="50"
                      height="12"
                      viewBox="0 0 50 12"
                      fill="none"
                    >
                      <path
                        d="M2 8 Q 10 2, 18 7 T 34 6 T 48 5"
                        stroke={palette.ink}
                        strokeWidth="1.2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div
                    className="text-center text-2xl"
                    style={{ fontFamily: hand, fontWeight: 600 }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="text-center text-xs opacity-60"
                    style={{ fontFamily: body, fontStyle: 'italic' }}
                  >
                    {((c.amt / 3847) * 100).toFixed(0)}% of March
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Journal entries — ledger style */}
      <section
        className="relative z-10 pb-20 pr-8 md:pr-16"
        style={{ paddingLeft: 'min(120px, 10vw)' }}
      >
        <h2
          className="mb-2 text-5xl"
          style={{ fontFamily: hand, fontWeight: 700 }}
        >
          the week, entry by entry
        </h2>
        <div
          className="text-sm italic opacity-60 mb-6"
          style={{ color: palette.leaf }}
        >
          tick the ones you've thought about
        </div>

        <div>
          {entries.map((e, i) => (
            <div
              key={i}
              className="grid grid-cols-[28px_90px_1fr_140px_auto] items-baseline gap-4 py-2 border-b border-dashed"
              style={{ borderColor: palette.rule }}
            >
              <Checkbox checked={e.check} />
              <div
                className="text-lg"
                style={{ fontFamily: hand, color: palette.leaf }}
              >
                {e.d}
              </div>
              <div>
                <span
                  className="text-xl font-semibold"
                  style={{ fontFamily: body }}
                >
                  {e.desc}
                </span>
                {e.note && (
                  <span
                    className="ml-3 text-base"
                    style={{
                      fontFamily: hand,
                      color: palette.leaf,
                      opacity: 0.8
                    }}
                  >
                    — {e.note}
                  </span>
                )}
              </div>
              <div
                className="text-sm italic opacity-70 text-right"
                style={{ fontFamily: body }}
              >
                {e.cat}
              </div>
              <div
                className="text-2xl tabular-nums text-right"
                style={{
                  fontFamily: hand,
                  fontWeight: 700,
                  color:
                    e.amt > 0
                      ? palette.leaf
                      : e.cat === 'review me'
                      ? palette.coral
                      : palette.ink
                }}
              >
                {e.amt > 0 ? '+' : '−'}${Math.abs(e.amt).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <HandButton color={palette.ink} bg={palette.paperDeep}>
            + add an entry
          </HandButton>
          <HandButton color="#fff" bg={palette.coral}>
            drop a PDF statement →
          </HandButton>
        </div>

        <div
          className="mt-16 text-center text-lg opacity-50"
          style={{ fontFamily: hand }}
        >
          — tomorrow, try making coffee at home again. love, you. —
        </div>
      </section>
    </div>
  );
}

function Checkbox({ checked = false }: { checked?: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: 22,
        height: 22,
        border: '2px solid #3a2a1f',
        borderRadius: '4px',
        background: 'transparent',
        transform: 'rotate(-2deg)',
        flexShrink: 0
      }}
    >
      {checked && (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path
            d="M3 11 L 8 16 L 18 3"
            stroke="#d04a3a"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

function HandCircle({ amount }: { amount: string }) {
  return (
    <div className="relative inline-block">
      <span
        className="text-6xl md:text-7xl tabular-nums"
        style={{
          fontFamily: "'Caveat', cursive",
          fontWeight: 700,
          letterSpacing: '-0.02em'
        }}
      >
        {amount}
      </span>
      <svg
        className="absolute -inset-4 pointer-events-none"
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        style={{ width: 'calc(100% + 32px)', height: 'calc(100% + 32px)' }}
      >
        <ellipse
          cx="150"
          cy="50"
          rx="140"
          ry="38"
          fill="none"
          stroke="#d04a3a"
          strokeWidth="2.2"
          strokeDasharray="350 30"
          transform="rotate(-2 150 50)"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

function HandButton({
  children,
  color,
  bg
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <button
      className="px-5 py-3 text-2xl transition hover:-translate-y-0.5"
      style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        background: bg,
        color,
        border: '2px solid #3a2a1f',
        borderRadius: '24px 30px 22px 28px',
        boxShadow: '3px 4px 0 #3a2a1f'
      }}
    >
      {children}
    </button>
  );
}
