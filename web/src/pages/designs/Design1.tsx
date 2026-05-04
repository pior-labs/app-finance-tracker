import { MOCK, fmt, fmtShort } from './mock';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export function Design1() {
  const trend = ((MOCK.spent - MOCK.prevSpent) / MOCK.prevSpent) * 100;
  const top = MOCK.categories[0];

  return (
    <div className="d1-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..900,30..100&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=JetBrains+Mono:wght@400;500&display=swap');

        .d1-page {
          --ink: #1d1a16;
          --paper: #f3ead4;
          --paper-deep: #ebe0c2;
          --rule: #1d1a16;
          --oxblood: #7a1d1d;
          --gold: #a07a2c;
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(ellipse at 20% 10%, rgba(122, 29, 29, 0.04), transparent 50%),
            repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.012) 3px 4px),
            var(--paper);
          color: var(--ink);
          font-family: 'Newsreader', Georgia, serif;
          font-feature-settings: 'lnum', 'tnum';
          padding: 48px 64px 96px;
        }
        @media (max-width: 768px) { .d1-page { padding: 24px 20px 64px; } }

        .d1-page::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0);
          background-size: 3px 3px;
          opacity: 0.18;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 0;
        }

        .d1-shell { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; }

        .d1-folio {
          display: flex; justify-content: space-between; align-items: flex-end;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--ink);
        }
        .d1-folio span { display: inline-block; }

        .d1-masthead {
          text-align: center;
          padding: 28px 0 18px;
          border-bottom: 4px double var(--ink);
          margin-bottom: 6px;
        }
        .d1-mast-title {
          font-family: 'Fraunces', serif;
          font-variation-settings: 'opsz' 144, 'SOFT' 30;
          font-weight: 600;
          font-size: clamp(56px, 12vw, 148px);
          line-height: 0.88;
          letter-spacing: -0.04em;
          margin: 0;
          font-style: italic;
        }
        .d1-mast-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase;
          margin-top: 14px;
          color: var(--ink);
        }
        .d1-mast-sub em { color: var(--oxblood); font-style: normal; }

        .d1-rule-thin { height: 1px; background: var(--ink); margin: 0; }
        .d1-rule-double { border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); height: 4px; margin: 0; }

        .d1-deck {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: 10px 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
          border-bottom: 1px solid var(--ink);
        }

        .d1-headline {
          padding: 36px 0 28px;
          text-align: center;
          border-bottom: 1px solid var(--ink);
        }
        .d1-eye {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase;
          color: var(--oxblood);
        }
        .d1-h1 {
          font-family: 'Fraunces', serif;
          font-variation-settings: 'opsz' 144;
          font-weight: 400;
          font-size: clamp(40px, 6vw, 72px);
          line-height: 1.0;
          letter-spacing: -0.02em;
          margin: 14px 0 12px;
        }
        .d1-h1-sub {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(18px, 2vw, 22px);
          color: #4a423a;
          max-width: 720px; margin: 0 auto;
        }

        .d1-grid {
          display: grid;
          grid-template-columns: 1.05fr 1px 1.6fr 1px 1.05fr;
          gap: 0;
          margin-top: 28px;
        }
        @media (max-width: 1024px) {
          .d1-grid { grid-template-columns: 1fr; }
          .d1-grid .d1-vrule { display: none; }
        }
        .d1-vrule { background: var(--ink); }
        .d1-col { padding: 22px 26px; }
        .d1-col + .d1-col { padding-top: 22px; }
        @media (max-width: 1024px) { .d1-col { border-top: 1px solid var(--ink); } }

        .d1-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.36em; text-transform: uppercase;
          color: var(--ink);
          padding-bottom: 8px;
          border-bottom: 1px solid var(--ink);
          margin-bottom: 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .d1-section-label::before {
          content: '§'; color: var(--oxblood); font-family: 'Fraunces', serif; font-size: 16px; letter-spacing: 0; margin-right: 6px;
        }

        .d1-kpi { margin-bottom: 24px; }
        .d1-kpi-num {
          font-family: 'Fraunces', serif;
          font-variation-settings: 'opsz' 144;
          font-weight: 300;
          font-size: clamp(46px, 5.5vw, 68px);
          line-height: 0.95;
          letter-spacing: -0.03em;
          font-feature-settings: 'lnum', 'tnum';
        }
        .d1-kpi-num sup {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: var(--oxblood);
          vertical-align: top;
          margin-left: 4px;
        }
        .d1-kpi-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: #4a423a;
          margin-top: 4px;
        }
        .d1-kpi-trend {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 14px;
          color: var(--oxblood);
          margin-top: 6px;
        }

        .d1-editorial {
          font-family: 'Newsreader', serif;
          font-size: 17px;
          line-height: 1.55;
          column-count: 2; column-gap: 28px;
          text-align: justify;
          hyphens: auto;
        }
        @media (max-width: 720px) { .d1-editorial { column-count: 1; } }
        .d1-editorial p { margin: 0 0 14px; }
        .d1-dropcap::first-letter {
          font-family: 'Fraunces', serif;
          font-variation-settings: 'opsz' 144;
          font-weight: 700;
          font-size: 72px;
          line-height: 0.88;
          float: left;
          margin: 6px 8px 0 0;
          color: var(--oxblood);
        }

        .d1-pullquote {
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
          padding: 18px 4px;
          margin: 18px 0;
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 22px;
          line-height: 1.25;
          letter-spacing: -0.01em;
          break-inside: avoid;
          column-span: all;
          text-align: center;
          color: #2a2620;
        }
        .d1-pullquote::before, .d1-pullquote::after {
          content: '— ✦ —'; display: block; font-style: normal;
          color: var(--gold);
          font-size: 12px; letter-spacing: 0.4em; margin: 6px 0;
        }

        .d1-cat { display: flex; align-items: baseline; gap: 12px; padding: 9px 0; border-bottom: 1px dotted #8a7e5e; }
        .d1-cat:last-child { border-bottom: 0; }
        .d1-cat-rank {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 14px;
          color: var(--oxblood);
          width: 28px; flex: none;
        }
        .d1-cat-name {
          font-family: 'Newsreader', serif;
          font-size: 17px;
          font-weight: 400;
          flex: 1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .d1-cat-leader {
          flex: 1;
          border-bottom: 1px dotted #8a7e5e;
          margin: 0 6px 5px;
          height: 1px;
        }
        .d1-cat-amt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }
        .d1-cat-share {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 12px;
          color: #6b6358;
          width: 44px; text-align: right; flex: none;
        }

        .d1-recent { width: 100%; border-collapse: collapse; }
        .d1-recent th {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
          font-weight: 400;
          padding: 6px 8px;
          border-bottom: 1px solid var(--ink);
          text-align: left;
          color: #4a423a;
        }
        .d1-recent th:last-child { text-align: right; }
        .d1-recent td {
          padding: 10px 8px;
          font-family: 'Newsreader', serif;
          font-size: 15px;
          border-bottom: 1px dotted #8a7e5e;
          vertical-align: baseline;
        }
        .d1-recent td.amt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-variant-numeric: tabular-nums;
          text-align: right;
          font-weight: 500;
        }
        .d1-recent td .merchant { font-weight: 600; }
        .d1-recent td .note { display: block; font-style: italic; color: #6b6358; font-size: 13px; margin-top: 1px; }
        .d1-recent td .cat-pill {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--oxblood);
          border: 1px solid var(--oxblood);
          padding: 1px 6px;
          margin-left: 6px;
          vertical-align: middle;
          border-radius: 1px;
        }

        .d1-ornament {
          text-align: center;
          font-family: 'Fraunces', serif;
          font-size: 18px;
          letter-spacing: 0.6em;
          color: var(--gold);
          margin: 28px 0 18px;
        }

        .d1-foot {
          display: flex; justify-content: space-between;
          padding-top: 18px;
          margin-top: 10px;
          border-top: 4px double var(--ink);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
        }
      `}</style>

      <div className="d1-shell">
        <div className="d1-folio">
          <span>The Ledger · No. 23</span>
          <span>Vol. III</span>
          <span>Established MMXXIV · Montréal</span>
          <span>{MOCK.month}</span>
          <span>Free to the household</span>
        </div>

        <header className="d1-masthead">
          <h1 className="d1-mast-title">The&nbsp;Ledger</h1>
          <div className="d1-mast-sub">
            A monthly account of the <em>{MOCK.household.join(' &amp; ')}</em> household
          </div>
        </header>
        <div className="d1-deck">
          <span>Weather: Mild · Markets: Steady</span>
          <span>Edition I</span>
          <span>{MOCK.transactions} entries · {MOCK.needsReview} pending</span>
        </div>

        <section className="d1-headline">
          <div className="d1-eye">·  Front Page  ·  The Monthly Brief  ·</div>
          <h2 className="d1-h1">A Spring of Modest Indulgence,<br/>A Vacation Budgeted</h2>
          <p className="d1-h1-sub">
            On the household&rsquo;s spending in <em>{MOCK.month}</em>, with particular notice paid to a
            single Iberian airfare and the slow ascent of grocery sums.
          </p>
        </section>

        <div className="d1-grid">
          <aside className="d1-col">
            <div className="d1-section-label"><span>Headline Numbers</span><span>i.</span></div>

            <div className="d1-kpi">
              <div className="d1-kpi-num">${fmtShort(MOCK.spent)}<sup>USD</sup></div>
              <div className="d1-kpi-label">Spent in {MOCK.month.split(' ')[0]}</div>
              <div className="d1-kpi-trend">▲ {trend.toFixed(1)}% upon March, against ${fmtShort(MOCK.prevSpent)}</div>
            </div>

            <div className="d1-kpi">
              <div className="d1-kpi-num">{MOCK.transactions}</div>
              <div className="d1-kpi-label">Entries Posted</div>
            </div>

            <div className="d1-kpi">
              <div className="d1-kpi-num">{MOCK.needsReview}</div>
              <div className="d1-kpi-label">Awaiting Review</div>
              <div className="d1-kpi-trend">to be classed by hand at the editor&rsquo;s convenience.</div>
            </div>

            <div className="d1-kpi">
              <div className="d1-kpi-num">${fmtShort(MOCK.saved)}</div>
              <div className="d1-kpi-label">Set Aside</div>
            </div>
          </aside>

          <div className="d1-vrule" />

          <article className="d1-col">
            <div className="d1-section-label"><span>From the Desk of the Editor</span><span>ii.</span></div>
            <div className="d1-editorial">
              <p className="d1-dropcap">
                Reckoning the month&rsquo;s outlays produces, as ever, a pleasant kind of small surprise.
                The household closed {MOCK.month} at <strong>${fmtShort(MOCK.spent)}</strong>, an
                advance of {trend.toFixed(1)} per cent upon the prior period&rsquo;s figure. The advance
                is wholly accounted for by a single charge from <em>Air Canada</em>, recorded against
                the heading <em>Travel</em>, in the sum of $642.18 — a fare to Lisbon long anticipated.
              </p>
              <p>
                Setting that singular line aside, the ordinary expenditures of the household held to
                their custom: groceries continued to occupy second place at <strong>${fmtShort(top.amount > MOCK.categories[1].amount ? MOCK.categories[1].amount : top.amount)}</strong>,
                with restaurants and the small recurring subscriptions following in their accustomed order.
              </p>
              <div className="d1-pullquote">
                &ldquo;A vacation, properly entered into the books, ceases to be an extravagance and
                becomes simply a category.&rdquo;
              </div>
              <p>
                Of <strong>{MOCK.transactions}</strong> entries posted this month, {MOCK.needsReview} remain
                without a heading and await the editor&rsquo;s attention; among them, two charges from a
                single uncategorised merchant deserve a word.
              </p>
              <p>
                The household&rsquo;s reserve, set aside against future months, stands at
                <strong> ${fmtShort(MOCK.saved)}</strong>. The figure is satisfactory and, with steady
                hand, may yet underwrite a second journey before the year is out.
              </p>
            </div>
          </article>

          <div className="d1-vrule" />

          <aside className="d1-col">
            <div className="d1-section-label"><span>Spending by Heading</span><span>iii.</span></div>

            {MOCK.categories.map((c, i) => (
              <div className="d1-cat" key={c.name}>
                <span className="d1-cat-rank">{ROMAN[i] ?? i + 1}.</span>
                <span className="d1-cat-name">{c.name}</span>
                <span className="d1-cat-leader" />
                <span className="d1-cat-amt">${fmtShort(c.amount)}</span>
                <span className="d1-cat-share">{(c.share * 100).toFixed(1)}%</span>
              </div>
            ))}
          </aside>
        </div>

        <div className="d1-ornament">❦ &nbsp;·&nbsp; ❦ &nbsp;·&nbsp; ❦</div>

        <section style={{ marginTop: 8 }}>
          <div className="d1-section-label"><span>Recent Entries — A Selection</span><span>iv.</span></div>
          <table className="d1-recent">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>Date</th>
                <th>Merchant &amp; Note</th>
                <th>Heading</th>
                <th style={{ width: '14%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {MOCK.recent.map((t) => (
                <tr key={t.merchant + t.date}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.06em' }}>{t.date.toUpperCase()}</td>
                  <td>
                    <span className="merchant">{t.merchant}</span>
                    {t.note ? <span className="note">— {t.note}</span> : null}
                  </td>
                  <td><span className="cat-pill">{t.category}</span></td>
                  <td className="amt">{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="d1-foot">
          <span>© MMXXVI · Printed at home</span>
          <span>A FinLens Publication</span>
          <span>Next edition: 1 June</span>
        </footer>
      </div>
    </div>
  );
}
