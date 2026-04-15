import { DesignSwitcher } from '@/components/DesignSwitcher';

const display = "'Fraunces', 'Times New Roman', serif";
const body = "'Plus Jakarta Sans', system-ui, sans-serif";

const p = {
  ink: '#3a2b3a',
  inkSoft: '#5a4a5a',
  peach: '#ffd9c4',
  coral: '#ff9e7d',
  lavender: '#e0d3f2',
  purple: '#9a7bc6',
  mint: '#cfe9d6',
  rose: '#f7c8d4',
  butter: '#fae7b8'
};

const cats = [
  { name: 'Groceries',  amt: 842.17, from: '#cfe9d6', to: '#9bd1a6', emoji: '◐' },
  { name: 'Travel',     amt: 620.40, from: '#e0d3f2', to: '#b69bd9', emoji: '◓' },
  { name: 'Dining',     amt: 521.88, from: '#ffd9c4', to: '#ff9e7d', emoji: '◑' },
  { name: 'Shopping',   amt: 412.00, from: '#f7c8d4', to: '#ee8aa0', emoji: '◒' },
  { name: 'Transport',  amt: 287.33, from: '#fae7b8', to: '#e8c574', emoji: '◐' },
  { name: 'Subs',       amt: 178.49, from: '#cde4f0', to: '#89b9cf', emoji: '◓' }
];

const recent = [
  { d: 'Mar 28', desc: 'Bi-Rite',         cat: 'Groceries',  amt: -42.18 },
  { d: 'Mar 27', desc: 'Alaska Air',      cat: 'Travel',     amt: -318.40 },
  { d: 'Mar 26', desc: 'Tartine',         cat: 'Dining',     amt: -23.50 },
  { d: 'Mar 25', desc: 'Clipper',         cat: 'Transport',  amt: -60.00 },
  { d: 'Mar 24', desc: 'Payday',          cat: 'Income',     amt:  4280.00 }
];

export function DesignNine() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          'linear-gradient(140deg, #ffe3d0 0%, #f8d5e3 35%, #e7d8f4 70%, #d5e9f0 100%)',
        color: p.ink,
        fontFamily: body
      }}
    >
      <DesignSwitcher tone="light" />

      {/* Floating pastel orbs */}
      <div
        className="pointer-events-none fixed -top-40 -right-40 size-[620px] rounded-full blur-3xl opacity-70"
        style={{ background: p.coral }}
      />
      <div
        className="pointer-events-none fixed top-1/3 -left-40 size-[520px] rounded-full blur-3xl opacity-60"
        style={{ background: p.lavender }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-1/4 size-[420px] rounded-full blur-3xl opacity-50"
        style={{ background: p.mint }}
      />

      {/* Nav */}
      <header className="relative flex items-center justify-between px-6 md:px-14 pt-7">
        <div
          className="flex items-center gap-3 px-5 py-2.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.7)'
          }}
        >
          <div
            className="size-7 rounded-full"
            style={{
              background: `conic-gradient(from 45deg, ${p.coral}, ${p.purple}, ${p.mint}, ${p.coral})`
            }}
          />
          <span
            className="text-xl"
            style={{
              fontFamily: display,
              fontWeight: 600,
              fontStyle: 'italic',
              letterSpacing: '-0.01em'
            }}
          >
            finlens
          </span>
        </div>

        <nav
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.7)'
          }}
        >
          {['Home', 'Spend', 'Review', 'Upload'].map((t, i) => (
            <a
              key={t}
              className="px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition"
              style={{
                background: i === 0 ? p.ink : 'transparent',
                color: i === 0 ? '#fff6ea' : p.ink
              }}
            >
              {t}
            </a>
          ))}
        </nav>

        <div
          className="size-11 rounded-full overflow-hidden border-2"
          style={{
            borderColor: 'rgba(255,255,255,0.8)',
            background: `linear-gradient(135deg, ${p.coral}, ${p.purple})`,
            boxShadow: '0 6px 20px -6px rgba(154,123,198,0.5)'
          }}
        />
      </header>

      {/* Hero */}
      <section className="relative px-6 md:px-14 pt-10 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.7)'
            }}
          >
            <span className="size-1.5 rounded-full animate-pulse" style={{ background: p.coral }} />
            Sunday morning · March 29
          </div>
          <h1
            className="leading-[0.95]"
            style={{
              fontFamily: display,
              fontSize: 'clamp(60px, 10vw, 148px)',
              fontWeight: 600,
              letterSpacing: '-0.035em'
            }}
          >
            a soft
            <br />
            <span
              style={{
                background: `linear-gradient(120deg, ${p.coral}, ${p.purple} 60%, #5a4a5a)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontStyle: 'italic',
                fontWeight: 400
              }}
            >
              landing.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed max-w-xl" style={{ color: p.inkSoft }}>
            March came in at <b>$3,847.52</b> — six-point-eight percent under
            February. You breathed out. The garden is fine. The coffee is at
            home. Let's peek at the numbers.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <GlassButton primary>Upload March statement</GlassButton>
            <GlassButton>Review · 7 ✧</GlassButton>
          </div>
        </div>

        {/* Giant soft bubble */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div
            className="relative rounded-full flex items-center justify-center"
            style={{
              width: 'min(420px, 88vw)',
              aspectRatio: '1',
              background:
                'conic-gradient(from 220deg, #ff9e7d, #ee8aa0, #b69bd9, #89b9cf, #9bd1a6, #ff9e7d)',
              filter: 'blur(0.3px)',
              boxShadow:
                '0 30px 80px -20px rgba(154,123,198,0.55), inset 0 0 80px rgba(255,255,255,0.35)'
            }}
          >
            <div
              className="absolute rounded-full flex flex-col items-center justify-center text-center"
              style={{
                inset: '18px',
                background:
                  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.55) 60%, rgba(255,255,255,0.3))',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
                border: '1px solid rgba(255,255,255,0.7)'
              }}
            >
              <div
                className="text-[11px] tracking-[0.3em] uppercase font-bold"
                style={{ color: p.inkSoft }}
              >
                spent · march
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: display,
                  fontSize: 'clamp(56px, 8vw, 88px)',
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  marginTop: 6
                }}
              >
                $3,847
              </div>
              <div
                className="mt-1 text-sm font-semibold"
                style={{ color: p.purple }}
              >
                ↓ 6.8% vs. February · saved $280
              </div>

              {/* Small gradient pill */}
              <div
                className="mt-6 px-4 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: `linear-gradient(90deg, ${p.coral}, ${p.purple})`,
                  color: 'white'
                }}
              >
                148 transactions · 95% auto
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — gradient bubble cards */}
      <section className="relative px-6 md:px-14 pb-12">
        <div className="flex items-end justify-between mb-6">
          <h2
            className="text-4xl md:text-5xl"
            style={{
              fontFamily: display,
              fontWeight: 600,
              letterSpacing: '-0.025em'
            }}
          >
            <em style={{ fontWeight: 400 }}>where</em> the month went
          </h2>
          <div className="text-sm font-semibold opacity-60">six biggest</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {cats.map((cat) => {
            const pct = (cat.amt / 842.17) * 100;
            return (
              <div
                key={cat.name}
                className="relative p-6 overflow-hidden transition hover:-translate-y-1 cursor-pointer"
                style={{
                  borderRadius: '36px',
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.7)',
                  boxShadow: '0 16px 48px -20px rgba(90,74,90,0.3)'
                }}
              >
                {/* bubble */}
                <div
                  className="absolute -top-6 -right-6 size-28 rounded-full blur-xl opacity-80"
                  style={{
                    background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`
                  }}
                />
                <div
                  className="size-12 rounded-full flex items-center justify-center text-xl relative"
                  style={{
                    background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`,
                    color: p.ink,
                    boxShadow: `0 10px 24px -10px ${cat.to}99`
                  }}
                >
                  {cat.emoji}
                </div>
                <div className="text-sm font-bold mt-5 opacity-70 uppercase tracking-widest">
                  {cat.name}
                </div>
                <div
                  className="text-4xl tabular-nums mt-1"
                  style={{
                    fontFamily: display,
                    fontWeight: 600,
                    letterSpacing: '-0.025em'
                  }}
                >
                  ${Math.floor(cat.amt)}
                  <span className="text-base opacity-50">
                    .{cat.amt.toFixed(2).split('.')[1]}
                  </span>
                </div>

                <div
                  className="relative mt-5 h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(58,43,58,0.08)' }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${cat.from}, ${cat.to})`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent */}
      <section className="relative px-6 md:px-14 pb-20">
        <div
          className="overflow-hidden"
          style={{
            borderRadius: '44px',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: '0 24px 60px -24px rgba(90,74,90,0.3)'
          }}
        >
          <div
            className="px-8 py-5 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(58,43,58,0.08)' }}
          >
            <h2
              className="text-3xl"
              style={{
                fontFamily: display,
                fontWeight: 600,
                letterSpacing: '-0.02em'
              }}
            >
              <em style={{ fontWeight: 400 }}>tender</em> moments
            </h2>
            <a className="text-sm font-semibold cursor-pointer" style={{ color: p.purple }}>
              see all 148 →
            </a>
          </div>

          <ul>
            {recent.map((t, i) => (
              <li
                key={i}
                className="flex items-center gap-5 px-8 py-5 transition hover:bg-white/30"
                style={{ borderBottom: i < recent.length - 1 ? '1px solid rgba(58,43,58,0.06)' : 'none' }}
              >
                <div
                  className="size-11 rounded-full shrink-0"
                  style={{
                    background:
                      t.amt > 0
                        ? 'linear-gradient(135deg, #cfe9d6, #9bd1a6)'
                        : i % 2
                        ? 'linear-gradient(135deg, #ffd9c4, #ff9e7d)'
                        : 'linear-gradient(135deg, #e0d3f2, #b69bd9)'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xl truncate"
                    style={{ fontFamily: display, fontWeight: 600, letterSpacing: '-0.01em' }}
                  >
                    {t.desc}
                  </div>
                  <div className="text-xs uppercase tracking-widest font-semibold opacity-55 mt-0.5">
                    {t.d} · {t.cat}
                  </div>
                </div>
                <div
                  className="text-2xl tabular-nums"
                  style={{
                    fontFamily: display,
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: t.amt > 0 ? '#6a9a78' : p.ink
                  }}
                >
                  {t.amt > 0 ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <div
            className="m-5 p-5 flex items-center gap-4 rounded-[28px]"
            style={{
              background: `linear-gradient(120deg, ${p.coral}, ${p.purple})`,
              color: '#fff6ea'
            }}
          >
            <div
              className="size-10 rounded-full flex items-center justify-center text-lg bg-white/30"
            >
              ✧
            </div>
            <div className="flex-1 text-sm leading-relaxed">
              Seven transactions have low confidence and are waiting for your
              eye. Two minutes of tending teaches the system forever.
            </div>
            <button
              className="px-5 py-2 rounded-full text-sm font-bold shrink-0"
              style={{ background: '#fff6ea', color: p.ink }}
            >
              Review
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function GlassButton({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      className="px-6 py-3 text-[15px] font-bold transition hover:-translate-y-0.5"
      style={{
        borderRadius: '999px',
        background: primary
          ? 'linear-gradient(120deg, #ff9e7d, #b69bd9)'
          : 'rgba(255,255,255,0.55)',
        backdropFilter: primary ? undefined : 'blur(18px)',
        WebkitBackdropFilter: primary ? undefined : 'blur(18px)',
        color: primary ? '#fff6ea' : '#3a2b3a',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.7)',
        boxShadow: primary
          ? '0 12px 30px -10px rgba(182,155,217,0.55)'
          : '0 8px 22px -10px rgba(90,74,90,0.25)'
      }}
    >
      {children}
    </button>
  );
}
