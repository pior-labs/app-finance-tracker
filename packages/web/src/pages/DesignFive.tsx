import { DesignSwitcher } from '@/components/DesignSwitcher';

const display = "'Unbounded', system-ui, sans-serif";
const body = "'Instrument Sans', system-ui, sans-serif";

const cats = [
  { name: 'Groceries',     amt: 842.17, bg: '#c4f542', fg: '#0a0a0a', rot: '-1.5deg' },
  { name: 'Travel',        amt: 620.40, bg: '#ff4fd8', fg: '#0a0a0a', rot: '1.2deg' },
  { name: 'Dining',        amt: 521.88, bg: '#ff8a3d', fg: '#0a0a0a', rot: '-0.8deg' },
  { name: 'Shopping',      amt: 412.00, bg: '#6c5bff', fg: '#f9f5e7', rot: '1.8deg' },
  { name: 'Transport',     amt: 287.33, bg: '#f9f5e7', fg: '#0a0a0a', rot: '-1deg' },
  { name: 'Utilities',     amt: 245.12, bg: '#0a0a0a', fg: '#c4f542', rot: '1.5deg' },
  { name: 'Health',        amt: 184.50, bg: '#ffe14a', fg: '#0a0a0a', rot: '-1.2deg' },
  { name: 'Subs',          amt: 178.49, bg: '#2aa7ff', fg: '#f9f5e7', rot: '0.8deg' }
];

const txs = [
  { d: '03/28', desc: 'Bi-Rite Market', cat: 'Groceries',  amt: -42.18, vibe: '🥑', conf: 98 },
  { d: '03/27', desc: 'Alaska Airlines', cat: 'Travel',     amt: -318.40, vibe: '✈', conf: 95 },
  { d: '03/26', desc: 'Tartine',        cat: 'Dining',     amt: -23.50, vibe: '🥐', conf: 93 },
  { d: '03/25', desc: 'Clipper',        cat: 'Transport',  amt: -60.00, vibe: '🚆', conf: 99 },
  { d: '03/24', desc: 'PAYDAY',         cat: 'Income',     amt:  4280.00, vibe: '💸', conf: 100 },
  { d: '03/23', desc: 'Unknown 4821',   cat: 'REVIEW',     amt: -84.20, vibe: '❔', conf: 42 }
];

export function DesignFive() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: '#f9f5e7',
        color: '#0a0a0a',
        fontFamily: body
      }}
    >
      <DesignSwitcher tone="light" />

      {/* Background shapes */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 size-[520px] rounded-full blur-3xl opacity-60"
        style={{ background: '#ff4fd8' }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 size-[620px] rounded-full blur-3xl opacity-50"
        style={{ background: '#c4f542' }}
      />
      <div
        className="pointer-events-none fixed top-1/3 right-1/4 size-[360px] rounded-full blur-3xl opacity-40"
        style={{ background: '#6c5bff' }}
      />

      {/* Marquee bar */}
      <div
        className="relative overflow-hidden whitespace-nowrap border-b-[3px] border-black py-2 text-[13px] font-bold"
        style={{ background: '#0a0a0a', color: '#c4f542' }}
      >
        <div
          className="inline-block uppercase tracking-[0.2em]"
          style={{
            animation: 'fl5-marquee 30s linear infinite',
            paddingLeft: '100%'
          }}
        >
          ★ march mvp ★ you saved 6.8% ★ grocery game strong ★ 12 subs need a vibe check ★ portland was worth it ★ review 7 mystery txns ★ ai cost this month: $0.42 ★
        </div>
        <style>{`@keyframes fl5-marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }`}</style>
      </div>

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div
            className="size-11 border-[3px] border-black flex items-center justify-center rotate-[-6deg]"
            style={{
              background: '#ff4fd8',
              boxShadow: '4px 4px 0 #0a0a0a'
            }}
          >
            <span className="text-2xl font-black">F</span>
          </div>
          <div
            className="text-3xl font-black tracking-tight"
            style={{ fontFamily: display }}
          >
            FINLENS
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold border-2 border-black uppercase" style={{ background: '#c4f542' }}>
            v0.1 · mvp
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm font-semibold">
          {['Home', 'Upload', 'Txns', 'Cats'].map((x, i) => (
            <a
              key={x}
              className="px-3 py-1.5 border-2 border-black rounded-full cursor-pointer transition hover:-translate-y-0.5"
              style={{
                background: i === 0 ? '#0a0a0a' : '#f9f5e7',
                color: i === 0 ? '#c4f542' : '#0a0a0a',
                boxShadow: '3px 3px 0 #0a0a0a'
              }}
            >
              {x}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-6 pb-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="inline-flex items-center gap-2 mb-6 text-[11px] font-bold uppercase tracking-[0.25em]">
            <span className="size-2 rounded-full animate-pulse" style={{ background: '#ff4fd8' }} />
            march 2026 · wrap
          </div>
          <h1
            className="leading-[0.88] font-black uppercase"
            style={{
              fontFamily: display,
              fontSize: 'clamp(64px, 11vw, 180px)',
              letterSpacing: '-0.04em'
            }}
          >
            <span>you spent</span>
            <br />
            <span
              className="inline-block px-4 rotate-[-1.5deg]"
              style={{
                background: '#ff4fd8',
                color: '#0a0a0a',
                boxShadow: '8px 8px 0 #0a0a0a',
                border: '4px solid #0a0a0a'
              }}
            >
              $3,847
            </span>
            <br />
            <span
              className="italic font-normal"
              style={{ fontFamily: body }}
            >
              on being alive.
            </span>
          </h1>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              className="px-6 py-3 text-[15px] font-black uppercase tracking-wider border-[3px] border-black rounded-full transition hover:-translate-y-1"
              style={{
                background: '#c4f542',
                boxShadow: '6px 6px 0 #0a0a0a'
              }}
            >
              ↑ drop a pdf
            </button>
            <button
              className="px-6 py-3 text-[15px] font-black uppercase tracking-wider border-[3px] border-black rounded-full transition hover:-translate-y-1"
              style={{
                background: '#0a0a0a',
                color: '#f9f5e7',
                boxShadow: '6px 6px 0 #ff4fd8'
              }}
            >
              review 7 ✦
            </button>
          </div>
        </div>

        {/* Stat stack */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <StatCard
            label="vs February"
            value="−6.8%"
            sub="$280.89 saved"
            bg="#c4f542"
            rot="-2deg"
          />
          <StatCard
            label="Transactions"
            value="148"
            sub="95% auto-categorized"
            bg="#6c5bff"
            fg="#f9f5e7"
            rot="1.5deg"
          />
          <StatCard
            label="API cost"
            value="$0.42"
            sub="Claude Haiku · all month"
            bg="#ffe14a"
            rot="-1deg"
          />
        </div>
      </section>

      {/* Categories — sticker wall */}
      <section className="relative px-6 md:px-12 pb-14">
        <h2
          className="text-4xl md:text-6xl font-black uppercase mb-8"
          style={{ fontFamily: display, letterSpacing: '-0.03em' }}
        >
          the <span style={{ color: '#ff4fd8' }}>breakdown</span>.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {cats.map((c, i) => (
            <div
              key={c.name}
              className="relative p-5 border-[3px] border-black rounded-2xl transition hover:-translate-y-1 cursor-pointer"
              style={{
                background: c.bg,
                color: c.fg,
                transform: `rotate(${c.rot})`,
                boxShadow: '6px 6px 0 #0a0a0a'
              }}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                #{i + 1}
              </div>
              <div className="text-lg font-black uppercase mt-1">
                {c.name}
              </div>
              <div
                className="text-4xl md:text-5xl font-black tabular-nums mt-2"
                style={{
                  fontFamily: display,
                  letterSpacing: '-0.03em'
                }}
              >
                ${Math.floor(c.amt)}
              </div>
              <div className="text-xs font-semibold opacity-70 mt-1">
                .{c.amt.toFixed(2).split('.')[1]} · {((c.amt / 3847.52) * 100).toFixed(0)}% of spend
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity */}
      <section className="relative px-6 md:px-12 pb-20">
        <div
          className="border-[3px] border-black rounded-3xl overflow-hidden"
          style={{
            background: '#f9f5e7',
            boxShadow: '10px 10px 0 #0a0a0a'
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black"
            style={{ background: '#0a0a0a', color: '#f9f5e7' }}
          >
            <h2
              className="text-2xl font-black uppercase"
              style={{ fontFamily: display }}
            >
              ✦ recent chaos
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest">
              last 6 · march
            </span>
          </div>

          <ul>
            {txs.map((t, i) => {
              const isReview = t.cat === 'REVIEW';
              const isIncome = t.amt > 0;
              return (
                <li
                  key={i}
                  className="flex items-center gap-4 px-6 py-4 border-b-2 border-black/10 transition hover:bg-black/5"
                >
                  <div
                    className="size-12 flex items-center justify-center border-[3px] border-black rounded-xl text-2xl"
                    style={{
                      background: isIncome
                        ? '#c4f542'
                        : isReview
                        ? '#ff4fd8'
                        : '#ffe14a'
                    }}
                  >
                    {t.vibe}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black uppercase tracking-wide truncate">
                      {t.desc}
                    </div>
                    <div className="text-xs opacity-70 mt-0.5 font-semibold">
                      {t.d} · {t.cat} · confidence {t.conf}%
                    </div>
                  </div>
                  {isReview && (
                    <span
                      className="px-2 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-black rounded-full animate-pulse"
                      style={{ background: '#ff4fd8' }}
                    >
                      needs eye
                    </span>
                  )}
                  <div
                    className="text-3xl font-black tabular-nums"
                    style={{
                      fontFamily: display,
                      letterSpacing: '-0.02em',
                      color: isIncome ? '#159947' : '#0a0a0a'
                    }}
                  >
                    {isIncome ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 text-center text-xs font-bold uppercase tracking-[0.3em] opacity-50">
          made with ♡ · for two · on a tiny vps · $0.42/month
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  bg,
  fg = '#0a0a0a',
  rot
}: {
  label: string;
  value: string;
  sub: string;
  bg: string;
  fg?: string;
  rot: string;
}) {
  return (
    <div
      className="p-5 border-[3px] border-black rounded-2xl"
      style={{
        background: bg,
        color: fg,
        transform: `rotate(${rot})`,
        boxShadow: '6px 6px 0 #0a0a0a'
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-80">
        {label}
      </div>
      <div
        className="text-5xl font-black tabular-nums mt-1"
        style={{ fontFamily: "'Unbounded', sans-serif", letterSpacing: '-0.03em' }}
      >
        {value}
      </div>
      <div className="text-xs font-semibold mt-1 opacity-80">{sub}</div>
    </div>
  );
}
