import { MOCK, fmt, fmtShort } from './mock';

export function Design5() {
  const trend = ((MOCK.spent - MOCK.prevSpent) / MOCK.prevSpent) * 100;
  const monogram = MOCK.household.map((n) => n.charAt(0)).join('');

  return (
    <div className="d5-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter+Tight:wght@200;300;400;500;600&display=swap');

        .d5-page {
          --bg: #0e1117;
          --bg-2: #131820;
          --line: #2a2e36;
          --ink: #f0e6d2;
          --dim: #8a8270;
          --dimmer: #5d574a;
          --brass: #c9a472;
          --brass-deep: #8b6f3a;
          --brass-light: #e6cf9b;
          --wine: #6f1f2a;
          min-height: 100vh; width: 100%;
          background:
            radial-gradient(ellipse at 80% 0%, rgba(201,164,114,0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 0% 100%, rgba(111,31,42,0.08) 0%, transparent 50%),
            var(--bg);
          color: var(--ink);
          font-family: 'Inter Tight', sans-serif;
          font-weight: 300;
          letter-spacing: 0.01em;
          padding: 0;
          position: relative;
          overflow-x: hidden;
        }
        .d5-page::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          opacity: 0.4;
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: overlay;
        }

        .d5-shell { position: relative; z-index: 2; max-width: 1320px; margin: 0 auto; padding: 28px 56px 80px; }
        @media (max-width: 720px) { .d5-shell { padding: 20px 22px 60px; } }

        .d5-top {
          display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
          padding: 8px 0 14px;
          border-bottom: 0.5px solid var(--brass-deep);
          gap: 24px;
        }
        .d5-top .l, .d5-top .r {
          font-family: 'Inter Tight', sans-serif;
          font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase;
          color: var(--brass);
          font-weight: 400;
        }
        .d5-top .r { text-align: right; }
        .d5-top .c {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 18px;
          color: var(--ink);
        }
        .d5-top .c b { color: var(--brass); font-style: normal; font-weight: 500; letter-spacing: 0.04em; }

        .d5-mast {
          display: grid;
          grid-template-columns: 1fr 4fr;
          gap: 32px;
          align-items: stretch;
          margin-top: 64px;
        }
        @media (max-width: 980px) { .d5-mast { grid-template-columns: 1fr; gap: 24px; } }

        .d5-vert {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-family: 'Inter Tight', sans-serif;
          font-size: 11px; letter-spacing: 0.6em; text-transform: uppercase;
          color: var(--brass);
          font-weight: 500;
          padding-left: 8px;
          align-self: stretch;
          border-right: 0.5px solid var(--brass-deep);
          padding-right: 12px;
          display: flex; align-items: center; justify-content: space-between;
        }
        @media (max-width: 980px) { .d5-vert { writing-mode: horizontal-tb; transform: none; border-right: 0; border-bottom: 0.5px solid var(--brass-deep); padding: 0 0 12px; flex-direction: row; } }
        .d5-vert .a, .d5-vert .b { display: block; }

        .d5-hero { display: flex; flex-direction: column; gap: 18px; }
        .d5-eye {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 22px;
          color: var(--brass);
          letter-spacing: -0.01em;
        }
        .d5-bigtitle {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(64px, 11vw, 152px);
          line-height: 0.92;
          letter-spacing: -0.025em;
          margin: 0;
          color: var(--ink);
        }
        .d5-bigtitle em { font-style: italic; font-weight: 300; color: var(--brass-light); }
        .d5-deck {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 22px;
          line-height: 1.4;
          color: var(--dim);
          max-width: 580px;
          margin-top: 6px;
        }

        .d5-meta {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 56px;
          border-top: 0.5px solid var(--line);
          border-bottom: 0.5px solid var(--line);
        }
        @media (max-width: 720px) { .d5-meta { grid-template-columns: repeat(2, 1fr); } }
        .d5-meta > div {
          padding: 24px 22px;
          border-right: 0.5px solid var(--line);
        }
        .d5-meta > div:last-child { border-right: 0; }
        @media (max-width: 720px) {
          .d5-meta > div:nth-child(2n) { border-right: 0; }
          .d5-meta > div:nth-child(1), .d5-meta > div:nth-child(2) { border-bottom: 0.5px solid var(--line); }
        }
        .d5-meta-l {
          font-family: 'Inter Tight', sans-serif;
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: var(--brass); font-weight: 400;
        }
        .d5-meta-v {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: 38px;
          letter-spacing: -0.01em;
          margin-top: 4px;
          color: var(--ink);
          font-feature-settings: 'lnum';
        }
        .d5-meta-v small { font-size: 14px; color: var(--dim); margin-left: 4px; vertical-align: 8px; }
        .d5-meta-s {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: var(--dim);
          margin-top: 4px;
        }

        .d5-rule {
          display: flex; align-items: center; justify-content: center;
          padding: 36px 0 20px;
          color: var(--brass);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 16px;
          letter-spacing: 0.4em;
        }
        .d5-rule::before, .d5-rule::after {
          content: ''; flex: 1; height: 0.5px; background: linear-gradient(90deg, transparent, var(--brass-deep), transparent);
        }
        .d5-rule span { padding: 0 28px; }

        .d5-cats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 56px;
        }
        @media (max-width: 880px) { .d5-cats { grid-template-columns: 1fr; gap: 0; } }

        .d5-cat {
          display: grid;
          grid-template-columns: 22px 1fr 110px 50px;
          align-items: baseline;
          gap: 14px;
          padding: 16px 0;
          border-bottom: 0.5px solid var(--line);
        }
        .d5-cat:hover { background: linear-gradient(90deg, rgba(201,164,114,0.05), transparent); }
        .d5-cat-num {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 16px;
          color: var(--brass);
        }
        .d5-cat-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: 24px;
          letter-spacing: -0.01em;
        }
        .d5-cat-name small {
          font-family: 'Inter Tight', sans-serif;
          font-style: normal;
          font-size: 11px;
          letter-spacing: 0.16em;
          color: var(--dim);
          margin-left: 12px;
          text-transform: uppercase;
          font-weight: 300;
        }
        .d5-cat-amt {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: 22px;
          text-align: right;
          color: var(--ink);
          font-feature-settings: 'lnum', 'tnum';
        }
        .d5-cat-pct {
          font-family: 'Inter Tight', sans-serif;
          font-size: 11px;
          color: var(--brass);
          text-align: right;
          letter-spacing: 0.04em;
          font-weight: 400;
        }

        .d5-recent { margin-top: 8px; }
        .d5-recent table { width: 100%; border-collapse: collapse; }
        .d5-recent thead th {
          font-family: 'Inter Tight', sans-serif;
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: var(--brass); font-weight: 400;
          padding: 14px 10px;
          border-bottom: 0.5px solid var(--brass-deep);
          text-align: left;
        }
        .d5-recent thead th:last-child { text-align: right; }
        .d5-recent tbody td {
          padding: 18px 10px;
          border-bottom: 0.5px solid var(--line);
          vertical-align: baseline;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: 18px;
        }
        .d5-recent tbody td.date {
          font-family: 'Inter Tight', sans-serif;
          font-size: 11px; letter-spacing: 0.18em;
          color: var(--dim); text-transform: uppercase;
          width: 110px;
        }
        .d5-recent tbody td .m { color: var(--ink); }
        .d5-recent tbody td .n {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: var(--dim);
          display: block; margin-top: 2px;
        }
        .d5-recent tbody td.cat {
          font-family: 'Inter Tight', sans-serif;
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--brass); font-weight: 400;
          width: 160px;
        }
        .d5-recent tbody td.amt {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: 20px;
          text-align: right;
          color: var(--ink);
          font-feature-settings: 'lnum', 'tnum';
          width: 140px;
        }

        .d5-foot {
          margin-top: 56px;
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 28px;
          padding-top: 28px;
          border-top: 0.5px solid var(--brass-deep);
        }
        .d5-foot .l, .d5-foot .r {
          font-family: 'Inter Tight', sans-serif;
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: var(--dim); font-weight: 400;
        }
        .d5-foot .r { text-align: right; }
        .d5-monogram {
          display: grid; place-items: center;
          width: 84px; height: 84px;
          border: 0.5px solid var(--brass);
          border-radius: 50%;
          color: var(--brass-light);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 500;
          font-size: 36px;
          letter-spacing: -0.04em;
          background: radial-gradient(circle at 30% 25%, rgba(230, 207, 155, 0.15), transparent 60%);
          box-shadow: inset 0 0 0 6px rgba(255,255,255,0.02);
          position: relative;
        }
        .d5-monogram::before {
          content: ''; position: absolute; inset: -8px; border: 0.5px solid var(--brass-deep); border-radius: 50%;
        }

        .d5-flag {
          margin-top: 30px;
          padding: 26px 28px;
          background: linear-gradient(135deg, rgba(201,164,114,0.08), rgba(111,31,42,0.06));
          border: 0.5px solid var(--brass-deep);
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 28px;
          align-items: center;
        }
        .d5-flag .ico {
          width: 36px; height: 36px; border-radius: 50%;
          border: 0.5px solid var(--brass);
          display: grid; place-items: center;
          color: var(--brass);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 500;
          font-size: 24px;
        }
        .d5-flag .t {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 22px;
          line-height: 1.35;
          color: var(--ink);
        }
        .d5-flag .t b { color: var(--brass-light); font-weight: 500; font-style: normal; }
        .d5-flag .a {
          font-family: 'Inter Tight', sans-serif;
          font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--brass); font-weight: 400;
          padding: 10px 16px;
          border: 0.5px solid var(--brass);
        }
      `}</style>

      <div className="d5-shell">
        <div className="d5-top">
          <div className="l">ATELIER · FINLENS</div>
          <div className="c">Vol. III &nbsp;·&nbsp; <b>Édition d&rsquo;Avril MMXXVI</b> &nbsp;·&nbsp; Rapport Privé</div>
          <div className="r">Maison {MOCK.household.join(' &amp; ')}</div>
        </div>

        <div className="d5-mast">
          <div className="d5-vert">
            <span className="a">RÉGISTRE PRIVÉ</span>
            <span className="b">№ XXIII</span>
          </div>
          <div className="d5-hero">
            <div className="d5-eye">— A monthly account, in confidence,</div>
            <h1 className="d5-bigtitle">Avril, <em>en chiffres.</em></h1>
            <p className="d5-deck">
              The household&rsquo;s outlays for the period closing on the thirtieth of April, two
              thousand and twenty-six — composed in confidence, set in lead, and rendered for the
              private review of its principals.
            </p>
          </div>
        </div>

        <div className="d5-meta">
          <div>
            <div className="d5-meta-l">Total Outflow</div>
            <div className="d5-meta-v">${fmtShort(MOCK.spent)}<small>USD</small></div>
            <div className="d5-meta-s">+{trend.toFixed(2)}% upon March</div>
          </div>
          <div>
            <div className="d5-meta-l">Entries Posted</div>
            <div className="d5-meta-v">{MOCK.transactions}</div>
            <div className="d5-meta-s">across four custodial accounts</div>
          </div>
          <div>
            <div className="d5-meta-l">Awaiting Classification</div>
            <div className="d5-meta-v">{MOCK.needsReview}</div>
            <div className="d5-meta-s">at your considered leisure</div>
          </div>
          <div>
            <div className="d5-meta-l">Capital Conserved</div>
            <div className="d5-meta-v">${fmtShort(MOCK.saved)}</div>
            <div className="d5-meta-s">a {Math.round((MOCK.saved / MOCK.income) * 100)}% retention rate</div>
          </div>
        </div>

        <div className="d5-rule">
          <span>I &nbsp; · &nbsp; By heading</span>
        </div>

        <section className="d5-cats">
          {MOCK.categories.map((c, i) => (
            <div className="d5-cat" key={c.name}>
              <span className="d5-cat-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="d5-cat-name">
                {c.name}
                <small>{c.count} entries</small>
              </span>
              <span className="d5-cat-amt">${fmtShort(c.amount)}</span>
              <span className="d5-cat-pct">{(c.share * 100).toFixed(1)}%</span>
            </div>
          ))}
        </section>

        <div className="d5-flag">
          <div className="ico">‽</div>
          <div className="t">
            <b>Note of consequence.</b>&nbsp; A single airfare to Lisbon — Air&nbsp;Canada,
            $642.18 — accounts for the month&rsquo;s upward movement. Outside this entry, the
            household&rsquo;s ordinary expenditures were composed.
          </div>
          <div className="a">Acknowledge ↗</div>
        </div>

        <div className="d5-rule">
          <span>II &nbsp; · &nbsp; A selection of recent entries</span>
        </div>

        <section className="d5-recent">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Heading</th>
                <th>Sum</th>
              </tr>
            </thead>
            <tbody>
              {MOCK.recent.map((t) => (
                <tr key={t.merchant + t.date}>
                  <td className="date">{t.date}</td>
                  <td>
                    <span className="m">{t.merchant}</span>
                    {t.note ? <span className="n">&mdash; {t.note}</span> : null}
                  </td>
                  <td className="cat">— {t.category}</td>
                  <td className="amt">{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="d5-foot">
          <div className="l">Composed at home · Set in Cormorant &amp; Inter Tight</div>
          <div className="d5-monogram">{monogram}</div>
          <div className="r">Held in confidence · MMXXVI</div>
        </footer>
      </div>
    </div>
  );
}
