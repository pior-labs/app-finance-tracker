import { MOCK, fmt, fmtShort } from './mock';

function sparkPath(values: number[], width: number, height: number, padX = 4, padY = 6): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = width - padX * 2;
  const h = height - padY * 2;
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = padX + (i / (values.length - 1)) * w;
      const y = padY + h - ((v - min) / span) * h;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function Design7() {
  const trend = ((MOCK.spent - MOCK.prevSpent) / MOCK.prevSpent) * 100;
  const goal = 5000;
  const savePct = Math.min(1, MOCK.saved / goal);
  const max = MOCK.categories[0].amount;
  const top = MOCK.recent[0];
  const avg = Math.round(MOCK.series.reduce((s, v) => s + v, 0) / MOCK.series.length);

  return (
    <div className="d7-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .d7-page {
          --bg: #f3ecdc;
          --card: #faf5e9;
          --ink: #29251e;
          --ink-soft: #6e6859;
          --dim: #9c9583;
          --line: #e0d6bf;
          --line-soft: #ece3cc;
          --accent: #b35a36;
          --accent-soft: #e8c1a8;
          min-height: 100vh; width: 100%;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Geist', system-ui, sans-serif;
          font-weight: 400;
          letter-spacing: -0.005em;
          padding: 36px 44px 80px;
        }
        @media (max-width: 720px) { .d7-page { padding: 24px 18px 60px; } }

        .d7-shell { max-width: 1320px; margin: 0 auto; }

        .d7-head {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: end;
          gap: 28px;
          padding-bottom: 24px;
          margin-bottom: 22px;
          border-bottom: 0.5px solid var(--line);
        }
        @media (max-width: 720px) { .d7-head { grid-template-columns: 1fr; gap: 14px; } }
        .d7-mark {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 28px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--accent);
        }
        .d7-greet {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-size: clamp(22px, 2.4vw, 28px);
          line-height: 1.2;
          letter-spacing: -0.01em;
          margin: 0;
          color: var(--ink);
        }
        .d7-greet em { color: var(--accent); font-style: italic; }
        .d7-period {
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-soft);
          font-weight: 500;
          display: flex; align-items: center; gap: 10px;
        }
        .d7-period .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }

        .d7-bento {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
        }
        @media (max-width: 980px) { .d7-bento { grid-template-columns: repeat(6, 1fr); } }
        @media (max-width: 640px) { .d7-bento { grid-template-columns: 1fr; } }

        .d7-card {
          background: var(--card);
          border: 0.5px solid var(--line);
          border-radius: 22px;
          padding: 28px 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }
        .d7-label {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink-soft);
          font-weight: 500;
          margin: 0;
        }
        .d7-label .accent { color: var(--accent); }

        /* Hero */
        .d7-hero {
          grid-column: span 8;
          grid-row: span 2;
          padding: 36px 40px 32px;
          gap: 18px;
        }
        @media (max-width: 980px) { .d7-hero { grid-column: span 6; padding: 28px; } }
        .d7-hero-num {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-size: clamp(72px, 11vw, 132px);
          line-height: 0.9;
          letter-spacing: -0.04em;
          color: var(--ink);
          margin: 0;
          font-feature-settings: 'lnum', 'tnum';
        }
        .d7-hero-num em { font-style: italic; color: var(--accent); }
        .d7-hero-num .cents { font-size: 0.5em; color: var(--dim); font-style: italic; vertical-align: 0.4em; letter-spacing: -0.02em; margin-left: 4px; }
        .d7-hero-meta {
          display: flex; align-items: baseline; gap: 14px;
          padding-top: 14px;
          border-top: 0.5px solid var(--line-soft);
          flex-wrap: wrap;
        }
        .d7-hero-meta .delta {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 22px;
          color: var(--accent);
          letter-spacing: -0.01em;
        }
        .d7-hero-meta .vs {
          font-size: 13px;
          color: var(--ink-soft);
          font-weight: 400;
        }
        .d7-hero-spark {
          margin-top: auto;
          width: 100%;
          height: 60px;
          display: block;
        }

        /* Save */
        .d7-save {
          grid-column: span 4;
          grid-row: span 2;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 28px;
          gap: 10px;
        }
        @media (max-width: 980px) { .d7-save { grid-column: span 6; } }
        .d7-save .d7-label { align-self: stretch; text-align: left; }
        .d7-ring {
          position: relative;
          width: min(100%, 170px);
          aspect-ratio: 1;
          margin: 6px auto 8px;
        }
        .d7-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .d7-ring-c {
          position: absolute; inset: 0;
          display: grid; place-items: center;
        }
        .d7-ring-pct {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 44px;
          color: var(--ink);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .d7-ring-sub {
          font-size: 11px;
          color: var(--ink-soft);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-top: 4px;
          font-weight: 500;
        }
        .d7-save-num {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-size: 30px;
          letter-spacing: -0.02em;
          line-height: 1;
          font-feature-settings: 'lnum', 'tnum';
        }
        .d7-save-goal {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 15px;
          color: var(--ink-soft);
        }

        /* Categories */
        .d7-cats {
          grid-column: span 7;
          grid-row: span 3;
          padding: 28px 30px 22px;
          gap: 6px;
        }
        @media (max-width: 980px) { .d7-cats { grid-column: span 6; } }
        .d7-cats-head {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 8px;
        }
        .d7-cats-head h2 {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-size: 26px;
          letter-spacing: -0.02em;
          margin: 0;
          color: var(--ink);
        }
        .d7-cats-head h2 em { font-style: italic; color: var(--accent); }
        .d7-cats-head .meta {
          font-size: 12px; color: var(--ink-soft);
          letter-spacing: 0.04em;
          font-weight: 500;
        }

        .d7-cat-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: baseline;
          gap: 14px;
          padding: 11px 0 4px;
          border-bottom: 0.5px solid var(--line-soft);
        }
        .d7-cat-row:last-child { border-bottom: 0; padding-bottom: 0; }
        .d7-cat-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--ink);
          letter-spacing: -0.005em;
        }
        .d7-cat-amt {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-size: 18px;
          letter-spacing: -0.01em;
          font-feature-settings: 'lnum', 'tnum';
          color: var(--ink);
        }
        .d7-cat-pct {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 14px;
          color: var(--ink-soft);
          width: 38px; text-align: right;
        }
        .d7-cat-bar {
          grid-column: 1 / -1;
          margin-top: 4px;
          height: 1.5px;
          background: var(--line-soft);
          border-radius: 1px;
          overflow: hidden;
        }
        .d7-cat-bar > span {
          display: block;
          height: 100%;
          background: var(--accent);
          border-radius: 1px;
        }

        /* Recent */
        .d7-recent {
          grid-column: span 5;
          grid-row: span 3;
          padding: 28px 30px;
          gap: 6px;
        }
        @media (max-width: 980px) { .d7-recent { grid-column: span 6; } }
        .d7-recent-head {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 8px;
        }
        .d7-recent-head h2 {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-size: 26px;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .d7-recent-head h2 em { font-style: italic; color: var(--accent); }
        .d7-recent-head a {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 14px;
          color: var(--accent);
          border-bottom: 0.5px solid var(--accent-soft);
          padding-bottom: 2px;
        }

        .d7-txn {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 0.5px solid var(--line-soft);
          align-items: baseline;
        }
        .d7-txn:last-child { border-bottom: 0; }
        .d7-txn-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .d7-txn-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--ink);
        }
        .d7-txn-cat {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 13px;
          color: var(--accent);
        }
        .d7-txn-sub {
          display: block;
          font-size: 12px;
          color: var(--ink-soft);
          margin-top: 3px;
          letter-spacing: 0.02em;
        }
        .d7-txn-amt {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-size: 18px;
          letter-spacing: -0.01em;
          font-feature-settings: 'lnum', 'tnum';
          color: var(--ink);
          align-self: center;
        }

        /* Bottom row */
        .d7-trend {
          grid-column: span 5;
          padding: 26px 30px 22px;
          gap: 4px;
        }
        @media (max-width: 980px) { .d7-trend { grid-column: span 6; } }
        .d7-trend-num {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 38px;
          letter-spacing: -0.025em;
          line-height: 1;
          font-feature-settings: 'lnum', 'tnum';
          color: var(--ink);
          margin-top: 4px;
        }
        .d7-trend-sub {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 14px;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .d7-trend-svg { width: 100%; height: 56px; display: block; margin-top: 8px; }

        .d7-merch {
          grid-column: span 4;
          padding: 26px 30px;
          gap: 6px;
        }
        @media (max-width: 980px) { .d7-merch { grid-column: span 4; } }
        @media (max-width: 720px) { .d7-merch { grid-column: span 6; } }
        .d7-merch-name {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(28px, 3vw, 36px);
          line-height: 1.05;
          letter-spacing: -0.025em;
          color: var(--ink);
          margin-top: 4px;
        }
        .d7-merch-amt {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-size: 22px;
          color: var(--accent);
          letter-spacing: -0.01em;
          font-feature-settings: 'tnum';
          margin-top: 4px;
        }
        .d7-merch-tag {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 13px;
          color: var(--ink-soft);
          margin-top: 6px;
        }

        .d7-review {
          grid-column: span 3;
          padding: 26px 30px;
          gap: 6px;
          align-items: flex-start;
        }
        @media (max-width: 980px) { .d7-review { grid-column: span 2; } }
        @media (max-width: 720px) { .d7-review { grid-column: span 6; } }
        .d7-review-num {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(56px, 7vw, 80px);
          line-height: 0.9;
          letter-spacing: -0.04em;
          color: var(--accent);
          margin-top: 2px;
        }
        .d7-review-link {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 15px;
          color: var(--ink);
          border-bottom: 0.5px solid var(--accent);
          padding-bottom: 2px;
          margin-top: 8px;
          align-self: flex-start;
        }
      `}</style>

      <div className="d7-shell">
        <header className="d7-head">
          <div className="d7-mark">FinLens.</div>
          <h1 className="d7-greet">
            A quiet account of <em>April</em> &mdash; for {MOCK.household.join(' &amp; ')}.
          </h1>
          <div className="d7-period"><span className="dot" /> {MOCK.month}</div>
        </header>

        <div className="d7-bento">
          <article className="d7-card d7-hero">
            <div className="d7-label">Spent · April 2026</div>
            <div className="d7-hero-num">
              ${Math.floor(MOCK.spent).toLocaleString()}
              <span className="cents">.{MOCK.spent.toFixed(2).split('.')[1]}</span>
            </div>
            <div className="d7-hero-meta">
              <span className="delta">{trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%</span>
              <span className="vs">upon ${fmtShort(MOCK.prevSpent)} in March</span>
            </div>
            <svg className="d7-hero-spark" viewBox="0 0 600 60" preserveAspectRatio="none">
              <path d={sparkPath(MOCK.series, 600, 60, 4, 6)} fill="none" stroke="var(--accent)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </article>

          <article className="d7-card d7-save">
            <div className="d7-label">Set aside</div>
            <div className="d7-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="var(--line)" strokeWidth="2" fill="none" />
                <circle
                  cx="50" cy="50" r="44"
                  stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={(1 - savePct) * 2 * Math.PI * 44}
                />
              </svg>
              <div className="d7-ring-c">
                <div>
                  <div className="d7-ring-pct">{Math.round(savePct * 100)}<span style={{fontSize:'0.5em',verticalAlign:'0.4em'}}>%</span></div>
                  <div className="d7-ring-sub">of goal</div>
                </div>
              </div>
            </div>
            <div className="d7-save-num">${fmtShort(MOCK.saved)}</div>
            <div className="d7-save-goal">of $5,000 — almost there.</div>
          </article>

          <article className="d7-card d7-cats">
            <div className="d7-cats-head">
              <h2>By <em>heading</em></h2>
              <span className="meta">{MOCK.categories.length} categories · ${fmtShort(MOCK.spent)}</span>
            </div>
            {MOCK.categories.map((c) => (
              <div className="d7-cat-row" key={c.name}>
                <span className="d7-cat-name">{c.name}</span>
                <span className="d7-cat-amt">${fmtShort(c.amount)}</span>
                <span className="d7-cat-pct">{(c.share * 100).toFixed(0)}%</span>
                <span className="d7-cat-bar"><span style={{ width: `${(c.amount / max) * 100}%` }} /></span>
              </div>
            ))}
          </article>

          <article className="d7-card d7-recent">
            <div className="d7-recent-head">
              <h2><em>Recent</em></h2>
              <a href="#">view all</a>
            </div>
            {MOCK.recent.slice(0, 7).map((t) => (
              <div className="d7-txn" key={t.merchant + t.date}>
                <div>
                  <div className="d7-txn-head">
                    <span className="d7-txn-name">{t.merchant}</span>
                    <span className="d7-txn-cat">— {t.category.toLowerCase()}</span>
                  </div>
                  <span className="d7-txn-sub">
                    {t.date}{t.note ? ` · ${t.note}` : ''}
                  </span>
                </div>
                <span className="d7-txn-amt">{fmt(t.amount)}</span>
              </div>
            ))}
          </article>

          <article className="d7-card d7-trend">
            <div className="d7-label">Last 30 days · <span className="accent">daily rhythm</span></div>
            <div className="d7-trend-num">${avg}<span style={{fontSize:'0.5em',color:'var(--ink-soft)',marginLeft:6,fontStyle:'italic'}}>/ day</span></div>
            <div className="d7-trend-sub">peak ${Math.max(...MOCK.series)} · quietest ${Math.min(...MOCK.series)}</div>
            <svg className="d7-trend-svg" viewBox="0 0 600 56" preserveAspectRatio="none">
              <path d={sparkPath(MOCK.series, 600, 56, 4, 4)} fill="none" stroke="var(--accent)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </article>

          <article className="d7-card d7-merch">
            <div className="d7-label">Largest single charge</div>
            <div className="d7-merch-name">{top.merchant}</div>
            <div className="d7-merch-amt">{fmt(top.amount)}</div>
            <div className="d7-merch-tag">— {top.category.toLowerCase()}, {top.note ?? top.date}</div>
          </article>

          <article className="d7-card d7-review">
            <div className="d7-label">Awaiting review</div>
            <div className="d7-review-num">{MOCK.needsReview}</div>
            <a className="d7-review-link" href="#">classify them →</a>
          </article>
        </div>
      </div>
    </div>
  );
}
