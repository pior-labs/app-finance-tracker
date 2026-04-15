import { DesignSwitcher } from '@/components/DesignSwitcher';

const display = "'Playfair Display', Georgia, serif";
const body = "'Outfit', system-ui, sans-serif";

const t = {
  cream: '#f3e6d0',
  creamDeep: '#ead5b4',
  terracotta: '#c85a3b',
  terraDeep: '#a03c22',
  olive: '#6a7a3f',
  plum: '#5e2d42',
  saffron: '#e4a84c',
  sand: '#dcc79a',
  ink: '#2b1a14'
};

const cats = [
  { name: 'Mercato',     en: 'Groceries',     amt: 842.17, color: t.olive,      icon: '☘' },
  { name: 'Viaggio',     en: 'Travel',        amt: 620.40, color: t.saffron,    icon: '☀' },
  { name: 'Tavola',      en: 'Dining',        amt: 521.88, color: t.terracotta, icon: '❦' },
  { name: 'Bottega',     en: 'Shopping',      amt: 412.00, color: t.plum,       icon: '✦' },
  { name: 'Trasporto',   en: 'Transport',     amt: 287.33, color: '#8b5a3a',    icon: '◈' },
  { name: 'Casa',        en: 'Utilities',     amt: 245.12, color: t.terraDeep,  icon: '⌂' }
];

const recent = [
  { d: 'XXVIII', desc: 'Bi-Rite Market',   cat: 'Mercato',    amt: -42.18 },
  { d: 'XXVII',  desc: 'Alaska Air',        cat: 'Viaggio',    amt: -318.40 },
  { d: 'XXVI',   desc: 'Tartine',           cat: 'Tavola',     amt: -23.50 },
  { d: 'XXV',    desc: 'Clipper Autoload',  cat: 'Trasporto',  amt: -60.00 },
  { d: 'XXIV',   desc: 'Direct Deposit',    cat: 'Entrata',    amt:  4280.00 }
];

export function DesignTen() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        background: t.cream,
        color: t.ink,
        fontFamily: body
      }}
    >
      <DesignSwitcher tone="light" />

      {/* Top terracotta band */}
      <div
        className="relative overflow-hidden"
        style={{
          background: t.terracotta,
          color: t.cream,
          borderBottomLeftRadius: '50% 80px',
          borderBottomRightRadius: '50% 80px'
        }}
      >
        {/* Sun */}
        <div
          className="absolute rounded-full opacity-90 pointer-events-none"
          style={{
            width: 220,
            height: 220,
            right: -40,
            top: -80,
            background: `radial-gradient(circle, ${t.saffron}, ${t.saffron}00 70%)`
          }}
        />
        {/* Arches silhouette */}
        <svg
          className="absolute bottom-0 left-8 opacity-20"
          width="240"
          height="90"
          viewBox="0 0 240 90"
          fill="currentColor"
        >
          <path d="M0 90 L 0 40 A 30 40 0 0 1 60 40 L 60 90 Z" />
          <path d="M60 90 L 60 30 A 40 50 0 0 1 140 30 L 140 90 Z" />
          <path d="M140 90 L 140 40 A 30 40 0 0 1 200 40 L 200 90 Z" />
        </svg>

        <header className="relative flex items-center justify-between px-8 md:px-16 py-6">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-full flex items-center justify-center"
              style={{
                border: `2px solid ${t.cream}`,
                color: t.cream
              }}
            >
              <span style={{ fontFamily: display, fontStyle: 'italic', fontSize: '20px' }}>f</span>
            </div>
            <div
              className="text-2xl"
              style={{
                fontFamily: display,
                fontWeight: 700,
                letterSpacing: '-0.01em'
              }}
            >
              Finlens
            </div>
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-80 hidden md:inline">
              · Villa Edition
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm tracking-[0.15em] uppercase font-medium">
            <a className="opacity-90 cursor-pointer">Mese</a>
            <a className="opacity-90 cursor-pointer">Registro</a>
            <a className="opacity-90 cursor-pointer">Rivedi · 7</a>
            <a className="opacity-90 cursor-pointer">Carica</a>
          </nav>
          <div className="text-xs tracking-[0.25em] uppercase opacity-80">Marzo · MMXXVI</div>
        </header>

        <div className="relative px-8 md:px-16 pt-6 pb-20 md:pb-28">
          <div className="text-xs tracking-[0.4em] uppercase opacity-80 mb-4">
            Il Mese di Marzo
          </div>
          <h1
            className="leading-[0.95]"
            style={{
              fontFamily: display,
              fontSize: 'clamp(64px, 11vw, 168px)',
              fontWeight: 900,
              letterSpacing: '-0.03em'
            }}
          >
            Un mese
            <br />
            <em style={{ fontWeight: 400 }}>dolcemente</em>
            <br />
            piccolo.
          </h1>
          <p
            className="mt-5 text-lg max-w-xl opacity-90"
            style={{ fontFamily: body }}
          >
            We spent <b>$3,847.52</b> this March — nearly seven percent kinder
            to the jar than February. Bread at home. Olive oil on everything.
            One trip, taken slowly.
          </p>
        </div>
      </div>

      {/* Arched stat row — floats over band */}
      <section className="relative px-6 md:px-16 -mt-16 md:-mt-20 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ArchCard
            bg={t.cream}
            accent={t.terracotta}
            label="Spent · Marzo"
            value="$3,847"
            decimal=".52"
            sub="↓ 6.8% vs. Febbraio"
          />
          <ArchCard
            bg={t.saffron}
            accent={t.ink}
            label="Saved"
            value="$280"
            decimal=".89"
            sub="≈ one good dinner"
          />
          <ArchCard
            bg={t.olive}
            accent={t.cream}
            fg={t.cream}
            label="Needs your eye"
            value="7"
            decimal=""
            sub="low-confidence transactions"
          />
        </div>
      </section>

      {/* Olive branch divider */}
      <div className="relative py-14 flex justify-center" style={{ color: t.olive }}>
        <svg width="260" height="30" viewBox="0 0 260 30" fill="none">
          <line x1="0" y1="15" x2="100" y2="15" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
          <line x1="160" y1="15" x2="260" y2="15" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
          {/* leaves */}
          <g transform="translate(110 15)">
            <ellipse cx="-18" cy="-4" rx="8" ry="3" fill="currentColor" transform="rotate(-30)" opacity="0.85" />
            <ellipse cx="-8" cy="4" rx="8" ry="3" fill="currentColor" transform="rotate(20)" opacity="0.85" />
            <ellipse cx="8" cy="-4" rx="8" ry="3" fill="currentColor" transform="rotate(-20)" opacity="0.85" />
            <ellipse cx="18" cy="4" rx="8" ry="3" fill="currentColor" transform="rotate(30)" opacity="0.85" />
            <circle cx="0" cy="0" r="2.5" fill={t.terracotta} />
          </g>
        </svg>
      </div>

      {/* Categories — arched gallery */}
      <section className="relative px-6 md:px-16 pb-14">
        <div className="flex items-end justify-between mb-8">
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: display, fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            <em style={{ fontWeight: 400 }}>Il</em> breakdown
          </h2>
          <div className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium">
            sei categorie · six categories
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {cats.map((c) => {
            const pct = (c.amt / 842.17) * 100;
            return (
              <div
                key={c.name}
                className="relative pt-10 pb-6 px-6 transition hover:-translate-y-1 cursor-pointer"
                style={{
                  background: t.creamDeep,
                  borderRadius: '200px 200px 28px 28px',
                  border: `1.5px solid ${t.ink}14`,
                  boxShadow: '0 14px 34px -18px rgba(43,26,20,0.35)'
                }}
              >
                {/* keystone */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 size-14 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    top: '24px',
                    background: c.color,
                    color: c.color === t.saffron ? t.ink : t.cream,
                    boxShadow: '0 8px 18px -8px rgba(43,26,20,0.4)'
                  }}
                >
                  {c.icon}
                </div>
                <div className="h-12" />
                <div className="text-center">
                  <div
                    className="text-xl"
                    style={{ fontFamily: display, fontWeight: 700, color: c.color }}
                  >
                    {c.name}
                  </div>
                  <div className="text-[11px] tracking-[0.25em] uppercase opacity-50 font-medium">
                    {c.en}
                  </div>
                  <div
                    className="text-4xl tabular-nums mt-3"
                    style={{
                      fontFamily: display,
                      fontWeight: 900,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    ${Math.floor(c.amt)}
                    <span className="text-base font-normal opacity-55">
                      .{c.amt.toFixed(2).split('.')[1]}
                    </span>
                  </div>
                </div>
                <div
                  className="mt-4 h-1.5 rounded-full overflow-hidden"
                  style={{ background: `${t.ink}12` }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: c.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ledger — cartouche style */}
      <section className="relative px-6 md:px-16 pb-16">
        <div
          className="relative overflow-hidden"
          style={{
            background: t.creamDeep,
            borderRadius: '60px',
            border: `1.5px solid ${t.ink}18`,
            boxShadow: '0 20px 60px -28px rgba(43,26,20,0.4)'
          }}
        >
          {/* Corner flourishes */}
          <Flourish className="top-5 left-5" />
          <Flourish className="top-5 right-5" flip />
          <Flourish className="bottom-5 left-5" vflip />
          <Flourish className="bottom-5 right-5" flip vflip />

          <div className="px-10 md:px-16 pt-12 pb-6 text-center">
            <div className="text-xs tracking-[0.5em] uppercase font-bold opacity-55">
              Il Registro · The Ledger
            </div>
            <h2
              className="text-4xl md:text-5xl mt-2"
              style={{
                fontFamily: display,
                fontWeight: 900,
                fontStyle: 'italic',
                letterSpacing: '-0.02em'
              }}
            >
              l'ultima settimana
            </h2>
            <div
              className="mx-auto mt-3 h-px w-20"
              style={{ background: t.terracotta }}
            />
          </div>

          <ul className="px-6 md:px-12 pb-12">
            {recent.map((e, i) => (
              <li
                key={i}
                className="grid grid-cols-[70px_1fr_auto] items-baseline gap-6 py-5 border-b last:border-b-0"
                style={{ borderColor: `${t.ink}15` }}
              >
                <div
                  className="text-center text-sm tracking-[0.15em]"
                  style={{ fontFamily: display, fontStyle: 'italic', color: t.terracotta }}
                >
                  {e.d}
                </div>
                <div>
                  <div
                    className="text-xl"
                    style={{ fontFamily: display, fontWeight: 700 }}
                  >
                    {e.desc}
                  </div>
                  <div className="text-[11px] tracking-[0.25em] uppercase opacity-55 font-semibold mt-0.5">
                    {e.cat}
                  </div>
                </div>
                <div
                  className="text-2xl tabular-nums text-right"
                  style={{
                    fontFamily: display,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: e.amt > 0 ? t.olive : t.ink
                  }}
                >
                  {e.amt > 0 ? '+' : '−'}${Math.abs(e.amt).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 justify-center pb-10 px-6">
            <PillButton bg={t.terracotta} fg={t.cream}>
              Carica PDF ↑
            </PillButton>
            <PillButton bg="transparent" fg={t.ink} border={t.ink}>
              Rivedi 7 transazioni
            </PillButton>
          </div>
        </div>

        <div
          className="mt-10 text-center text-xs tracking-[0.4em] uppercase opacity-45"
          style={{ fontFamily: body, fontWeight: 500 }}
        >
          — fatto con pane, olio, e un piccolo vps —
        </div>
      </section>
    </div>
  );
}

function ArchCard({
  bg,
  accent,
  fg = '#2b1a14',
  label,
  value,
  decimal,
  sub
}: {
  bg: string;
  accent: string;
  fg?: string;
  label: string;
  value: string;
  decimal: string;
  sub: string;
}) {
  return (
    <div
      className="pt-8 pb-7 px-7"
      style={{
        background: bg,
        color: fg,
        borderRadius: '200px 200px 24px 24px',
        border: '1.5px solid rgba(43,26,20,0.15)',
        boxShadow: '0 18px 44px -20px rgba(43,26,20,0.4)'
      }}
    >
      <div
        className="text-center text-[11px] tracking-[0.35em] uppercase font-bold opacity-75"
      >
        {label}
      </div>
      <div className="text-center mt-3">
        <span
          className="tabular-nums"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: 'clamp(48px, 6vw, 72px)',
            letterSpacing: '-0.03em',
            color: accent
          }}
        >
          {value}
        </span>
        {decimal && (
          <span
            className="tabular-nums opacity-60"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '28px'
            }}
          >
            {decimal}
          </span>
        )}
      </div>
      <div className="text-center text-sm opacity-75 mt-1 font-medium">{sub}</div>
    </div>
  );
}

function PillButton({
  children,
  bg,
  fg,
  border
}: {
  children: React.ReactNode;
  bg: string;
  fg: string;
  border?: string;
}) {
  return (
    <button
      className="px-7 py-3 text-[14px] transition hover:-translate-y-0.5"
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        background: bg,
        color: fg,
        border: border ? `1.5px solid ${border}` : 'none',
        borderRadius: '999px'
      }}
    >
      {children}
    </button>
  );
}

function Flourish({
  className = '',
  flip,
  vflip
}: {
  className?: string;
  flip?: boolean;
  vflip?: boolean;
}) {
  const sx = flip ? -1 : 1;
  const sy = vflip ? -1 : 1;
  return (
    <svg
      className={`absolute w-10 h-10 opacity-50 pointer-events-none ${className}`}
      viewBox="0 0 40 40"
      fill="none"
      style={{ transform: `scale(${sx}, ${sy})` }}
    >
      <path
        d="M5 5 Q 18 5 18 18 Q 5 18 5 5 M 18 18 Q 24 24 32 24"
        stroke="#c85a3b"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="32" cy="24" r="2" fill="#c85a3b" />
    </svg>
  );
}
