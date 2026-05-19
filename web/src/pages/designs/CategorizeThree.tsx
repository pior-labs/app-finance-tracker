import { useState } from 'react';
import { Link } from 'react-router-dom';
import { categorizeMock, money } from './mockData';

/**
 * SWISS — The archivist's desk. Stark editorial grid, hairline borders,
 * Helvetica Neue, single forest-green accent. Treat each tx as a specimen card.
 */
export function CategorizeThree() {
  const [queue, setQueue] = useState(categorizeMock.queue);
  const [confirmed, setConfirmed] = useState(categorizeMock.justConfirmed);
  const current = queue[0] ?? null;
  const remaining = queue.length;
  const sortedCount = categorizeMock.alreadyCategorized + (categorizeMock.queue.length - queue.length);
  const totalToSort = categorizeMock.totalTransactions;
  const pct = Math.round((sortedCount / totalToSort) * 100);

  function assign(cat: string) {
    if (!current) return;
    setConfirmed((prev) => [
      { merchant: current.merchant, category: cat, amount: current.amount, when: timestamp() },
      ...prev,
    ].slice(0, 8));
    setQueue((prev) => prev.slice(1));
  }

  function timestamp() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  function skip() {
    setQueue((prev) => prev.length > 1 ? [...prev.slice(1), prev[0]] : prev);
  }
  function back() {
    setQueue((prev) => prev.length > 1 ? [prev[prev.length - 1], ...prev.slice(0, -1)] : prev);
  }

  return (
    <div className="swiss-cat-root">
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <style>{SWISS_CAT_CSS}</style>

      <div className="swiss-frame">
        {/* SIDEBAR */}
        <aside className="swiss-side">
          <Link to="/" className="s-brand">
            <span className="s-logo">FL</span>
            <span className="s-brand-text">finlens</span>
          </Link>
          <nav className="s-nav">
            <Link to="/3" className="sn"><span className="sn-num">01</span><span>Dashboard</span></Link>
            <Link to="/categorize/3" className="sn active">
              <span className="sn-num">02</span><span>Categorize</span>
              <span className="sn-badge">{remaining}</span>
            </Link>
          </nav>
          <div className="s-section-label">— ADMIN</div>
          <nav className="s-nav">
            <Link to="/transactions" className="sn"><span className="sn-num">03</span><span>Transactions</span></Link>
            <Link to="/categories" className="sn"><span className="sn-num">04</span><span>Categories</span></Link>
            <Link to="/statements" className="sn"><span className="sn-num">05</span><span>Statements</span></Link>
          </nav>

          <div className="s-profile">
            <span className="s-av">P</span>
            <div>
              <div className="s-pname">Piotr</div>
              <div className="s-pmeta">ACCOUNT ⌄</div>
            </div>
          </div>
        </aside>

        <main className="swiss-main">
          {/* RUNNING HEADER — like a printed page */}
          <header className="s-running">
            <div className="run-left">
              <div className="run-section">SECTION C</div>
              <div className="run-title">Categorize / Workflow</div>
            </div>
            <div className="run-center">
              <div className="run-folio">— folio 02 / 05 —</div>
            </div>
            <div className="run-right">
              <span className="run-date">2026 · MAY · 19</span>
              <span className="run-time">{timestamp()}</span>
            </div>
          </header>

          {/* TITLE BLOCK */}
          <section className="title-block">
            <div className="tb-grid">
              <div className="tb-display">
                <div className="tb-no">№<span>{String(categorizeMock.totalUncategorized).padStart(2, '0')}</span></div>
                <h1 className="tb-h">Unfiled<br/>specimens.</h1>
              </div>
              <div className="tb-stats">
                <div className="stat-block">
                  <div className="sb-label">REMAINING</div>
                  <div className="sb-num">{remaining}</div>
                </div>
                <div className="stat-block">
                  <div className="sb-label">FILED THIS SESSION</div>
                  <div className="sb-num">{confirmed.length}</div>
                </div>
                <div className="stat-block">
                  <div className="sb-label">ARCHIVE COMPLETION</div>
                  <div className="sb-num">{pct}<span className="sb-pct">%</span></div>
                  <div className="sb-bar"><div className="sb-fill" style={{ width: `${pct}%` }} /></div>
                </div>
              </div>
            </div>
          </section>

          <hr className="rule-thick" />

          {/* SPECIMEN CARD + INDEX */}
          <section className="work-grid">
            {/* LEFT: Specimen card */}
            <div className="specimen-col">
              <div className="col-cap"><span className="cap-tag">A</span> SPECIMEN UNDER REVIEW</div>

              {current ? (
                <article className="specimen">
                  <div className="spec-header">
                    <div className="spec-id">
                      <div className="spec-label">CATALOG #</div>
                      <div className="spec-value">{String(current.id).padStart(6, '0')}</div>
                    </div>
                    <div className="spec-date">
                      <div className="spec-label">RECORDED</div>
                      <div className="spec-value">{current.date}</div>
                    </div>
                    <div className="spec-type">
                      <div className="spec-label">TYPE</div>
                      <div className="spec-value">{current.type.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="spec-amount-row">
                    <div className="spec-amt-label">VALUE</div>
                    <div className="spec-amt">
                      <span className="amt-sign">{current.type === 'credit' ? '+' : '−'}</span>
                      <span className="amt-curr">$</span>
                      <span className="amt-int">{Math.floor(current.amount / 100).toLocaleString()}</span>
                      <span className="amt-dec">.{String(current.amount % 100).padStart(2, '0')}</span>
                    </div>
                  </div>

                  <div className="spec-merchant">
                    <div className="spec-label">MERCHANT</div>
                    <div className="merchant-name">{current.merchant}</div>
                  </div>

                  <div className="spec-field">
                    <div className="spec-label">DESCRIPTION (RAW)</div>
                    <div className="spec-raw">{current.rawDescription}</div>
                  </div>

                  <div className="spec-field-row">
                    <div className="spec-field-half">
                      <div className="spec-label">INSTRUMENT</div>
                      <div className="spec-value">{current.card}</div>
                    </div>
                    {current.location && (
                      <div className="spec-field-half">
                        <div className="spec-label">LOCATION</div>
                        <div className="spec-value">{current.location}</div>
                      </div>
                    )}
                  </div>

                  <div className="spec-classify">
                    <div className="classify-label">PROPOSED CLASSIFICATION</div>
                    <button onClick={() => assign(current.suggested ?? 'Other')} className="classify-btn">
                      <span className="cls-bracket">[</span>
                      {current.suggested}
                      <span className="cls-bracket">]</span>
                      <span className="cls-action">ACCEPT ↵</span>
                    </button>
                  </div>

                  <div className="spec-actions">
                    <button onClick={back} className="spec-btn">← PREV</button>
                    <button onClick={skip} className="spec-btn">DEFER →</button>
                    <button className="spec-btn">UNDO LAST</button>
                  </div>
                </article>
              ) : (
                <div className="archive-empty">
                  <div className="ae-line" />
                  <div className="ae-text">— ARCHIVE COMPLETE —</div>
                  <div className="ae-line" />
                  <p>All specimens have been filed.</p>
                </div>
              )}

              <div className="col-footer">QUEUE PEEK</div>
              <div className="queue-peek">
                {queue.slice(1, 5).map((t, i) => (
                  <div key={t.id} className="qp-line">
                    <span className="qp-num">{String(i + 2).padStart(2, '0')}</span>
                    <span className="qp-name">{t.merchant}</span>
                    <span className="qp-amt">{money(t.amount, { showCents: false })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Category index */}
            <div className="index-col">
              <div className="col-cap"><span className="cap-tag">B</span> CLASSIFICATION INDEX</div>

              <div className="index-head">
                <span>CODE</span>
                <span>CATEGORY</span>
                <span>USAGE</span>
              </div>

              <div className="index-list">
                {categorizeMock.favorites.map((c, i) => (
                  <button key={c} onClick={() => assign(c)} className="index-row">
                    <span className="ir-code">{String(i === 9 ? 0 : i + 1).padStart(2, '0')}</span>
                    <span className="ir-name">{c}</span>
                    <span className="ir-bar">
                      <span className="ir-bar-fill" style={{ width: `${100 - i * 7}%` }} />
                    </span>
                    <span className="ir-pick">PICK →</span>
                  </button>
                ))}
              </div>

              <button className="all-cats-btn">
                <span>OPEN FULL CATALOG (20)</span>
                <span>→</span>
              </button>

              <div className="col-footer">KEYBOARD</div>
              <div className="keys-table">
                <div className="kt-row"><kbd>1</kbd>–<kbd>9</kbd> <kbd>0</kbd><span>Assign favorite</span></div>
                <div className="kt-row"><kbd>←</kbd><span>Previous specimen</span></div>
                <div className="kt-row"><kbd>→</kbd><span>Defer to back</span></div>
                <div className="kt-row"><kbd>U</kbd><span>Undo last filing</span></div>
                <div className="kt-row"><kbd>↵</kbd><span>Accept proposed</span></div>
              </div>
            </div>
          </section>

          <hr className="rule-thick" />

          {/* LEDGER */}
          <section className="ledger">
            <div className="col-cap"><span className="cap-tag">C</span> SESSION LEDGER</div>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>TIME</th>
                  <th>MERCHANT</th>
                  <th>CATEGORY</th>
                  <th>AMOUNT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map((c, i) => (
                  <tr key={i}>
                    <td>{String(confirmed.length - i).padStart(3, '0')}</td>
                    <td className="mono">{c.when}</td>
                    <td>{c.merchant}</td>
                    <td><span className="cat-tag">{c.category}</span></td>
                    <td className="mono num">−{money(c.amount)}</td>
                    <td className="filed">✓ FILED</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ledger-footer">
              <span>END OF SESSION RECORD · {confirmed.length} ENTRIES</span>
              <span>—</span>
              <span>finlens / categorize / 03</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const SWISS_CAT_CSS = `
.swiss-cat-root {
  --bg: #fafaf7;
  --paper: #ffffff;
  --ink: #0a0a0a;
  --ink-2: #3a3a3a;
  --ink-3: #6e6e6e;
  --ink-4: #b0b0b0;
  --rule: #0a0a0a;
  --green: #1a7a4a;
  --green-soft: #e8f3ec;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  font-feature-settings: "ss01", "tnum";
}

.swiss-frame {
  display: grid; grid-template-columns: 200px 1fr; gap: 0;
  max-width: 1320px; margin: 0 auto;
  border-left: 1px solid var(--rule); border-right: 1px solid var(--rule);
  min-height: 100vh;
}

/* SIDEBAR */
.swiss-side {
  position: sticky; top: 0; align-self: start; height: 100vh; overflow-y: auto;
  border-right: 1px solid var(--rule);
  padding: 22px 18px 16px;
  display: flex; flex-direction: column; gap: 22px;
  background: var(--paper);
}
.s-brand { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid var(--rule); }
.s-logo {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  background: var(--ink); color: var(--paper);
  font-size: 12px; font-weight: 600; letter-spacing: -0.02em;
}
.s-brand-text { font-size: 18px; font-weight: 500; letter-spacing: -0.03em; }
.s-nav { display: flex; flex-direction: column; }
.sn {
  display: grid; grid-template-columns: 26px 1fr auto; gap: 8px; align-items: center;
  padding: 9px 6px; font-size: 13px; color: var(--ink-3);
  border-top: 1px solid #e4e4e0;
  transition: color 0.12s, background 0.12s;
}
.sn:first-child { border-top: none; }
.sn:hover { color: var(--ink); background: #f4f4f0; }
.sn.active { color: var(--ink); background: var(--green); }
.sn.active * { color: #fff; }
.sn-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--ink-4); letter-spacing: 0.05em; }
.sn-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  background: var(--green); color: var(--paper);
  padding: 2px 6px; letter-spacing: 0.05em;
}
.sn.active .sn-badge { background: var(--paper); color: var(--green); }
.s-section-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--ink-4); letter-spacing: 0.12em; padding: 0 6px; }
.s-profile {
  display: flex; align-items: center; gap: 10px;
  margin-top: auto; padding-top: 14px; border-top: 1px solid var(--rule);
}
.s-av {
  width: 32px; height: 32px; background: var(--green-soft); color: var(--green);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
}
.s-pname { font-size: 13px; font-weight: 500; }
.s-pmeta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--ink-4); letter-spacing: 0.1em; }

/* MAIN */
.swiss-main { display: flex; flex-direction: column; background: var(--paper); }

/* RUNNING HEADER */
.s-running {
  display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: center;
  padding: 14px 24px;
  border-bottom: 1px solid var(--rule);
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--ink-3);
}
.run-left { display: flex; gap: 14px; align-items: baseline; }
.run-section { color: var(--ink-4); }
.run-title { color: var(--ink); }
.run-center { text-align: center; color: var(--ink-4); }
.run-right { display: flex; gap: 14px; justify-content: flex-end; }
.run-time { color: var(--green); }

/* TITLE BLOCK */
.title-block { padding: 28px 24px 32px; }
.tb-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: end; }
.tb-display { display: flex; align-items: end; gap: 16px; }
.tb-no { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--ink-3); letter-spacing: 0.04em; padding-bottom: 8px; white-space: nowrap; }
.tb-no span { color: var(--ink); margin-left: 2px; }
.tb-h {
  font-size: 80px; line-height: 0.92; letter-spacing: -0.04em;
  font-weight: 500; margin: 0;
}
.tb-stats { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--rule); }
.stat-block { padding: 14px 16px 12px; border-right: 1px solid var(--rule); }
.stat-block:last-child { border-right: none; }
.sb-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.12em; color: var(--ink-3); margin-bottom: 4px; }
.sb-num { font-size: 36px; font-weight: 500; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.sb-pct { font-size: 18px; color: var(--ink-3); margin-left: 2px; }
.sb-bar { margin-top: 8px; height: 3px; background: #e4e4e0; }
.sb-fill { height: 100%; background: var(--green); }

.rule-thick { border: none; border-top: 2px solid var(--rule); margin: 0; }

/* WORK GRID */
.work-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
}
.col-cap {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--ink-3);
  padding: 10px 0;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 18px;
}
.cap-tag {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  background: var(--ink); color: var(--paper);
  font-size: 10px; font-weight: 600;
}

.col-footer {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--ink-3);
  padding: 14px 0 8px;
  border-top: 1px solid var(--rule);
  margin-top: 28px;
}

.specimen-col { padding: 18px 24px 32px; border-right: 1px solid var(--rule); }
.index-col { padding: 18px 24px 32px; }

/* SPECIMEN */
.specimen {
  background: var(--paper);
  display: flex; flex-direction: column; gap: 18px;
}
.spec-header {
  display: grid; grid-template-columns: 1.4fr 1fr 0.8fr; gap: 0;
  border: 1px solid var(--rule);
}
.spec-header > div { padding: 10px 12px; border-right: 1px solid var(--rule); }
.spec-header > div:last-child { border-right: none; }
.spec-label {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: 0.12em; color: var(--ink-3);
  margin-bottom: 4px;
}
.spec-value { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; }

.spec-amount-row {
  padding: 20px 16px; border: 1px solid var(--rule); border-top: 2px solid var(--rule);
  display: flex; flex-direction: column; gap: 6px;
}
.spec-amt-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.14em; color: var(--ink-3); }
.spec-amt {
  display: flex; align-items: baseline;
  font-variant-numeric: tabular-nums; font-weight: 500;
  letter-spacing: -0.03em;
}
.amt-sign { font-size: 52px; color: var(--ink-3); margin-right: 4px; }
.amt-curr { font-size: 28px; color: var(--ink-3); margin-right: 2px; align-self: flex-start; padding-top: 8px; }
.amt-int { font-size: 64px; line-height: 1; }
.amt-dec { font-size: 28px; color: var(--ink-3); margin-left: 2px; align-self: flex-start; padding-top: 12px; }

.spec-merchant { padding: 12px 16px; border: 1px solid var(--rule); border-top: none; }
.merchant-name { font-size: 28px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.1; }

.spec-field { padding: 10px 16px; border: 1px solid var(--rule); border-top: none; }
.spec-raw { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--ink-2); word-break: break-all; }

.spec-field-row { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--rule); border-top: none; }
.spec-field-half { padding: 10px 12px; border-right: 1px solid var(--rule); }
.spec-field-half:last-child { border-right: none; }

.spec-classify {
  padding: 14px 16px;
  background: var(--green);
  color: var(--paper);
  border: 1px solid var(--rule); border-top: none;
  display: flex; flex-direction: column; gap: 10px;
}
.classify-label {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: 0.14em; opacity: 0.75;
}
.classify-btn {
  display: flex; align-items: center; gap: 10px;
  background: transparent; color: var(--paper);
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 24px; font-weight: 500; letter-spacing: -0.02em;
  cursor: pointer; text-align: left;
  transition: opacity 0.15s;
}
.classify-btn:hover { opacity: 0.85; }
.cls-bracket { opacity: 0.5; font-weight: 300; }
.cls-action { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.14em; opacity: 0.85; }

.spec-actions {
  display: flex; gap: 0;
  border: 1px solid var(--rule); border-top: none;
}
.spec-btn {
  flex: 1; padding: 11px 12px;
  background: var(--paper); color: var(--ink-2);
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 0.12em; text-align: center;
  border-right: 1px solid var(--rule);
  cursor: pointer; transition: background 0.12s, color 0.12s;
}
.spec-btn:last-child { border-right: none; }
.spec-btn:hover { background: var(--ink); color: var(--paper); }

/* QUEUE PEEK */
.queue-peek { display: flex; flex-direction: column; }
.qp-line {
  display: grid; grid-template-columns: 32px 1fr auto; gap: 10px;
  padding: 8px 4px; border-bottom: 1px dotted var(--ink-4);
  font-size: 13px;
}
.qp-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink-4); }
.qp-name { color: var(--ink-2); }
.qp-amt { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--ink-3); }

/* INDEX */
.index-head {
  display: grid; grid-template-columns: 50px 1fr 100px; gap: 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: 0.14em; color: var(--ink-3);
  padding: 6px 0; border-bottom: 1px solid var(--rule);
}
.index-list { display: flex; flex-direction: column; }
.index-row {
  display: grid; grid-template-columns: 50px 1fr 100px auto; gap: 10px;
  align-items: center;
  padding: 11px 0; border-bottom: 1px solid #e4e4e0;
  text-align: left; cursor: pointer;
  transition: background 0.12s;
}
.index-row:hover { background: var(--green-soft); padding-left: 8px; padding-right: 8px; margin: 0 -8px; }
.ir-code { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--ink-4); letter-spacing: 0.05em; }
.index-row:hover .ir-code { color: var(--green); }
.ir-name { font-size: 15px; font-weight: 500; letter-spacing: -0.01em; }
.ir-bar { display: block; height: 3px; background: #e4e4e0; position: relative; }
.ir-bar-fill { position: absolute; left: 0; top: 0; height: 100%; background: var(--ink); }
.index-row:hover .ir-bar-fill { background: var(--green); }
.ir-pick {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 0.12em; color: var(--ink-4);
  opacity: 0; transition: opacity 0.12s;
}
.index-row:hover .ir-pick { opacity: 1; color: var(--green); }

.all-cats-btn {
  display: flex; justify-content: space-between; align-items: center; width: 100%;
  padding: 12px 14px; margin-top: 16px;
  background: var(--paper);
  border: 1px solid var(--rule);
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 0.14em; text-align: left;
  cursor: pointer; transition: all 0.12s;
}
.all-cats-btn:hover { background: var(--ink); color: var(--paper); }

.keys-table { display: flex; flex-direction: column; }
.kt-row {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 0; border-bottom: 1px dotted var(--ink-4);
  font-size: 12px; color: var(--ink-2);
}
.kt-row kbd {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 5px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  background: var(--paper); border: 1px solid var(--rule);
}
.kt-row span { margin-left: 6px; color: var(--ink-3); }

/* LEDGER */
.ledger { padding: 22px 24px 32px; }
.ledger-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ledger-table thead th {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: 0.14em; color: var(--ink-3);
  text-align: left; padding: 8px 12px;
  border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  background: #fafaf7;
}
.ledger-table tbody td {
  padding: 10px 12px; border-bottom: 1px solid #e4e4e0;
}
.ledger-table .mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.ledger-table .num { font-variant-numeric: tabular-nums; }
.cat-tag {
  display: inline-block; padding: 2px 8px;
  background: var(--green-soft); color: var(--green);
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.filed { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; color: var(--green); text-align: right; }

.ledger-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0 0; margin-top: 8px;
  border-top: 2px solid var(--rule);
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 0.12em; color: var(--ink-3);
}

.archive-empty {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 80px 20px; text-align: center;
}
.ae-line { width: 60px; height: 1px; background: var(--ink); }
.ae-text { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; }
.archive-empty p { color: var(--ink-3); font-size: 13px; }
`;
