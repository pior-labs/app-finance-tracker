import { useEffect, useState } from 'react';
import { DesignSwitcher } from '@/components/DesignSwitcher';

const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const cats = [
  { k: 'GROC', name: 'GROCERIES',     amt: 842.17, bar: 22 },
  { k: 'TRVL', name: 'TRAVEL',        amt: 620.40, bar: 16 },
  { k: 'DINE', name: 'DINING_OUT',    amt: 521.88, bar: 13 },
  { k: 'SHOP', name: 'SHOPPING',      amt: 412.00, bar: 10 },
  { k: 'TRNS', name: 'TRANSPORT',     amt: 287.33, bar: 7 },
  { k: 'UTIL', name: 'UTILITIES',     amt: 245.12, bar: 6 },
  { k: 'HLTH', name: 'HEALTH',        amt: 184.50, bar: 5 },
  { k: 'SUBS', name: 'SUBSCRIPTIONS', amt: 178.49, bar: 4 }
];

const txs = [
  { d: '2026-03-28', desc: 'BI-RITE MARKET',           cat: 'GROC', amt: -42.18, s: 'OK',   c: 0.98 },
  { d: '2026-03-27', desc: 'ALASKA AIR ANC-SFO',       cat: 'TRVL', amt: -318.40, s: 'OK',   c: 0.95 },
  { d: '2026-03-26', desc: 'TARTINE BAKERY',           cat: 'DINE', amt: -23.50, s: 'OK',   c: 0.93 },
  { d: '2026-03-25', desc: 'SFMTA CLIPPER AUTOLOAD',   cat: 'TRNS', amt: -60.00, s: 'OK',   c: 0.99 },
  { d: '2026-03-25', desc: 'NETFLIX.COM',              cat: 'SUBS', amt: -15.49, s: 'OK',   c: 0.99 },
  { d: '2026-03-24', desc: 'EMPLOYER DIR DEP',         cat: '----', amt: 4280.00, s: 'IN',   c: 1.00 },
  { d: '2026-03-23', desc: 'UNKNOWN MERCHANT 4821',    cat: '????', amt: -84.20, s: 'RVW',  c: 0.42 },
  { d: '2026-03-22', desc: 'BLUE BOTTLE 3RD ST',       cat: 'DINE', amt: -6.75, s: 'OK',   c: 0.96 }
];

export function DesignTwo() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);
  const cursor = tick % 2 === 0 ? '█' : ' ';

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#0a0a0a',
        color: '#e6e6e6',
        fontFamily: mono,
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0 1px, transparent 1px 3px)'
      }}
    >
      <DesignSwitcher tone="dark" />

      {/* Top bar */}
      <header className="border-b border-white/20 px-6 py-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-4">
          <span style={{ color: '#b3ff4a' }}>●</span>
          <span className="tracking-widest">FINLENS//TERM</span>
          <span className="opacity-60">v0.1.0</span>
        </div>
        <div className="hidden md:flex items-center gap-6 opacity-70">
          <span>USER: pior@finlens</span>
          <span>SHELL: /bin/finlens</span>
          <span>TZ: PST</span>
          <span style={{ color: '#b3ff4a' }}>READY</span>
        </div>
      </header>

      {/* Ticker strip */}
      <div
        className="border-b border-white/20 overflow-hidden whitespace-nowrap py-1 text-[11px]"
        style={{ color: '#ffb020' }}
      >
        <div
          className="inline-block"
          style={{
            animation: 'fl-ticker 40s linear infinite',
            paddingLeft: '100%'
          }}
        >
          MAR 2026 &nbsp; · &nbsp; OUTFLOW $3,847.52 &nbsp; · &nbsp; INFLOW $4,280.00 &nbsp; · &nbsp; NET +$432.48 &nbsp; · &nbsp; VS FEB −6.8% &nbsp; · &nbsp; CAT_AUTO 141/148 &nbsp; · &nbsp; REVIEW_Q 7 &nbsp; · &nbsp; SUBS 12 ACTIVE &nbsp; · &nbsp; API_COST $0.42 &nbsp; · &nbsp; STATUS NOMINAL &nbsp;
        </div>
        <style>{`@keyframes fl-ticker { from { transform: translateX(0); } to { transform: translateX(-100%); } }`}</style>
      </div>

      {/* Command prompt hero */}
      <section className="px-6 md:px-10 pt-10 pb-6">
        <div className="text-[11px] opacity-50 tracking-widest mb-2">
          $ finlens summary --month=2026-03 --fmt=ascii
        </div>
        <div
          className="text-[56px] md:text-[96px] font-bold leading-none"
          style={{ letterSpacing: '-0.04em' }}
        >
          <span className="opacity-40">$</span>
          <span>3,847</span>
          <span style={{ color: '#b3ff4a' }}>.52</span>
          <span style={{ color: '#b3ff4a' }}>{cursor}</span>
        </div>
        <div className="mt-3 text-[12px] opacity-70 tracking-wider">
          // OUTFLOW · MARCH 2026 · 148 TX · −6.8% VS FEBRUARY
        </div>
      </section>

      {/* ASCII boxes */}
      <section className="px-6 md:px-10 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category bar chart */}
        <div className="lg:col-span-8 border border-white/30 p-5">
          <div className="flex items-center justify-between text-[11px] opacity-70 tracking-widest mb-4">
            <span>┌─ CATEGORIES.TABLE ───────────────────</span>
            <span>rows=8</span>
          </div>
          <div className="grid gap-2 text-[12px]">
            {cats.map((c) => (
              <div key={c.k} className="flex items-center gap-3">
                <span className="w-14 opacity-60">[{c.k}]</span>
                <span className="w-36">{c.name}</span>
                <span
                  className="flex-1 whitespace-nowrap overflow-hidden"
                  style={{ color: '#b3ff4a' }}
                >
                  {'█'.repeat(c.bar)}
                  <span className="opacity-20">
                    {'░'.repeat(30 - c.bar)}
                  </span>
                </span>
                <span className="w-10 text-right opacity-70">{c.bar}%</span>
                <span className="w-24 text-right tabular-nums">
                  ${c.amt.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status panel */}
        <div className="lg:col-span-4 border border-white/30 p-5 text-[12px]">
          <div className="text-[11px] opacity-70 tracking-widest mb-4">
            ┌─ SYSTEM.STATUS ──────
          </div>
          <div className="grid gap-2">
            <Row label="DB" value="SQLITE · 4.2MB" />
            <Row label="VECTORS" value="QDRANT · 1,284 pts" />
            <Row label="PARSER" value="OK · 2 fmt" />
            <Row label="AUTO_CAT" value="141/148" hl />
            <Row label="REVIEW_Q" value="7 items" warn />
            <Row label="LLM" value="HAIKU · $0.42/mo" />
            <Row label="UPTIME" value="14d 02h 41m" />
          </div>
          <div className="mt-5 pt-5 border-t border-white/20 text-[11px] opacity-70 leading-relaxed">
            tip: run <span style={{ color: '#b3ff4a' }}>finlens review</span>{' '}
            to clear the queue.
          </div>
          <div className="mt-5 flex gap-2">
            <button
              className="flex-1 border px-3 py-2 text-[11px] tracking-widest transition hover:bg-white hover:text-black"
              style={{ borderColor: '#b3ff4a', color: '#b3ff4a' }}
            >
              ▲ UPLOAD.PDF
            </button>
            <button className="flex-1 border border-white/40 px-3 py-2 text-[11px] tracking-widest transition hover:bg-white hover:text-black">
              ⌘ REVIEW
            </button>
          </div>
        </div>
      </section>

      {/* Transaction log */}
      <section className="px-6 md:px-10 pb-16">
        <div className="border border-white/30">
          <div className="flex items-center justify-between border-b border-white/30 px-4 py-2 text-[11px] tracking-widest">
            <span>┌─ TX.LOG ─ LAST 8 ─────────────</span>
            <span className="opacity-70">SORT: DATE DESC</span>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] opacity-60 tracking-widest">
                <Th>DATE</Th>
                <Th>DESCRIPTION</Th>
                <Th>CAT</Th>
                <Th className="text-right">CONF</Th>
                <Th className="text-right">AMOUNT</Th>
                <Th className="text-right">STATUS</Th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t, i) => (
                <tr
                  key={i}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <Td className="opacity-70">{t.d}</Td>
                  <Td className="font-medium">{t.desc}</Td>
                  <Td className="opacity-80">{t.cat}</Td>
                  <Td
                    className="text-right tabular-nums"
                    style={{
                      color: t.c < 0.85 ? '#ffb020' : undefined
                    }}
                  >
                    {(t.c * 100).toFixed(0)}%
                  </Td>
                  <Td
                    className="text-right tabular-nums"
                    style={{
                      color: t.amt > 0 ? '#b3ff4a' : undefined
                    }}
                  >
                    {t.amt > 0 ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                  </Td>
                  <Td className="text-right">
                    <span
                      className="inline-block px-2 py-0.5 text-[10px]"
                      style={{
                        color:
                          t.s === 'RVW'
                            ? '#ffb020'
                            : t.s === 'IN'
                            ? '#b3ff4a'
                            : '#e6e6e6',
                        border: `1px solid ${
                          t.s === 'RVW'
                            ? '#ffb020'
                            : t.s === 'IN'
                            ? '#b3ff4a'
                            : '#ffffff30'
                        }`
                      }}
                    >
                      {t.s}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-white/30 px-4 py-2 text-[11px] opacity-60 flex items-center justify-between">
            <span>└──────────────────────────────</span>
            <span>
              PAGE 1/19 · [←/→ navigate] · [r] review · [u] upload · [q] quit
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, hl, warn }: { label: string; value: string; hl?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="opacity-60 tracking-widest text-[11px]">{label}</span>
      <span
        className="tabular-nums"
        style={{ color: warn ? '#ffb020' : hl ? '#b3ff4a' : undefined }}
      >
        {value}
      </span>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 font-normal ${className}`}>{children}</th>;
}
function Td({
  children,
  className = '',
  style
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={`px-4 py-2 ${className}`} style={style}>
      {children}
    </td>
  );
}
