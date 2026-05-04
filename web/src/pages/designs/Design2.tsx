import { useEffect, useState } from 'react';
import { MOCK, fmtShort } from './mock';

const SPARK = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

function spark(values: number[]): string {
  const max = Math.max(...values);
  return values.map((v) => SPARK[Math.min(SPARK.length - 1, Math.floor((v / max) * (SPARK.length - 1)))]).join('');
}

function bar(share: number, width = 32): string {
  const filled = Math.round(share * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function useTick(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

export function Design2() {
  const time = useTick();
  const trend = ((MOCK.spent - MOCK.prevSpent) / MOCK.prevSpent) * 100;
  const max = MOCK.categories[0].amount;

  return (
    <div className="d2-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Inter+Tight:wght@500;600;700&display=swap');

        .d2-page {
          --bg: #0a0a0a;
          --fg: #e3e3dc;
          --dim: #6b6b62;
          --rule: #2a2a26;
          --sig: #00ff85;
          --alert: #ff3b3b;
          --warn: #ffcb1f;
          min-height: 100vh; width: 100%;
          background: var(--bg);
          color: var(--fg);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 13px;
          line-height: 1.45;
          letter-spacing: 0.01em;
          padding: 0;
          overflow-x: hidden;
        }
        .d2-page::before {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 30;
          background: repeating-linear-gradient(0deg, rgba(255,255,255,0.014) 0 1px, transparent 1px 3px);
        }
        .d2-page::after {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 31;
          background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%);
        }

        .d2-bar {
          display: flex; gap: 0; align-items: stretch;
          border-bottom: 1px solid var(--rule);
          font-size: 11px;
          height: 28px;
        }
        .d2-bar > div {
          padding: 7px 12px;
          display: flex; align-items: center; gap: 8px;
          border-right: 1px solid var(--rule);
          color: var(--dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .d2-bar .d2-live { color: var(--sig); }
        .d2-bar .d2-dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--sig);
          box-shadow: 0 0 8px var(--sig);
          animation: d2-pulse 1.4s infinite;
        }
        @keyframes d2-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        .d2-bar .d2-spacer { flex: 1; border-right: 0; }

        .d2-shell { padding: 28px 28px 60px; max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
        @media (max-width: 720px) { .d2-shell { padding: 20px 16px 56px; } }

        .d2-banner {
          display: grid; grid-template-columns: auto 1fr auto; align-items: center;
          gap: 18px;
          padding: 28px 0 18px;
          border-bottom: 1px solid var(--rule);
        }
        .d2-logo {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
          font-size: 14px; letter-spacing: 0.32em;
          padding: 8px 14px;
          background: var(--fg); color: var(--bg);
        }
        .d2-banner h1 {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 700;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1; margin: 0;
          letter-spacing: -0.02em;
        }
        .d2-banner h1 span { color: var(--sig); }
        .d2-banner .d2-meta {
          text-align: right;
          font-size: 11px;
          color: var(--dim);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .d2-prompt {
          margin: 18px 0 8px;
          color: var(--dim);
        }
        .d2-prompt b { color: var(--sig); font-weight: 500; }
        .d2-prompt .cur {
          display: inline-block; width: 8px; height: 14px; background: var(--sig);
          vertical-align: -2px; margin-left: 4px;
          animation: d2-blink 1s steps(2,start) infinite;
          box-shadow: 0 0 6px var(--sig);
        }
        @keyframes d2-blink { 50% { opacity: 0 } }

        .d2-headnum {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 0;
          border: 1px solid var(--rule);
          border-bottom: 0;
        }
        @media (max-width: 880px) { .d2-headnum { grid-template-columns: 1fr; } }
        .d2-headnum .l, .d2-headnum .r { padding: 22px 24px; }
        .d2-headnum .l { border-right: 1px solid var(--rule); }
        @media (max-width: 880px) { .d2-headnum .l { border-right: 0; border-bottom: 1px solid var(--rule); } }
        .d2-tag {
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase; color: var(--dim);
        }
        .d2-bignum {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
          font-size: clamp(56px, 9vw, 110px);
          line-height: 0.95;
          letter-spacing: -0.04em;
          margin-top: 6px;
          font-variant-numeric: tabular-nums;
        }
        .d2-bignum .cents { color: var(--dim); font-weight: 500; }
        .d2-trend {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 14px;
          padding: 4px 10px;
          border: 1px solid var(--sig);
          color: var(--sig);
          font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;
        }
        .d2-trend.up { border-color: var(--alert); color: var(--alert); }
        .d2-spark {
          font-family: 'JetBrains Mono', monospace;
          font-size: 28px;
          line-height: 1;
          color: var(--sig);
          letter-spacing: -0.02em;
          margin-top: 10px;
          word-break: break-all;
        }

        .d2-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--rule);
          border-bottom: 0;
        }
        @media (max-width: 880px) { .d2-kpis { grid-template-columns: repeat(2, 1fr); } }
        .d2-kpis > div {
          padding: 18px 20px;
          border-right: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }
        .d2-kpis > div:last-child { border-right: 0; }
        @media (max-width: 880px) {
          .d2-kpis > div:nth-child(2n) { border-right: 0; }
        }
        .d2-kpi-v {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
          margin-top: 4px;
        }
        .d2-kpi-v.sig { color: var(--sig); }
        .d2-kpi-v.warn { color: var(--warn); }

        .d2-section {
          border: 1px solid var(--rule);
          border-bottom: 0;
        }
        .d2-section-h {
          padding: 10px 16px;
          border-bottom: 1px solid var(--rule);
          background: #0e0e0e;
          font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
          display: flex; justify-content: space-between; align-items: center;
          color: var(--dim);
        }
        .d2-section-h::before {
          content: '►'; color: var(--sig); margin-right: 8px;
        }
        .d2-section-b { padding: 18px 18px 18px; }

        .d2-row { display: flex; align-items: center; gap: 14px; padding: 4px 0; font-size: 13px; }
        .d2-row .name { width: 130px; flex: none; color: var(--fg); text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; }
        .d2-row .barchars { color: var(--sig); white-space: nowrap; font-size: 13px; flex: 1; overflow: hidden; }
        .d2-row .barchars .dim { color: #1a3326; }
        .d2-row .amt { width: 110px; text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; flex: none; }
        .d2-row .pct { width: 52px; text-align: right; color: var(--dim); flex: none; font-size: 11px; }

        .d2-table { width: 100%; border-collapse: collapse; }
        .d2-table th {
          text-align: left;
          padding: 8px 10px;
          font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--dim);
          font-weight: 500;
          border-bottom: 1px solid var(--rule);
        }
        .d2-table th.r, .d2-table td.r { text-align: right; }
        .d2-table td {
          padding: 9px 10px;
          font-size: 13px;
          border-bottom: 1px dashed var(--rule);
          font-variant-numeric: tabular-nums;
        }
        .d2-table tr:last-child td { border-bottom: 0; }
        .d2-table tr:hover td { background: rgba(0, 255, 133, 0.03); }
        .d2-table .cat {
          display: inline-block;
          font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--sig);
          border: 1px solid var(--rule);
          padding: 1px 6px;
        }
        .d2-table .neg { color: var(--alert); }

        .d2-twocol {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 0;
          border: 1px solid var(--rule);
          border-bottom: 0;
        }
        @media (max-width: 880px) { .d2-twocol { grid-template-columns: 1fr; } }
        .d2-twocol > * { border-right: 1px solid var(--rule); }
        .d2-twocol > *:last-child { border-right: 0; }
        @media (max-width: 880px) {
          .d2-twocol > * { border-right: 0; border-bottom: 1px solid var(--rule); }
          .d2-twocol > *:last-child { border-bottom: 0; }
        }

        .d2-statusbar {
          margin-top: 24px;
          border-top: 1px solid var(--sig);
          padding: 10px 0;
          display: flex; gap: 18px; flex-wrap: wrap;
          font-size: 11px; color: var(--dim); letter-spacing: 0.12em; text-transform: uppercase;
        }
        .d2-statusbar b { color: var(--sig); font-weight: 500; }

        .d2-ascii-art {
          color: var(--rule);
          white-space: pre;
          font-size: 12px;
          line-height: 1;
          margin: 8px 0 18px;
          overflow: hidden;
        }
        .d2-watermark {
          color: var(--rule);
          white-space: pre;
          font-size: 8px;
          line-height: 1;
          letter-spacing: 0;
          padding: 14px 16px;
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <div className="d2-bar">
        <div><span className="d2-dot" /> <span className="d2-live">CONNECTED</span></div>
        <div>FINLENS://TERMINAL_v0.42</div>
        <div>SESSION: PIOTR@LOCAL</div>
        <div>{time}</div>
        <div className="d2-spacer" />
        <div>SHIFT+? FOR HELP</div>
      </div>

      <div className="d2-shell">
        <div className="d2-banner">
          <div className="d2-logo">FNLNS</div>
          <h1>HOUSEHOLD <span>//</span> {MOCK.month.toUpperCase()}</h1>
          <div className="d2-meta">
            REPORT_ID 2026-04-FNL<br />
            BUILT IN 24ms · 142 ROWS
          </div>
        </div>

        <div className="d2-prompt">
          <b>{'>'}</b> select sum(amount) from txn where month = 'apr-2026'<span className="cur" />
        </div>

        <div className="d2-headnum">
          <div className="l">
            <div className="d2-tag">TOTAL · OUTFLOW · APR 2026</div>
            <div className="d2-bignum">
              ${Math.floor(MOCK.spent).toLocaleString()}
              <span className="cents">.{(MOCK.spent.toFixed(2)).split('.')[1]}</span>
            </div>
            <div className={`d2-trend up`}>
              ▲ +{trend.toFixed(2)}% vs MAR · Δ +${fmtShort(MOCK.spent - MOCK.prevSpent)}
            </div>
          </div>
          <div className="r">
            <div className="d2-tag">DAILY · 30D · BLOCK</div>
            <div className="d2-spark">{spark(MOCK.series)}</div>
            <div style={{ marginTop: 12, color: 'var(--dim)', fontSize: 11, letterSpacing: '0.15em' }}>
              MIN ${Math.min(...MOCK.series)} / AVG ${Math.round(MOCK.series.reduce((s, v) => s + v, 0) / MOCK.series.length)} / MAX ${Math.max(...MOCK.series)}
            </div>
            <div style={{ marginTop: 14 }} className="d2-tag">PEAK DAY · APR 14 · $410.00</div>
          </div>
        </div>

        <div className="d2-kpis">
          <div>
            <div className="d2-tag">TXN_COUNT</div>
            <div className="d2-kpi-v">{MOCK.transactions}</div>
          </div>
          <div>
            <div className="d2-tag">NEEDS_REVIEW</div>
            <div className="d2-kpi-v warn">{String(MOCK.needsReview).padStart(2, '0')}</div>
          </div>
          <div>
            <div className="d2-tag">RESERVE</div>
            <div className="d2-kpi-v sig">${fmtShort(MOCK.saved)}</div>
          </div>
          <div>
            <div className="d2-tag">SAVE_RATE</div>
            <div className="d2-kpi-v sig">{Math.round((MOCK.saved / MOCK.income) * 100)}%</div>
          </div>
        </div>

        <div className="d2-twocol">
          <section className="d2-section" style={{ border: 0 }}>
            <div className="d2-section-h">
              <span>CAT_AGGREGATE.SORTED_DESC</span>
              <span>RUN: 0.04ms</span>
            </div>
            <div className="d2-section-b">
              {MOCK.categories.map((c) => {
                const w = 28;
                const filled = Math.round((c.amount / max) * w);
                return (
                  <div className="d2-row" key={c.name}>
                    <span className="name">{c.name}</span>
                    <span className="barchars">
                      {'█'.repeat(filled)}<span className="dim">{'░'.repeat(w - filled)}</span>
                    </span>
                    <span className="amt">${fmtShort(c.amount)}</span>
                    <span className="pct">{(c.share * 100).toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="d2-section" style={{ border: 0 }}>
            <div className="d2-section-h">
              <span>FLAGS &amp; SIGNALS</span>
              <span>3</span>
            </div>
            <div className="d2-section-b" style={{ display: 'grid', gap: 14 }}>
              <div style={{ borderLeft: '2px solid var(--alert)', paddingLeft: 12 }}>
                <div style={{ color: 'var(--alert)', fontSize: 11, letterSpacing: '0.18em' }}>! ANOMALY · LARGE_CHARGE</div>
                <div style={{ marginTop: 4, fontSize: 13 }}>AIR CANADA · $642.18</div>
                <div style={{ color: 'var(--dim)', fontSize: 11, marginTop: 2 }}>4.6× median outflow / 6.0σ</div>
              </div>
              <div style={{ borderLeft: '2px solid var(--warn)', paddingLeft: 12 }}>
                <div style={{ color: 'var(--warn)', fontSize: 11, letterSpacing: '0.18em' }}>~ TREND · CATEGORY_DRIFT</div>
                <div style={{ marginTop: 4, fontSize: 13 }}>RESTAURANTS UP +18%</div>
                <div style={{ color: 'var(--dim)', fontSize: 11, marginTop: 2 }}>3-month rolling vs prior</div>
              </div>
              <div style={{ borderLeft: '2px solid var(--sig)', paddingLeft: 12 }}>
                <div style={{ color: 'var(--sig)', fontSize: 11, letterSpacing: '0.18em' }}>+ POSITIVE · SUBS_FLAT</div>
                <div style={{ marginTop: 4, fontSize: 13 }}>SUBSCRIPTIONS = $187</div>
                <div style={{ color: 'var(--dim)', fontSize: 11, marginTop: 2 }}>9 active · 0 changed</div>
              </div>
              <div className="d2-watermark">{`
  ┌──── HOUSEHOLD ────┐
  │ ${MOCK.household.join(' · ').padEnd(17)} │
  │ ACCOUNTS=4 OK     │
  │ SYNC=2026-04-30   │
  └───────────────────┘`}</div>
            </div>
          </aside>
        </div>

        <section className="d2-section">
          <div className="d2-section-h">
            <span>RECENT.TXN · ORDER BY date DESC LIMIT 9</span>
            <span>9 / {MOCK.transactions}</span>
          </div>
          <div className="d2-section-b" style={{ padding: 0 }}>
            <table className="d2-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>DATE</th>
                  <th>MERCHANT</th>
                  <th>CATEGORY</th>
                  <th className="r" style={{ width: '120px' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {MOCK.recent.map((t) => (
                  <tr key={t.merchant + t.date}>
                    <td style={{ color: 'var(--dim)', letterSpacing: '0.06em' }}>{t.date.toUpperCase()}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{t.merchant.toUpperCase()}</span>
                      {t.note ? <span style={{ color: 'var(--dim)', marginLeft: 8 }}>// {t.note}</span> : null}
                    </td>
                    <td><span className="cat">{t.category}</span></td>
                    <td className="r neg">{(t.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="d2-statusbar">
          <span>READY</span>
          <span>·</span>
          <span><b>q</b> quit</span>
          <span><b>r</b> refresh</span>
          <span><b>/</b> filter</span>
          <span><b>j/k</b> nav</span>
          <span style={{ marginLeft: 'auto' }}>WROTE 142 ROWS · 0 ERRORS · 0 WARNINGS</span>
        </div>
      </div>
    </div>
  );
}
