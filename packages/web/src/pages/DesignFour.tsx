import { DesignSwitcher } from '@/components/DesignSwitcher';

const sans = "'IBM Plex Sans', system-ui, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, monospace";

const amber = '#ffb020';
const cyan = '#6ad3ff';
const green = '#4ade80';
const red = '#ff5d6c';
const ink = '#05080f';
const panel = '#0b1120';
const line = '#1b2840';

const cats = [
  { name: 'Groceries',     amt: 842.17, pct: 21.9, d: -2.1, spark: [4,5,3,6,8,7,5,6,4,5,6,7] },
  { name: 'Travel',        amt: 620.40, pct: 16.1, d: +48.2, spark: [1,1,0,2,1,3,2,8,9,7,5,6] },
  { name: 'Dining Out',    amt: 521.88, pct: 13.6, d: -12.4, spark: [6,7,5,4,6,5,4,5,4,5,4,3] },
  { name: 'Shopping',      amt: 412.00, pct: 10.7, d: +3.2, spark: [3,2,4,5,4,6,3,4,5,7,6,4] },
  { name: 'Transport',     amt: 287.33, pct: 7.5, d: -0.8, spark: [4,4,4,5,4,4,5,4,5,4,5,4] },
  { name: 'Utilities',     amt: 245.12, pct: 6.4, d: +1.4, spark: [5,5,6,5,5,6,5,5,6,5,5,6] },
  { name: 'Health',        amt: 184.50, pct: 4.8, d: +22.1, spark: [2,1,2,1,2,3,3,4,5,4,6,7] },
  { name: 'Subscriptions', amt: 178.49, pct: 4.6, d: +8.4, spark: [6,6,6,6,7,7,7,7,8,8,8,8] },
  { name: 'Entertainment', amt:  95.10, pct: 2.5, d: -3.5, spark: [3,4,3,2,3,2,3,2,3,2,3,2] },
  { name: 'Other',         amt: 460.53, pct: 12.0, d: -5.1, spark: [5,6,5,4,5,6,4,5,4,5,4,5] }
];

const txs = [
  ['03-28 14:21', 'BI-RITE MARKET',         'GROC', 0.98, -42.18,  'AUTO'],
  ['03-27 09:02', 'ALASKA AIR 0271',        'TRVL', 0.95, -318.40, 'AUTO'],
  ['03-26 18:47', 'TARTINE BAKERY',         'DINE', 0.93, -23.50,  'AUTO'],
  ['03-25 11:30', 'SFMTA CLIPPER',          'TRNS', 0.99, -60.00,  'AUTO'],
  ['03-25 05:00', 'NETFLIX.COM',            'SUBS', 0.99, -15.49,  'AUTO'],
  ['03-24 09:00', 'EMPLOYER DIR DEP',       '--',   1.00,  4280.00,'IN'  ],
  ['03-23 20:14', 'POS 4821 SQ *UNKNOWN',   '??',   0.42, -84.20,  'RVW' ],
  ['03-22 08:12', 'BLUE BOTTLE 3RD ST',     'DINE', 0.96, -6.75,   'AUTO'],
  ['03-21 19:55', 'SAFEWAY #1234',          'GROC', 0.97, -68.42,  'AUTO'],
  ['03-20 13:03', 'UBER *TRIP',             'TRNS', 0.91, -18.45,  'AUTO'],
  ['03-19 22:01', 'SPOTIFY USA',            'SUBS', 0.99, -10.99,  'AUTO'],
  ['03-18 12:33', 'WALGREENS #4411',        'HLTH', 0.88, -24.30,  'AUTO']
] as const;

function Spark({ data, stroke }: { data: number[]; stroke: string }) {
  const w = 80,
    h = 22;
  const max = Math.max(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / max) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="block">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        points={pts}
      />
    </svg>
  );
}

export function DesignFour() {
  return (
    <div
      className="min-h-screen"
      style={{ background: ink, color: '#d7dce5', fontFamily: sans }}
    >
      <DesignSwitcher tone="dark" />

      {/* Top bar */}
      <header
        className="border-b flex items-center justify-between px-4 py-2 text-[11px]"
        style={{ borderColor: line, fontFamily: mono }}
      >
        <div className="flex items-center gap-4">
          <span style={{ color: amber, fontWeight: 700 }}>FINLENS</span>
          <span className="opacity-50">|</span>
          <span className="opacity-80">QUANT</span>
          <span className="opacity-50">|</span>
          <span className="opacity-60">DESK: HOUSEHOLD / PIOR+M</span>
        </div>
        <div className="hidden md:flex items-center gap-5 opacity-80">
          <span>MARCH 2026</span>
          <span style={{ color: green }}>● LIVE</span>
          <span>14:32:08 PST</span>
          <span>API $0.42</span>
        </div>
      </header>

      {/* KPI strip */}
      <div
        className="grid grid-cols-2 md:grid-cols-6 border-b"
        style={{ borderColor: line }}
      >
        {[
          ['NET OUTFLOW', '$3,847.52', '−6.8%', red],
          ['NET INFLOW',  '$4,280.00', '+0.0%', green],
          ['NET',         '+$432.48',  '+64.2%', green],
          ['TX',          '148',       '−3',    null],
          ['AUTO RATE',   '95.3%',     '+2.1%', green],
          ['REVIEW Q',    '7',         '−4',    amber]
        ].map(([label, val, delta, color], i) => (
          <div
            key={i}
            className="px-4 py-3 border-r"
            style={{ borderColor: line }}
          >
            <div
              className="text-[10px] tracking-widest opacity-60"
              style={{ fontFamily: mono }}
            >
              {label}
            </div>
            <div
              className="text-2xl font-semibold mt-0.5 tabular-nums"
              style={{ fontFamily: mono }}
            >
              {val}
            </div>
            <div
              className="text-[11px] tabular-nums mt-0.5"
              style={{ fontFamily: mono, color: (color as string) || '#8a95a8' }}
            >
              {delta}
            </div>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <div
        className="border-b overflow-hidden whitespace-nowrap text-[11px] py-1"
        style={{ borderColor: line, background: panel, fontFamily: mono }}
      >
        <div
          className="inline-block"
          style={{
            animation: 'fl4-ticker 50s linear infinite',
            paddingLeft: '100%'
          }}
        >
          <span style={{ color: amber }}>▸</span> GROC 842.17{' '}
          <span style={{ color: red }}>−2.1%</span> &nbsp;&nbsp;
          <span style={{ color: amber }}>▸</span> TRVL 620.40{' '}
          <span style={{ color: green }}>+48.2%</span> &nbsp;&nbsp;
          <span style={{ color: amber }}>▸</span> DINE 521.88{' '}
          <span style={{ color: red }}>−12.4%</span> &nbsp;&nbsp;
          <span style={{ color: amber }}>▸</span> SHOP 412.00{' '}
          <span style={{ color: green }}>+3.2%</span> &nbsp;&nbsp;
          <span style={{ color: amber }}>▸</span> TRNS 287.33{' '}
          <span style={{ color: red }}>−0.8%</span> &nbsp;&nbsp;
          <span style={{ color: amber }}>▸</span> UTIL 245.12{' '}
          <span style={{ color: green }}>+1.4%</span> &nbsp;&nbsp;
          <span style={{ color: amber }}>▸</span> HLTH 184.50{' '}
          <span style={{ color: green }}>+22.1%</span> &nbsp;&nbsp;
          <span style={{ color: amber }}>▸</span> SUBS 178.49{' '}
          <span style={{ color: green }}>+8.4%</span> &nbsp;&nbsp;
        </div>
        <style>{`@keyframes fl4-ticker { from { transform: translateX(0); } to { transform: translateX(-100%); } }`}</style>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px" style={{ background: line }}>
        {/* Hero + chart */}
        <section
          className="lg:col-span-8 p-6 md:p-8"
          style={{ background: panel }}
        >
          <div
            className="text-[11px] tracking-widest opacity-60"
            style={{ fontFamily: mono }}
          >
            [ HOUSEHOLD / MONTHLY / OUTFLOW ]
          </div>
          <div
            className="text-[88px] md:text-[128px] leading-none font-semibold tabular-nums mt-3"
            style={{ fontFamily: mono, color: '#fff', letterSpacing: '-0.04em' }}
          >
            3,847
            <span style={{ color: amber }}>.52</span>
          </div>
          <div
            className="mt-3 flex items-center gap-4 text-sm"
            style={{ fontFamily: mono }}
          >
            <span style={{ color: red }}>▼ 6.81%</span>
            <span className="opacity-60">MoM</span>
            <span className="opacity-30">|</span>
            <span style={{ color: green }}>▲ 2.3%</span>
            <span className="opacity-60">YoY</span>
            <span className="opacity-30">|</span>
            <span className="opacity-60">σ = $112.40/day</span>
          </div>

          {/* Day chart (histogram) */}
          <div className="mt-8">
            <div
              className="text-[11px] tracking-widest opacity-60 mb-2"
              style={{ fontFamily: mono }}
            >
              ┌ DAILY OUTFLOW · MAR 1 → 29
            </div>
            <div
              className="relative h-56 border-l border-b"
              style={{ borderColor: line }}
            >
              <div className="absolute inset-0 flex items-end gap-[2px] px-1">
                {[
                  42, 18, 60, 12, 133, 87, 24, 38, 212, 66, 18, 72, 45, 29,
                  102, 54, 48, 380, 22, 18, 92, 108, 110, 0, 318, 40, 86, 60,
                  98
                ].map((v, i) => {
                  const isBig = v > 150;
                  return (
                    <div key={i} className="flex-1 group relative h-full flex items-end">
                      <div
                        className="w-full transition hover:opacity-100"
                        style={{
                          height: `${Math.min(100, (v / 400) * 100)}%`,
                          background: isBig ? amber : cyan,
                          opacity: 0.85
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div
                className="absolute -left-10 top-0 text-[10px] opacity-60"
                style={{ fontFamily: mono }}
              >
                $400
              </div>
              <div
                className="absolute -left-10 bottom-0 text-[10px] opacity-60"
                style={{ fontFamily: mono }}
              >
                $0
              </div>
            </div>
            <div
              className="flex justify-between text-[10px] opacity-60 mt-1"
              style={{ fontFamily: mono }}
            >
              <span>01</span><span>05</span><span>10</span>
              <span>15</span><span>20</span><span>25</span><span>29</span>
            </div>
          </div>
        </section>

        {/* Alerts / agent feed */}
        <section
          className="lg:col-span-4 p-6"
          style={{ background: panel }}
        >
          <div
            className="text-[11px] tracking-widest opacity-60 mb-3"
            style={{ fontFamily: mono }}
          >
            [ AGENT FEED · SONNET ]
          </div>
          <ul className="space-y-3 text-[13px] leading-relaxed">
            {[
              { t: '14:28', k: 'ANOMALY', c: amber, m: 'TRVL spike +48.2% MoM — driven by ALASKA AIR 0271 ($318.40).' },
              { t: '13:47', k: 'REVIEW',  c: red,   m: '1 tx at conf 0.42: POS 4821 SQ *UNKNOWN. Needs human eye.' },
              { t: '11:03', k: 'TREND',   c: cyan,  m: 'SUBS creeping: +8.4% MoM across 12 recurring charges.' },
              { t: '09:15', k: 'INFO',    c: green, m: 'Feb statement fully processed. Auto-rate 95.3%.' }
            ].map((a, i) => (
              <li
                key={i}
                className="border-l-2 pl-3"
                style={{ borderColor: a.c }}
              >
                <div
                  className="flex items-center gap-2 text-[10px] tracking-widest"
                  style={{ fontFamily: mono }}
                >
                  <span className="opacity-60">{a.t}</span>
                  <span style={{ color: a.c }}>{a.k}</span>
                </div>
                <div className="mt-1">{a.m}</div>
              </li>
            ))}
          </ul>
          <button
            className="mt-6 w-full border py-2 text-[11px] tracking-widest transition hover:bg-[#ffb020] hover:text-black"
            style={{ borderColor: amber, color: amber, fontFamily: mono }}
          >
            ▲ UPLOAD STATEMENT · .PDF
          </button>
        </section>

        {/* Categories detail */}
        <section
          className="lg:col-span-12 p-6 md:p-8"
          style={{ background: panel }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="text-[11px] tracking-widest opacity-60"
              style={{ fontFamily: mono }}
            >
              [ CATEGORIES / MARCH 2026 / 12-MO SPARK ]
            </div>
            <div
              className="text-[11px] opacity-60"
              style={{ fontFamily: mono }}
            >
              SORT: SPEND DESC
            </div>
          </div>
          <table className="w-full text-sm" style={{ fontFamily: mono }}>
            <thead>
              <tr
                className="text-[10px] tracking-widest opacity-60 border-b"
                style={{ borderColor: line }}
              >
                <th className="text-left py-2 font-normal">SYM</th>
                <th className="text-left py-2 font-normal">CATEGORY</th>
                <th className="text-right py-2 font-normal">SPEND</th>
                <th className="text-right py-2 font-normal">% TOT</th>
                <th className="text-right py-2 font-normal">Δ MoM</th>
                <th className="text-center py-2 font-normal">12M</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c, i) => {
                const up = c.d > 0;
                const sym = c.name.slice(0, 4).toUpperCase();
                return (
                  <tr
                    key={c.name}
                    className="border-b hover:bg-white/5"
                    style={{ borderColor: line }}
                  >
                    <td className="py-3" style={{ color: amber }}>{sym}</td>
                    <td className="py-3 text-white">{c.name}</td>
                    <td className="py-3 text-right tabular-nums">${c.amt.toFixed(2)}</td>
                    <td className="py-3 text-right tabular-nums opacity-70">{c.pct.toFixed(1)}%</td>
                    <td
                      className="py-3 text-right tabular-nums"
                      style={{ color: up ? red : green }}
                    >
                      {up ? '▲' : '▼'} {Math.abs(c.d).toFixed(1)}%
                    </td>
                    <td className="py-3">
                      <div className="flex justify-center">
                        <Spark data={c.spark} stroke={up ? red : green} />
                      </div>
                    </td>
                    <td className="py-3">
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: '#1b2840' }}
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${c.pct * 4}%`,
                            background: amber,
                            opacity: 0.85
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* TX table */}
        <section
          className="lg:col-span-12 p-6 md:p-8"
          style={{ background: panel }}
        >
          <div
            className="text-[11px] tracking-widest opacity-60 mb-3"
            style={{ fontFamily: mono }}
          >
            [ TRANSACTIONS / LAST 12 / LIVE ]
          </div>
          <table className="w-full text-[13px]" style={{ fontFamily: mono }}>
            <thead>
              <tr
                className="text-[10px] tracking-widest opacity-60 border-b"
                style={{ borderColor: line }}
              >
                <th className="text-left py-2 font-normal">TIMESTAMP</th>
                <th className="text-left py-2 font-normal">MERCHANT</th>
                <th className="text-left py-2 font-normal">CAT</th>
                <th className="text-right py-2 font-normal">CONF</th>
                <th className="text-right py-2 font-normal">AMOUNT</th>
                <th className="text-right py-2 font-normal">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {txs.map(([d, desc, cat, conf, amt, status], i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-white/5"
                  style={{ borderColor: line }}
                >
                  <td className="py-2 opacity-70">{d}</td>
                  <td className="py-2 text-white">{desc}</td>
                  <td className="py-2 opacity-80">{cat}</td>
                  <td
                    className="py-2 text-right tabular-nums"
                    style={{
                      color: (conf as number) < 0.85 ? amber : undefined
                    }}
                  >
                    {((conf as number) * 100).toFixed(0)}%
                  </td>
                  <td
                    className="py-2 text-right tabular-nums"
                    style={{ color: (amt as number) > 0 ? green : '#e5e9ef' }}
                  >
                    {(amt as number) > 0 ? '+' : '−'}$
                    {Math.abs(amt as number).toFixed(2)}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className="px-2 py-0.5 text-[10px] border"
                      style={{
                        color:
                          status === 'RVW'
                            ? amber
                            : status === 'IN'
                            ? green
                            : '#8a95a8',
                        borderColor:
                          status === 'RVW'
                            ? amber
                            : status === 'IN'
                            ? green
                            : '#2a3a58'
                      }}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Footer */}
      <footer
        className="px-4 py-2 text-[10px] opacity-60 flex items-center justify-between"
        style={{ fontFamily: mono, borderTop: `1px solid ${line}` }}
      >
        <span>FINLENS/QUANT · v0.1.0 · SQLITE 4.2MB · QDRANT 1284 pts</span>
        <span>F1 help · F2 upload · F3 review · F4 export · F10 quit</span>
      </footer>
    </div>
  );
}
