import { MOCK, fmt, fmtShort } from './mock';

const PALETTE = [
  '#f7c873', '#f0a48a', '#a3c990', '#8fbcd4', '#cdb5e0', '#f4b8c2', '#dfc999', '#7fb6a8'
];

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

function sparkArea(values: number[], width: number, height: number, padX = 4, padY = 6): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = width - padX * 2;
  const h = height - padY * 2;
  const span = max - min || 1;
  const points = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * w;
    const y = padY + h - ((v - min) / span) * h;
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const last = points[points.length - 1];
  const first = points[0];
  return `${path} L ${last[0].toFixed(1)} ${height - padY} L ${first[0].toFixed(1)} ${height - padY} Z`;
}

export function Design6() {
  const trend = ((MOCK.spent - MOCK.prevSpent) / MOCK.prevSpent) * 100;
  const total = MOCK.categories.reduce((s, c) => s + c.amount, 0);
  const goal = 5000;
  const savePct = Math.min(1, MOCK.saved / goal);

  let acc = 0;
  const stops: string[] = [];
  MOCK.categories.forEach((c, i) => {
    const start = (acc / total) * 360;
    acc += c.amount;
    const end = (acc / total) * 360;
    stops.push(`${PALETTE[i % PALETTE.length]} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
  });
  const conic = `conic-gradient(from -90deg, ${stops.join(', ')})`;

  const top = MOCK.categories[0];
  const topMerchant = MOCK.recent[0];

  return (
    <div className="d6-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        .d6-page {
          --bg: #f3efe8;
          --card: #ffffff;
          --ink: #1c1c19;
          --dim: #6e6c66;
          --line: #ece6da;
          --butter: #fdedb8;
          --butter-ink: #6b4e10;
          --peach: #ffd4be;
          --peach-ink: #8b3f1f;
          --sage: #d6e8c8;
          --sage-ink: #3a6b2f;
          --blush: #fbd0db;
          --blush-ink: #9a3850;
          --sky: #cbe3ed;
          --sky-ink: #2d5b6a;
          --stone: #ece6da;
          --stone-ink: #5a554b;
          min-height: 100vh; width: 100%;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 400;
          padding: 28px 32px 56px;
          letter-spacing: -0.005em;
        }
        @media (max-width: 720px) { .d6-page { padding: 20px 16px 56px; } }

        .d6-shell { max-width: 1320px; margin: 0 auto; }

        .d6-head {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 24px; flex-wrap: wrap;
          margin-bottom: 22px;
        }
        .d6-greet {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-variation-settings: 'opsz' 96;
          font-weight: 500;
          font-size: clamp(28px, 3.6vw, 40px);
          line-height: 1.05;
          letter-spacing: -0.025em;
          margin: 0;
        }
        .d6-greet span { color: var(--dim); font-weight: 300; }
        .d6-period {
          display: inline-flex; align-items: center; gap: 12px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 8px 8px 18px;
          font-size: 14px; font-weight: 500;
        }
        .d6-period .arrow {
          width: 30px; height: 30px;
          border-radius: 50%; background: var(--bg);
          display: grid; place-items: center;
          color: var(--dim);
          font-size: 14px;
        }
        .d6-period .arrow.active { background: var(--ink); color: var(--bg); }

        .d6-bento {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(0, auto);
          gap: 18px;
        }
        @media (max-width: 980px) { .d6-bento { grid-template-columns: repeat(6, 1fr); } }
        @media (max-width: 640px) { .d6-bento { grid-template-columns: 1fr; } }

        .d6-card {
          background: var(--card);
          border-radius: 24px;
          padding: 26px 28px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }
        .d6-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--dim);
          margin: 0;
        }
        .d6-num {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-variation-settings: 'opsz' 96;
          font-weight: 500;
          font-size: clamp(38px, 4.6vw, 56px);
          line-height: 1;
          letter-spacing: -0.035em;
          font-feature-settings: 'lnum', 'tnum';
          margin: 0;
        }
        .d6-num small { font-weight: 400; font-size: 0.55em; color: var(--dim); }

        /* Hero */
        .d6-hero {
          grid-column: span 8;
          grid-row: span 2;
          background: var(--butter);
          color: var(--butter-ink);
          padding: 32px;
          gap: 14px;
        }
        @media (max-width: 980px) { .d6-hero { grid-column: span 6; } }
        .d6-hero .d6-label { color: rgba(107, 78, 16, 0.7); }
        .d6-hero-num {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-variation-settings: 'opsz' 96;
          font-weight: 500;
          font-size: clamp(64px, 9vw, 110px);
          line-height: 0.95;
          letter-spacing: -0.045em;
          font-feature-settings: 'lnum', 'tnum';
          margin: -2px 0 0;
        }
        .d6-hero-num .cents { font-weight: 400; opacity: 0.45; font-size: 0.55em; letter-spacing: -0.02em; }
        .d6-hero-row {
          display: flex; align-items: center; gap: 12px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .d6-trend-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(107, 78, 16, 0.12);
          color: var(--butter-ink);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 13px; font-weight: 600;
        }
        .d6-trend-pill.up { background: rgba(154, 56, 80, 0.14); color: #9a3850; }
        .d6-hero-vs { font-size: 14px; color: rgba(107, 78, 16, 0.7); font-weight: 500; }
        .d6-hero-spark {
          margin-top: auto;
          width: 100%;
          height: 80px;
          display: block;
        }

        /* Save ring */
        .d6-save {
          grid-column: span 4;
          grid-row: span 2;
          background: var(--peach);
          color: var(--peach-ink);
          padding: 28px;
          align-items: center; justify-content: center;
          text-align: center;
          gap: 16px;
        }
        @media (max-width: 980px) { .d6-save { grid-column: span 6; } }
        .d6-save .d6-label { color: rgba(139, 63, 31, 0.7); align-self: stretch; text-align: left; }
        .d6-ring {
          position: relative;
          width: min(100%, 180px);
          aspect-ratio: 1; margin: 0 auto;
        }
        .d6-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .d6-ring-c {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          font-family: 'Bricolage Grotesque', sans-serif;
        }
        .d6-ring-pct { font-size: 32px; font-weight: 600; letter-spacing: -0.03em; }
        .d6-ring-sub { font-size: 12px; color: rgba(139, 63, 31, 0.7); margin-top: 2px; }
        .d6-save-num { font-size: 28px; font-weight: 500; letter-spacing: -0.03em; font-feature-settings: 'lnum', 'tnum'; line-height: 1; }
        .d6-save-goal { font-size: 13px; color: rgba(139, 63, 31, 0.7); font-weight: 500; }

        /* Categories */
        .d6-cats {
          grid-column: span 7;
          grid-row: span 3;
          background: var(--card);
          gap: 18px;
          padding: 28px;
        }
        @media (max-width: 980px) { .d6-cats { grid-column: span 6; } }
        .d6-cats-head { display: flex; justify-content: space-between; align-items: baseline; }
        .d6-cats-head h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 500;
          font-size: 22px;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .d6-cats-meta { font-size: 13px; color: var(--dim); font-weight: 500; }

        .d6-cats-body {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 28px;
          align-items: center;
        }
        @media (max-width: 720px) { .d6-cats-body { grid-template-columns: 1fr; gap: 20px; } }

        .d6-donut-wrap { display: grid; place-items: center; }
        .d6-donut {
          width: 180px; height: 180px;
          border-radius: 50%;
          background: ${conic};
          position: relative;
          display: grid; place-items: center;
        }
        .d6-donut::after {
          content: '';
          position: absolute;
          inset: 22%;
          background: var(--card);
          border-radius: 50%;
        }
        .d6-donut-c {
          position: relative; z-index: 1;
          text-align: center;
          font-family: 'Bricolage Grotesque', sans-serif;
        }
        .d6-donut-c .v {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.02em;
          font-feature-settings: 'lnum', 'tnum';
        }
        .d6-donut-c .l { font-size: 10px; color: var(--dim); letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }

        .d6-cat-list { display: flex; flex-direction: column; gap: 4px; }
        .d6-cat-row {
          display: grid;
          grid-template-columns: 14px 1fr auto auto;
          align-items: center;
          gap: 12px;
          padding: 7px 0;
        }
        .d6-cat-dot { width: 12px; height: 12px; border-radius: 4px; }
        .d6-cat-name { font-size: 14px; font-weight: 500; color: var(--ink); }
        .d6-cat-amt { font-size: 14px; font-weight: 600; font-feature-settings: 'tnum'; }
        .d6-cat-pct { font-size: 12px; color: var(--dim); font-weight: 500; width: 38px; text-align: right; }

        /* Recent */
        .d6-recent {
          grid-column: span 5;
          grid-row: span 3;
          background: var(--stone);
          color: var(--stone-ink);
          gap: 12px;
          padding: 26px 22px;
        }
        @media (max-width: 980px) { .d6-recent { grid-column: span 6; } }
        .d6-recent-head { display: flex; justify-content: space-between; align-items: baseline; padding: 0 6px; }
        .d6-recent-head h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 500;
          font-size: 20px;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0;
        }
        .d6-recent-head a { font-size: 12px; color: var(--dim); font-weight: 600; letter-spacing: 0.04em; }

        .d6-txn-list { display: flex; flex-direction: column; gap: 0; }
        .d6-txn {
          display: grid;
          grid-template-columns: 36px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 9px 6px;
          border-bottom: 1px solid rgba(0,0,0,0.045);
        }
        .d6-txn:last-child { border-bottom: 0; }
        .d6-txn-icon {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: grid; place-items: center;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .d6-txn-meta { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .d6-txn-name {
          font-size: 14px; font-weight: 600; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .d6-txn-sub {
          font-size: 12px; color: var(--dim); font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .d6-txn-amt {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 15px; font-weight: 600;
          font-feature-settings: 'tnum'; color: var(--ink);
          letter-spacing: -0.02em;
        }

        /* Bottom row */
        .d6-trend {
          grid-column: span 5;
          background: var(--sage);
          color: var(--sage-ink);
          padding: 24px 26px;
          gap: 8px;
        }
        @media (max-width: 980px) { .d6-trend { grid-column: span 6; } }
        .d6-trend .d6-label { color: rgba(58, 107, 47, 0.75); }
        .d6-trend-row { display: flex; align-items: baseline; gap: 14px; }
        .d6-trend-num {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 500; font-size: 32px;
          letter-spacing: -0.03em;
          font-feature-settings: 'lnum', 'tnum';
        }
        .d6-trend-sub { font-size: 13px; font-weight: 500; color: rgba(58, 107, 47, 0.7); }
        .d6-trend-svg { width: 100%; height: 70px; display: block; margin-top: 6px; }

        .d6-merch {
          grid-column: span 4;
          background: var(--blush);
          color: var(--blush-ink);
          padding: 24px 26px;
          gap: 6px;
        }
        @media (max-width: 980px) { .d6-merch { grid-column: span 4; } }
        @media (max-width: 720px) { .d6-merch { grid-column: span 6; } }
        .d6-merch .d6-label { color: rgba(154, 56, 80, 0.75); }
        .d6-merch-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 500;
          font-size: clamp(24px, 2.6vw, 30px);
          letter-spacing: -0.025em;
          line-height: 1.1;
        }
        .d6-merch-amt {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 500; font-size: 22px;
          letter-spacing: -0.02em;
          font-feature-settings: 'tnum';
          margin-top: 4px;
        }
        .d6-merch-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(154, 56, 80, 0.12);
          padding: 4px 10px; border-radius: 999px;
          font-size: 12px; font-weight: 600;
          margin-top: 10px;
          width: fit-content;
        }

        .d6-review {
          grid-column: span 3;
          background: var(--sky);
          color: var(--sky-ink);
          padding: 24px 26px;
          gap: 8px;
        }
        @media (max-width: 980px) { .d6-review { grid-column: span 2; } }
        @media (max-width: 720px) { .d6-review { grid-column: span 6; } }
        .d6-review .d6-label { color: rgba(45, 91, 106, 0.75); }
        .d6-review-num {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 500; font-size: 56px;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .d6-review-btn {
          align-self: flex-start;
          background: var(--sky-ink);
          color: var(--sky);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
          margin-top: 6px;
          border: 0; cursor: pointer;
        }
      `}</style>

      <div className="d6-shell">
        <header className="d6-head">
          <h1 className="d6-greet">
            Hi {MOCK.household[0]} <span>&amp; {MOCK.household[1]},</span>
            <br />
            here&rsquo;s your April.
          </h1>
          <div className="d6-period">
            <span className="arrow">‹</span>
            <span>April 2026</span>
            <span className="arrow active">›</span>
          </div>
        </header>

        <div className="d6-bento">
          <article className="d6-card d6-hero">
            <div className="d6-label">Spent this month</div>
            <div className="d6-hero-num">
              ${Math.floor(MOCK.spent).toLocaleString()}
              <span className="cents">.{MOCK.spent.toFixed(2).split('.')[1]}</span>
            </div>
            <div className="d6-hero-row">
              <span className={`d6-trend-pill ${trend > 0 ? 'up' : ''}`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="d6-hero-vs">vs ${fmtShort(MOCK.prevSpent)} in March</span>
            </div>
            <svg className="d6-hero-spark" viewBox="0 0 600 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="d6-grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6b4e10" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6b4e10" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={sparkArea(MOCK.series, 600, 80, 4, 6)} fill="url(#d6-grad)" />
              <path d={sparkPath(MOCK.series, 600, 80, 4, 6)} fill="none" stroke="#6b4e10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </article>

          <article className="d6-card d6-save">
            <div className="d6-label">Saved this month</div>
            <div className="d6-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(139,63,31,0.18)" strokeWidth="9" fill="none" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="#8b3f1f" strokeWidth="9" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={(1 - savePct) * 2 * Math.PI * 42}
                />
              </svg>
              <div className="d6-ring-c">
                <div>
                  <div className="d6-ring-pct">{Math.round(savePct * 100)}%</div>
                  <div className="d6-ring-sub">of $5,000 goal</div>
                </div>
              </div>
            </div>
            <div className="d6-save-num">${fmtShort(MOCK.saved)}</div>
            <div className="d6-save-goal">${fmtShort(goal - MOCK.saved)} to go</div>
          </article>

          <article className="d6-card d6-cats">
            <div className="d6-cats-head">
              <h2>Where it went</h2>
              <span className="d6-cats-meta">{MOCK.categories.length} categories</span>
            </div>
            <div className="d6-cats-body">
              <div className="d6-donut-wrap">
                <div className="d6-donut">
                  <div className="d6-donut-c">
                    <div className="l">Total</div>
                    <div className="v">${fmtShort(MOCK.spent)}</div>
                  </div>
                </div>
              </div>
              <div className="d6-cat-list">
                {MOCK.categories.map((c, i) => (
                  <div className="d6-cat-row" key={c.name}>
                    <span className="d6-cat-dot" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="d6-cat-name">{c.name}</span>
                    <span className="d6-cat-amt">${fmtShort(c.amount)}</span>
                    <span className="d6-cat-pct">{(c.share * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="d6-card d6-recent">
            <div className="d6-recent-head">
              <h2>Recent</h2>
              <a href="#">View all →</a>
            </div>
            <div className="d6-txn-list">
              {MOCK.recent.slice(0, 6).map((t) => {
                const idx = MOCK.categories.findIndex((c) => c.name === t.category);
                const color = PALETTE[(idx >= 0 ? idx : 0) % PALETTE.length];
                return (
                  <div className="d6-txn" key={t.merchant + t.date}>
                    <div className="d6-txn-icon" style={{ background: color }}>{t.merchant.charAt(0)}</div>
                    <div className="d6-txn-meta">
                      <div className="d6-txn-name">{t.merchant}</div>
                      <div className="d6-txn-sub">{t.category} · {t.date}</div>
                    </div>
                    <div className="d6-txn-amt">{fmt(t.amount)}</div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="d6-card d6-trend">
            <div className="d6-label">Last 30 days</div>
            <div className="d6-trend-row">
              <span className="d6-trend-num">${Math.round(MOCK.series.reduce((s, v) => s + v, 0) / MOCK.series.length)}</span>
              <span className="d6-trend-sub">avg / day · peak ${Math.max(...MOCK.series)}</span>
            </div>
            <svg className="d6-trend-svg" viewBox="0 0 600 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="d6-sage-grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3a6b2f" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3a6b2f" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={sparkArea(MOCK.series, 600, 70, 4, 6)} fill="url(#d6-sage-grad)" />
              <path d={sparkPath(MOCK.series, 600, 70, 4, 6)} fill="none" stroke="#3a6b2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </article>

          <article className="d6-card d6-merch">
            <div className="d6-label">Top spend this month</div>
            <div className="d6-merch-name">{topMerchant.merchant}</div>
            <div className="d6-merch-amt">{fmt(topMerchant.amount)}</div>
            <span className="d6-merch-tag">{topMerchant.category} · {topMerchant.note ?? topMerchant.date}</span>
          </article>

          <article className="d6-card d6-review">
            <div className="d6-label">Needs review</div>
            <div className="d6-review-num">{MOCK.needsReview}</div>
            <button className="d6-review-btn">Sort them →</button>
          </article>
        </div>
      </div>
    </div>
  );
}
