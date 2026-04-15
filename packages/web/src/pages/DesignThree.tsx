import { DesignSwitcher } from '@/components/DesignSwitcher';

const display = "'Bricolage Grotesque', system-ui, sans-serif";
const body = "'Manrope', system-ui, sans-serif";

// A warm, earthy palette — clay, sage, honey, plum, cream.
const palette = {
  cream: '#f6efe4',
  cream2: '#efe4d1',
  ink: '#2a2018',
  clay: '#c25a3c',
  honey: '#e8a24a',
  sage: '#7a9a7a',
  plum: '#6b3d5f',
  sky: '#a8c5d1'
};

const cats = [
  { name: 'Groceries',     amt: 842.17, color: palette.sage,  emoji: '🌿' },
  { name: 'Travel',        amt: 620.40, color: palette.sky,   emoji: '✈' },
  { name: 'Dining Out',    amt: 521.88, color: palette.clay,  emoji: '🍽' },
  { name: 'Shopping',      amt: 412.00, color: palette.plum,  emoji: '✿' },
  { name: 'Transport',     amt: 287.33, color: palette.honey, emoji: '◐' },
  { name: 'Utilities',     amt: 245.12, color: '#8b7a66',     emoji: '⌂' },
  { name: 'Health',        amt: 184.50, color: '#a67a9a',     emoji: '♡' },
  { name: 'Subscriptions', amt: 178.49, color: '#b9a27e',     emoji: '↻' }
];

const txs = [
  { d: 'Sat 28', desc: 'Bi-Rite Market',       cat: 'Groceries',  amt: -42.18, emoji: '🌿' },
  { d: 'Fri 27', desc: 'Alaska Air to Portland', cat: 'Travel',  amt: -318.40, emoji: '✈' },
  { d: 'Thu 26', desc: 'Tartine Bakery',        cat: 'Dining Out', amt: -23.50, emoji: '🍽' },
  { d: 'Wed 25', desc: 'Clipper Autoload',      cat: 'Transport',  amt: -60.00, emoji: '◐' },
  { d: 'Tue 24', desc: 'Payday',                cat: 'Income',     amt:  4280.00, emoji: '✧' }
];

export function DesignThree() {
  const total = 3847.52;
  const prev = 4128.41;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at 15% 10%, ${palette.honey}40, transparent 45%),
                     radial-gradient(circle at 90% 0%, ${palette.clay}30, transparent 40%),
                     radial-gradient(circle at 80% 90%, ${palette.sage}30, transparent 45%),
                     ${palette.cream}`,
        color: palette.ink,
        fontFamily: body
      }}
    >
      {/* Subtle grain */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }}
      />

      <DesignSwitcher tone="light" />

      {/* Top nav */}
      <nav className="relative flex items-center justify-between px-8 md:px-14 pt-8">
        <div className="flex items-center gap-2">
          <div
            className="size-9 rounded-full flex items-center justify-center"
            style={{ background: palette.ink, color: palette.cream }}
          >
            <span className="text-lg">✦</span>
          </div>
          <span
            className="text-2xl"
            style={{ fontFamily: display, fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            finlens
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a className="opacity-70 hover:opacity-100 transition">Dashboard</a>
          <a className="opacity-70 hover:opacity-100 transition">Transactions</a>
          <a className="opacity-70 hover:opacity-100 transition">Categories</a>
          <a className="opacity-70 hover:opacity-100 transition">Review · 7</a>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="size-9 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
            style={{ borderColor: palette.ink, background: palette.honey }}
          >
            P
          </div>
          <div
            className="size-9 -ml-3 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
            style={{ borderColor: palette.ink, background: palette.clay, color: palette.cream }}
          >
            M
          </div>
        </div>
      </nav>

      {/* Hero — a quiet moment */}
      <section className="relative px-8 md:px-14 pt-14 pb-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-7">
          <div
            className="text-sm tracking-[0.2em] uppercase opacity-60 mb-4"
            style={{ fontFamily: display }}
          >
            Good morning · Sunday, March 29
          </div>
          <h1
            className="leading-[0.95] font-extrabold"
            style={{
              fontFamily: display,
              fontSize: 'clamp(52px, 8vw, 112px)',
              letterSpacing: '-0.035em'
            }}
          >
            Together you spent{' '}
            <span style={{ color: palette.clay }}>$3,847</span>
            <span style={{ color: palette.clay }}>.</span>
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>
              {' '}
              a little less than last month.
            </span>
          </h1>
          <p className="mt-6 text-lg opacity-75 max-w-xl leading-relaxed">
            That’s <b>$280.89</b> saved versus February — about one good dinner
            out, or half a tank of road-trip gas. The rhythm is steady. Keep
            going.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="px-6 py-3 rounded-full text-[15px] font-semibold transition hover:-translate-y-0.5"
              style={{ background: palette.ink, color: palette.cream }}
            >
              Upload March statement
            </button>
            <button
              className="px-6 py-3 rounded-full text-[15px] font-semibold border-2 transition hover:-translate-y-0.5"
              style={{ borderColor: palette.ink, color: palette.ink }}
            >
              7 items to review →
            </button>
          </div>
        </div>

        {/* Breathing circle stat */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div
            className="relative rounded-full flex items-center justify-center"
            style={{
              width: 'min(360px, 80vw)',
              aspectRatio: '1',
              background: `radial-gradient(circle at 30% 30%, ${palette.honey}, ${palette.clay})`,
              boxShadow: '0 30px 80px -20px rgba(194,90,60,0.45)'
            }}
          >
            <div className="text-center" style={{ color: palette.cream }}>
              <div className="text-[11px] tracking-[0.3em] uppercase opacity-80">
                spent vs. Feb
              </div>
              <div
                className="text-7xl font-black my-1"
                style={{ fontFamily: display, letterSpacing: '-0.03em' }}
              >
                −6.8%
              </div>
              <div className="text-sm opacity-90">
                ${prev.toFixed(2)} → ${total.toFixed(2)}
              </div>
            </div>
            <div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: `${palette.cream}40`, inset: '14px' }}
            />
          </div>
        </div>
      </section>

      {/* Categories as soft chips */}
      <section className="relative px-8 md:px-14 pb-12">
        <div className="flex items-end justify-between mb-6">
          <h2
            className="text-3xl font-extrabold"
            style={{ fontFamily: display, letterSpacing: '-0.02em' }}
          >
            Where it went
          </h2>
          <div className="text-sm opacity-60">March 1 – 29</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.map((c, i) => (
            <div
              key={c.name}
              className="relative rounded-[28px] p-5 transition hover:-translate-y-1 cursor-pointer"
              style={{
                background: palette.cream2,
                border: `1.5px solid ${palette.ink}18`,
                boxShadow: '0 2px 0 rgba(42,32,24,0.06)',
                transform: i % 2 ? 'rotate(-0.4deg)' : 'rotate(0.3deg)'
              }}
            >
              <div
                className="size-10 rounded-full flex items-center justify-center text-lg mb-4"
                style={{ background: c.color, color: palette.cream }}
              >
                {c.emoji}
              </div>
              <div className="text-sm opacity-60">{c.name}</div>
              <div
                className="text-3xl font-extrabold tabular-nums"
                style={{ fontFamily: display, letterSpacing: '-0.02em' }}
              >
                ${Math.floor(c.amt)}
                <span className="text-base opacity-60">
                  .{c.amt.toFixed(2).split('.')[1]}
                </span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(c.amt / 842.17) * 100}%`,
                    background: c.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journal-style activity */}
      <section className="relative px-8 md:px-14 pb-20">
        <div
          className="rounded-[32px] p-8 md:p-10"
          style={{
            background: palette.cream2,
            border: `1.5px solid ${palette.ink}15`
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-3xl font-extrabold"
              style={{ fontFamily: display, letterSpacing: '-0.02em' }}
            >
              Lately
            </h2>
            <button className="text-sm underline underline-offset-4 opacity-70 hover:opacity-100">
              See all 148 →
            </button>
          </div>

          <div className="divide-y divide-black/10">
            {txs.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-4 hover:bg-black/[0.02] transition px-2 -mx-2 rounded-xl cursor-pointer"
              >
                <div
                  className="size-11 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background:
                      t.amt > 0 ? palette.sage : palette.cream,
                    color: t.amt > 0 ? palette.cream : palette.ink,
                    border: t.amt > 0 ? 'none' : `1.5px solid ${palette.ink}25`
                  }}
                >
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{t.desc}</div>
                  <div className="text-xs opacity-60 mt-0.5">
                    {t.cat} · {t.d}
                  </div>
                </div>
                <div
                  className="text-xl font-bold tabular-nums"
                  style={{
                    fontFamily: display,
                    color: t.amt > 0 ? palette.sage : palette.ink
                  }}
                >
                  {t.amt > 0 ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-8 p-5 rounded-2xl flex items-center gap-4"
            style={{ background: palette.ink, color: palette.cream }}
          >
            <div
              className="size-10 rounded-full flex items-center justify-center"
              style={{ background: palette.honey, color: palette.ink }}
            >
              ✦
            </div>
            <div className="flex-1 text-sm leading-relaxed">
              <b>7 transactions</b> are waiting for your eye — low confidence
              from the categorizer. A two-minute review keeps the system learning.
            </div>
            <button
              className="px-4 py-2 rounded-full text-sm font-semibold shrink-0"
              style={{ background: palette.cream, color: palette.ink }}
            >
              Review
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
