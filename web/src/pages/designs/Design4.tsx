import { MOCK, fmtShort } from './mock';

const ORDINALS = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH'];

export function Design4() {
  const trend = ((MOCK.spent - MOCK.prevSpent) / MOCK.prevSpent) * 100;

  return (
    <div className="d4-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Major+Mono+Display&family=VT323&family=DM+Mono:wght@400;500&display=swap');

        .d4-page {
          --bg-1: #0b0428;
          --bg-2: #1a063e;
          --bg-3: #2a0a52;
          --pink: #ff2ad1;
          --cyan: #28f4ff;
          --yellow: #ffd62b;
          --green: #74ff8e;
          --grid: #5b1f9a;
          --ink: #f3e8ff;
          --dim: #b69ee0;
          min-height: 100vh; width: 100%;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(255, 42, 209, 0.22) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 100%, rgba(40, 244, 255, 0.18) 0%, transparent 50%),
            linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 50%, var(--bg-3) 100%);
          color: var(--ink);
          font-family: 'VT323', monospace;
          font-size: 18px;
          letter-spacing: 0.02em;
          position: relative;
          overflow-x: hidden;
          padding: 32px 36px 60px;
        }
        @media (max-width: 720px) { .d4-page { padding: 22px 16px 60px; } }

        .d4-page::before {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 40;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 4px);
          mix-blend-mode: multiply;
        }
        .d4-page::after {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 41;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%);
        }

        .d4-floor {
          position: fixed; left: 0; right: 0; bottom: 0; height: 50vh;
          pointer-events: none; z-index: 0;
          perspective: 600px;
          perspective-origin: 50% 0%;
        }
        .d4-floor::before {
          content: ''; position: absolute; inset: -10% 0 -10% 0;
          background:
            linear-gradient(transparent 0%, transparent 75%, rgba(11,4,40,0.95) 100%),
            linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), var(--grid) calc(100% - 1px)) 0 0 / 60px 100%,
            linear-gradient(180deg, transparent 0, transparent calc(100% - 1px), var(--grid) calc(100% - 1px)) 0 0 / 100% 60px,
            radial-gradient(ellipse at 50% 0%, rgba(255, 42, 209, 0.4), transparent 50%);
          transform: rotateX(72deg);
          transform-origin: 50% 0%;
          opacity: 0.7;
          animation: d4-floor 12s linear infinite;
        }
        @keyframes d4-floor {
          from { background-position: 0 0, 0 0, 0 0, 0 0; }
          to   { background-position: 0 0, 0 0, 0 60px, 0 0; }
        }

        .d4-shell { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; }

        .d4-bar {
          display: flex; justify-content: space-between; align-items: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 11px; letter-spacing: 0.06em;
          color: var(--cyan);
          text-shadow: 0 0 6px var(--cyan), 0 0 14px rgba(40, 244, 255, 0.5);
          padding-bottom: 22px;
          border-bottom: 1px dashed rgba(40, 244, 255, 0.25);
        }
        .d4-bar .blink { animation: d4-blink 1s steps(2,start) infinite; }
        @keyframes d4-blink { 50% { opacity: 0 } }
        .d4-bar .pink { color: var(--pink); text-shadow: 0 0 6px var(--pink), 0 0 14px rgba(255,42,209,0.4); }
        .d4-bar .yellow { color: var(--yellow); text-shadow: 0 0 6px var(--yellow); }

        .d4-titlebar {
          margin-top: 36px;
          display: flex; align-items: center; justify-content: center; flex-direction: column;
          gap: 6px;
        }
        .d4-arcade-title {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(16px, 2.6vw, 26px);
          letter-spacing: 0.08em;
          color: var(--pink);
          text-shadow:
            0 0 4px var(--pink),
            0 0 14px var(--pink),
            0 0 28px rgba(255,42,209,0.7),
            -2px 0 0 var(--cyan),
            2px 0 0 var(--yellow);
          text-align: center;
        }
        .d4-arcade-sub {
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          letter-spacing: 0.32em;
          color: var(--cyan);
          text-shadow: 0 0 6px var(--cyan);
        }

        .d4-frame {
          margin-top: 28px;
          padding: 28px 22px 22px;
          border: 2px solid var(--pink);
          border-radius: 12px;
          background: rgba(11, 4, 40, 0.6);
          backdrop-filter: blur(8px);
          box-shadow:
            0 0 0 1px rgba(255,42,209,0.4),
            0 0 24px rgba(255,42,209,0.4),
            inset 0 0 28px rgba(255, 42, 209, 0.15);
          position: relative;
        }
        .d4-frame::before, .d4-frame::after {
          content: ''; position: absolute; width: 14px; height: 14px;
          border: 2px solid var(--cyan);
          background: var(--bg-1);
        }
        .d4-frame::before { top: -8px; left: -8px; border-right: 0; border-bottom: 0; }
        .d4-frame::after { bottom: -8px; right: -8px; border-left: 0; border-top: 0; }

        .d4-tag {
          font-family: 'Press Start 2P', monospace;
          font-size: 9px; letter-spacing: 0.28em; color: var(--cyan);
          text-shadow: 0 0 6px var(--cyan);
          text-align: center; margin-bottom: 8px;
        }
        .d4-bigscore {
          font-family: 'Major Mono Display', monospace;
          font-size: clamp(72px, 14vw, 168px);
          line-height: 0.95;
          letter-spacing: 0.04em;
          text-align: center;
          color: var(--yellow);
          text-shadow:
            0 0 4px var(--yellow),
            0 0 16px var(--yellow),
            0 0 32px rgba(255, 214, 43, 0.6),
            0 0 60px rgba(255, 214, 43, 0.3);
          font-feature-settings: 'tnum';
        }
        .d4-bigscore .dim { color: rgba(255, 214, 43, 0.35); }

        .d4-trendline {
          text-align: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          color: ${trend > 0 ? 'var(--pink)' : 'var(--green)'};
          text-shadow: 0 0 6px ${trend > 0 ? 'var(--pink)' : 'var(--green)'};
          margin-top: 4px;
        }

        .d4-kpis {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 720px) { .d4-kpis { grid-template-columns: repeat(2, 1fr); } }

        .d4-kpi {
          padding: 14px 14px 16px;
          background: rgba(11, 4, 40, 0.6);
          border: 1.5px solid var(--cyan);
          border-radius: 6px;
          box-shadow: 0 0 14px rgba(40, 244, 255, 0.3), inset 0 0 18px rgba(40, 244, 255, 0.08);
          position: relative;
        }
        .d4-kpi .l {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px; letter-spacing: 0.24em;
          color: var(--cyan); text-shadow: 0 0 6px var(--cyan);
        }
        .d4-kpi .v {
          font-family: 'Major Mono Display', monospace;
          font-size: clamp(28px, 4vw, 38px);
          color: #fff;
          text-shadow: 0 0 4px #fff, 0 0 14px var(--pink);
          margin-top: 6px;
          letter-spacing: 0.04em;
          font-feature-settings: 'tnum';
        }
        .d4-kpi.pink { border-color: var(--pink); box-shadow: 0 0 14px rgba(255, 42, 209, 0.3), inset 0 0 18px rgba(255, 42, 209, 0.08); }
        .d4-kpi.pink .l { color: var(--pink); text-shadow: 0 0 6px var(--pink); }
        .d4-kpi.yellow { border-color: var(--yellow); box-shadow: 0 0 14px rgba(255, 214, 43, 0.3), inset 0 0 18px rgba(255, 214, 43, 0.08); }
        .d4-kpi.yellow .l { color: var(--yellow); text-shadow: 0 0 6px var(--yellow); }
        .d4-kpi.green { border-color: var(--green); box-shadow: 0 0 14px rgba(116, 255, 142, 0.3); }
        .d4-kpi.green .l { color: var(--green); text-shadow: 0 0 6px var(--green); }

        .d4-twocol {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }
        @media (max-width: 880px) { .d4-twocol { grid-template-columns: 1fr; } }

        .d4-panel {
          padding: 14px 16px 18px;
          background: rgba(11, 4, 40, 0.6);
          border: 1.5px solid var(--pink);
          border-radius: 8px;
          box-shadow: 0 0 18px rgba(255,42,209,0.2), inset 0 0 24px rgba(255,42,209,0.06);
        }
        .d4-panel.cyan { border-color: var(--cyan); box-shadow: 0 0 18px rgba(40,244,255,0.2), inset 0 0 24px rgba(40,244,255,0.06); }
        .d4-panel-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          color: var(--pink); text-shadow: 0 0 6px var(--pink);
          padding-bottom: 8px;
          border-bottom: 1px dashed rgba(255,42,209,0.4);
          margin-bottom: 12px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .d4-panel.cyan .d4-panel-title { color: var(--cyan); text-shadow: 0 0 6px var(--cyan); border-bottom-color: rgba(40,244,255,0.4); }

        .d4-leaderboard { display: grid; gap: 8px; }
        .d4-rank {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 8px 8px;
          font-size: 20px;
          color: var(--ink);
          background: rgba(255, 255, 255, 0.025);
          border-left: 3px solid transparent;
        }
        .d4-rank .ord {
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          color: var(--yellow);
          text-shadow: 0 0 6px var(--yellow);
        }
        .d4-rank .name { letter-spacing: 0.04em; text-transform: uppercase; }
        .d4-rank .amt {
          font-family: 'Major Mono Display', monospace;
          color: var(--cyan); text-shadow: 0 0 6px var(--cyan);
          font-feature-settings: 'tnum';
        }
        .d4-rank:nth-child(1) { border-left-color: var(--yellow); }
        .d4-rank:nth-child(2) { border-left-color: var(--cyan); }
        .d4-rank:nth-child(3) { border-left-color: var(--pink); }

        .d4-ticker { display: grid; gap: 6px; }
        .d4-tick-row {
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 7px 4px;
          border-bottom: 1px dashed rgba(40,244,255,0.18);
          font-size: 19px;
        }
        .d4-tick-row:last-child { border-bottom: 0; }
        .d4-tick-row .d {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: var(--cyan);
        }
        .d4-tick-row .m { letter-spacing: 0.04em; text-transform: uppercase; }
        .d4-tick-row .a {
          font-family: 'Major Mono Display', monospace;
          color: var(--pink);
          text-shadow: 0 0 6px rgba(255,42,209,0.7);
          font-feature-settings: 'tnum';
        }
        .d4-tick-row .cat {
          display: inline-block;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px; letter-spacing: 0.2em;
          color: var(--bg-1);
          background: var(--cyan);
          padding: 3px 6px;
          margin-left: 8px;
          vertical-align: middle;
        }

        .d4-press {
          margin-top: 36px;
          text-align: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 11px; letter-spacing: 0.2em;
          color: var(--yellow);
          text-shadow: 0 0 6px var(--yellow), 0 0 18px var(--yellow);
          animation: d4-flash 1.6s steps(2,start) infinite;
        }
        @keyframes d4-flash { 50% { opacity: 0.25 } }

        .d4-credit {
          margin-top: 18px; text-align: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 9px; color: var(--dim); letter-spacing: 0.14em;
        }
      `}</style>

      <div className="d4-floor" />

      <div className="d4-shell">
        <div className="d4-bar">
          <span><span className="blink">▌</span> FINLENS_v0.42</span>
          <span className="yellow">CREDITS · 03</span>
          <span className="pink">PLAYER · {MOCK.household[0].toUpperCase()}</span>
          <span>STAGE · 04 / 12</span>
        </div>

        <div className="d4-titlebar">
          <div className="d4-arcade-title">★  HIGH SCORE  ★</div>
          <div className="d4-arcade-sub">{MOCK.month.toUpperCase()} · HOUSEHOLD MODE</div>
        </div>

        <section className="d4-frame">
          <div className="d4-tag">▶ TOTAL OUTFLOW ◀</div>
          <div className="d4-bigscore">${fmtShort(MOCK.spent)}</div>
          <div className="d4-trendline">
            ▲ +{trend.toFixed(2)}% VS LAST MONTH · DELTA ${fmtShort(MOCK.spent - MOCK.prevSpent)}
          </div>
        </section>

        <div className="d4-kpis">
          <div className="d4-kpi yellow">
            <div className="l">TXNS</div>
            <div className="v">{String(MOCK.transactions).padStart(3, '0')}</div>
          </div>
          <div className="d4-kpi pink">
            <div className="l">REVIEW</div>
            <div className="v">{String(MOCK.needsReview).padStart(2, '0')}</div>
          </div>
          <div className="d4-kpi green">
            <div className="l">SAVED</div>
            <div className="v">${Math.round(MOCK.saved)}</div>
          </div>
          <div className="d4-kpi">
            <div className="l">RATE</div>
            <div className="v">{Math.round((MOCK.saved / MOCK.income) * 100)}%</div>
          </div>
        </div>

        <div className="d4-twocol">
          <section className="d4-panel">
            <div className="d4-panel-title"><span>·· LEADERBOARD ··</span><span style={{ color: 'var(--yellow)' }}>TOP 6</span></div>
            <div className="d4-leaderboard">
              {MOCK.categories.slice(0, 6).map((c, i) => (
                <div className="d4-rank" key={c.name}>
                  <span className="ord">{ORDINALS[i]}</span>
                  <span className="name">{c.name}</span>
                  <span className="amt">${fmtShort(c.amount)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="d4-panel cyan">
            <div className="d4-panel-title"><span>·· LATEST_ACTIVITY ··</span><span style={{ color: 'var(--pink)' }}>LIVE</span></div>
            <div className="d4-ticker">
              {MOCK.recent.slice(0, 7).map((t) => (
                <div className="d4-tick-row" key={t.merchant + t.date}>
                  <span className="d">{t.date.replace(' ', '/').toUpperCase()}</span>
                  <span className="m">
                    {t.merchant}
                    <span className="cat">{t.category}</span>
                  </span>
                  <span className="a">{(t.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="d4-press">▶▶  PRESS  [ ENTER ]  TO  CONTINUE  ◀◀</div>
        <div className="d4-credit">© FINLENS ARCADE · INSERT COIN · {MOCK.month.toUpperCase()}</div>
      </div>
    </div>
  );
}
