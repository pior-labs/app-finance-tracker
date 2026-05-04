import { MOCK, fmt, fmtShort } from './mock';

const PALETTE = [
  { name: 'sage', soft: '#dbe5c9', mid: '#a9c08c', deep: '#5d7a4e' },
  { name: 'blush', soft: '#f6d6cf', mid: '#e8a597', deep: '#a85a4c' },
  { name: 'butter', soft: '#f6e3a8', mid: '#e6c66c', deep: '#9a7c1f' },
  { name: 'sky', soft: '#cfe1e6', mid: '#94bcc6', deep: '#456e78' },
  { name: 'lilac', soft: '#dfd3ea', mid: '#b89dcc', deep: '#5e3f7a' },
  { name: 'peach', soft: '#fadcc1', mid: '#eeb582', deep: '#a55f24' },
  { name: 'mint', soft: '#cfe6dc', mid: '#9ac4b3', deep: '#4a7e6c' },
  { name: 'rose', soft: '#f3cad4', mid: '#dd92a3', deep: '#9a3a52' }
];

export function Design3() {
  const trend = ((MOCK.spent - MOCK.prevSpent) / MOCK.prevSpent) * 100;
  const total = MOCK.categories.reduce((s, c) => s + c.amount, 0);

  let acc = 0;
  const stops: string[] = [];
  MOCK.categories.forEach((c, i) => {
    const start = (acc / total) * 360;
    acc += c.amount;
    const end = (acc / total) * 360;
    const color = PALETTE[i % PALETTE.length].mid;
    stops.push(`${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
  });
  const conic = `conic-gradient(from -90deg, ${stops.join(', ')})`;

  return (
    <div className="d3-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,30..100;1,9..144,300..700,30..100&family=Manrope:wght@300;400;500;600;700&family=Caveat:wght@400;600&display=swap');

        .d3-page {
          --bg: #faf6ee;
          --card: #ffffff;
          --ink: #2a2a23;
          --dim: #79786c;
          --line: #ece5d3;
          min-height: 100vh; width: 100%;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Manrope', system-ui, sans-serif;
          font-weight: 400;
          padding: 36px 40px 80px;
          position: relative;
          overflow-x: hidden;
        }
        @media (max-width: 720px) { .d3-page { padding: 24px 18px 60px; } }

        .d3-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.55; pointer-events: none; z-index: 0; }
        .d3-b1 { width: 520px; height: 520px; background: #dbe5c9; top: -120px; right: -120px; }
        .d3-b2 { width: 460px; height: 460px; background: #f6d6cf; top: 320px; left: -180px; }
        .d3-b3 { width: 380px; height: 380px; background: #f6e3a8; bottom: -120px; right: 10%; }

        .d3-shell { max-width: 1240px; margin: 0 auto; position: relative; z-index: 1; }

        .d3-hello {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }
        .d3-hello .greet {
          font-family: 'Fraunces', serif;
          font-variation-settings: 'opsz' 144, 'SOFT' 100;
          font-weight: 300;
          font-style: italic;
          font-size: clamp(34px, 5.2vw, 56px);
          line-height: 1.05;
          letter-spacing: -0.01em;
        }
        .d3-hello .greet b { font-style: normal; font-weight: 500; color: #5d7a4e; }
        .d3-hello .date {
          font-family: 'Caveat', cursive;
          font-size: 22px;
          color: #9a7c1f;
          transform: rotate(-2deg);
          transform-origin: right;
        }

        .d3-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 22px;
          align-items: stretch;
        }
        @media (max-width: 980px) { .d3-grid { grid-template-columns: 1fr; } }

        .d3-card {
          background: var(--card);
          border-radius: 28px;
          padding: 28px;
          border: 1px solid var(--line);
          box-shadow: 0 1px 0 rgba(0,0,0,0.02), 0 24px 48px -32px rgba(80, 70, 40, 0.18);
        }

        .d3-hero {
          background: linear-gradient(150deg, #dbe5c9 0%, #faf6ee 60%, #f6d6cf 110%);
          border-radius: 32px;
          padding: 36px;
          border: 1px solid var(--line);
          position: relative;
          overflow: hidden;
        }
        .d3-hero::before {
          content: ''; position: absolute; right: -40px; top: -40px; width: 220px; height: 220px;
          background: #f6e3a8; border-radius: 50%; opacity: 0.5;
          filter: blur(20px);
        }
        .d3-hero-eyebrow {
          font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: #5d7a4e; font-weight: 600;
        }
        .d3-hero-num {
          font-family: 'Fraunces', serif;
          font-variation-settings: 'opsz' 144, 'SOFT' 80;
          font-weight: 300;
          font-size: clamp(72px, 12vw, 132px);
          line-height: 0.92;
          letter-spacing: -0.04em;
          margin: 6px 0 6px;
          font-feature-settings: 'lnum', 'tnum';
        }
        .d3-hero-num small { font-size: 0.42em; color: #79786c; vertical-align: 1.3em; font-weight: 400; }
        .d3-hero-msg {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 19px;
          color: #4a4a40;
          max-width: 460px;
          line-height: 1.45;
        }
        .d3-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.7);
          border: 1px solid #cbd6b9;
          color: #5d7a4e;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
          margin-top: 18px;
        }
        .d3-pill .leaf { width: 10px; height: 10px; background: #8fa97d; border-radius: 0 50% 0 50%; transform: rotate(45deg); }

        .d3-side { display: grid; grid-template-rows: auto auto; gap: 22px; }
        .d3-side-card .label {
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--dim); font-weight: 600;
        }
        .d3-side-card .v {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 44px;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-top: 6px;
        }
        .d3-side-card .sub {
          font-family: 'Caveat', cursive;
          font-size: 18px;
          color: #9a7c1f;
          margin-top: 4px;
        }

        .d3-progress {
          margin-top: 12px;
          height: 10px; border-radius: 999px; background: #ece5d3; overflow: hidden;
        }
        .d3-progress > span { display: block; height: 100%; background: linear-gradient(90deg, #a9c08c, #5d7a4e); border-radius: 999px; }

        .d3-cats { margin-top: 28px; }
        .d3-cats .h {
          display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px;
        }
        .d3-cats .h h2 {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 30px;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .d3-cats .h .note {
          font-family: 'Caveat', cursive;
          color: #c97c6e;
          font-size: 18px;
          transform: rotate(-1.5deg);
        }

        .d3-cats-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 36px;
          align-items: center;
        }
        @media (max-width: 880px) { .d3-cats-grid { grid-template-columns: 1fr; } }

        .d3-donut-wrap { display: flex; justify-content: center; align-items: center; padding: 12px; }
        .d3-donut {
          width: 280px; height: 280px;
          border-radius: 50%;
          background: ${conic};
          position: relative;
          display: grid; place-items: center;
          box-shadow: inset 0 0 0 6px #faf6ee;
        }
        .d3-donut::after {
          content: '';
          position: absolute;
          inset: 24%;
          background: var(--card);
          border-radius: 50%;
          box-shadow: 0 8px 24px -8px rgba(0,0,0,0.08);
        }
        .d3-donut-c {
          position: relative; z-index: 1; text-align: center;
          font-family: 'Fraunces', serif;
        }
        .d3-donut-c .label { font-family: 'Manrope', sans-serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); font-weight: 600; }
        .d3-donut-c .v { font-size: 30px; font-weight: 500; margin-top: 2px; letter-spacing: -0.01em; }
        .d3-donut-c .s { font-style: italic; color: #79786c; font-size: 14px; }

        .d3-cat-list { display: grid; gap: 8px; }
        .d3-cat-item {
          display: grid;
          grid-template-columns: 14px 1fr auto auto;
          align-items: center;
          gap: 12px;
          padding: 10px 4px;
          border-bottom: 1px dashed #e2dac6;
        }
        .d3-cat-item:last-child { border-bottom: 0; }
        .d3-swatch {
          width: 14px; height: 14px;
          border-radius: 4px 14px 4px 14px;
        }
        .d3-cat-name { font-weight: 500; font-size: 15px; }
        .d3-cat-amt { font-family: 'Fraunces', serif; font-weight: 500; font-size: 16px; font-feature-settings: 'tnum'; }
        .d3-cat-pct { color: var(--dim); font-size: 13px; width: 42px; text-align: right; }

        .d3-bottom { display: grid; grid-template-columns: 1.4fr 1fr; gap: 22px; margin-top: 22px; }
        @media (max-width: 980px) { .d3-bottom { grid-template-columns: 1fr; } }

        .d3-recent .h2 {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 26px;
          margin: 0 0 18px;
        }
        .d3-txn {
          display: grid;
          grid-template-columns: 36px 1fr auto;
          align-items: center;
          gap: 14px;
          padding: 12px 6px;
          border-bottom: 1px dashed #e2dac6;
        }
        .d3-txn:last-child { border-bottom: 0; }
        .d3-txn-mono {
          width: 36px; height: 36px; border-radius: 50%;
          display: grid; place-items: center;
          font-family: 'Fraunces', serif; font-style: italic; font-weight: 500; font-size: 16px;
          color: #fff;
        }
        .d3-txn-meta { display: flex; flex-direction: column; gap: 2px; }
        .d3-txn-merchant { font-weight: 500; font-size: 15px; }
        .d3-txn-tag { font-size: 12px; color: var(--dim); display: flex; gap: 8px; align-items: center; }
        .d3-txn-amt { font-family: 'Fraunces', serif; font-weight: 500; font-size: 17px; font-feature-settings: 'tnum'; }

        .d3-savings { display: flex; flex-direction: column; gap: 6px; }
        .d3-pot {
          width: 100%; aspect-ratio: 1.3 / 1;
          background: radial-gradient(ellipse at 50% 30%, #f6e3a8 0%, #e6c66c 35%, #b89a3e 75%, #7a6020 100%);
          border-radius: 10% 10% 50% 50% / 6% 6% 30% 30%;
          position: relative;
          margin: 14px auto 0;
          max-width: 240px;
          box-shadow: inset 0 -16px 22px rgba(0,0,0,0.18), 0 24px 32px -16px rgba(122, 96, 32, 0.4);
        }
        .d3-pot::before {
          content: '';
          position: absolute; left: 0; right: 0; top: -10px; height: 22px;
          background: #b89a3e;
          border-radius: 50%;
          box-shadow: inset 0 -4px 6px rgba(0,0,0,0.25);
        }
        .d3-pot::after {
          content: '🌿';
          position: absolute; left: 50%; top: -38px; transform: translateX(-50%);
          font-size: 38px;
          filter: drop-shadow(0 2px 4px rgba(80, 70, 40, 0.25));
        }
        .d3-savings-num {
          font-family: 'Fraunces', serif; font-weight: 400; font-size: 38px; letter-spacing: -0.02em;
          line-height: 1;
        }
        .d3-savings-label {
          font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--dim); font-weight: 600;
        }
        .d3-savings-note {
          font-family: 'Caveat', cursive; color: #5d7a4e; font-size: 19px; margin-top: 8px; transform: rotate(-1deg); transform-origin: left;
        }
      `}</style>

      <div className="d3-blob d3-b1" />
      <div className="d3-blob d3-b2" />
      <div className="d3-blob d3-b3" />

      <div className="d3-shell">
        <div className="d3-hello">
          <div className="greet">
            Good evening, <b>{MOCK.household[0]} &amp; {MOCK.household[1]}.</b><br />
            Here&rsquo;s how April unfolded.
          </div>
          <div className="date">— a quiet, blooming month ✿</div>
        </div>

        <div className="d3-grid">
          <section className="d3-hero">
            <div className="d3-hero-eyebrow">Spent in {MOCK.month}</div>
            <div className="d3-hero-num">${fmtShort(MOCK.spent)}<small></small></div>
            <p className="d3-hero-msg">
              A little above last month — mostly the airfare to Lisbon. Your everyday rhythm is steady,
              and your reserve is still growing nicely.
            </p>
            <div className="d3-pill"><span className="leaf" /> +{trend.toFixed(1)}% vs March · still on track</div>
          </section>

          <aside className="d3-side">
            <div className="d3-card d3-side-card">
              <div className="label">Saved this month</div>
              <div className="v">${fmtShort(MOCK.saved)}</div>
              <div className="d3-progress"><span style={{ width: `${Math.min(100, (MOCK.saved / 5000) * 100)}%` }} /></div>
              <div className="sub">of a $5,000 goal — almost there!</div>
            </div>
            <div className="d3-card d3-side-card">
              <div className="label">A few things to look at</div>
              <div className="v">{MOCK.needsReview} <span style={{ fontSize: 18, color: 'var(--dim)', fontStyle: 'italic' }}>uncategorized</span></div>
              <div className="sub">take a minute when you have one</div>
            </div>
          </aside>
        </div>

        <section className="d3-card d3-cats">
          <div className="h">
            <h2>Where it went</h2>
            <span className="note">a flower-shape of the month</span>
          </div>
          <div className="d3-cats-grid">
            <div className="d3-donut-wrap">
              <div className="d3-donut">
                <div className="d3-donut-c">
                  <div className="label">Total</div>
                  <div className="v">${fmtShort(MOCK.spent)}</div>
                  <div className="s">across {MOCK.categories.length} headings</div>
                </div>
              </div>
            </div>
            <div className="d3-cat-list">
              {MOCK.categories.map((c, i) => (
                <div className="d3-cat-item" key={c.name}>
                  <span className="d3-swatch" style={{ background: PALETTE[i % PALETTE.length].mid }} />
                  <span className="d3-cat-name">{c.name}</span>
                  <span className="d3-cat-amt">${fmtShort(c.amount)}</span>
                  <span className="d3-cat-pct">{(c.share * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="d3-bottom">
          <section className="d3-card d3-recent">
            <h3 className="h2">Recent</h3>
            {MOCK.recent.slice(0, 7).map((t, i) => {
              const idx = MOCK.categories.findIndex((c) => c.name === t.category);
              const color = PALETTE[(idx >= 0 ? idx : i) % PALETTE.length];
              return (
                <div className="d3-txn" key={t.merchant + t.date}>
                  <div className="d3-txn-mono" style={{ background: color.mid }}>
                    {t.merchant.charAt(0)}
                  </div>
                  <div className="d3-txn-meta">
                    <div className="d3-txn-merchant">{t.merchant}</div>
                    <div className="d3-txn-tag">
                      <span style={{ color: color.deep }}>● {t.category}</span>
                      <span>·</span>
                      <span>{t.date}</span>
                      {t.note ? <><span>·</span><span style={{ fontStyle: 'italic' }}>{t.note}</span></> : null}
                    </div>
                  </div>
                  <div className="d3-txn-amt">{fmt(t.amount)}</div>
                </div>
              );
            })}
          </section>

          <aside className="d3-card d3-savings">
            <div className="d3-savings-label">A growing thing</div>
            <div className="d3-savings-num">${fmtShort(MOCK.saved)}</div>
            <div className="d3-savings-note">tucked away — kept warm.</div>
            <div className="d3-pot" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 13, color: 'var(--dim)' }}>
              <span>{MOCK.transactions} entries · {MOCK.month}</span>
              <span style={{ fontFamily: 'Caveat, cursive', color: '#c97c6e', fontSize: 16 }}>see you in May ✿</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
