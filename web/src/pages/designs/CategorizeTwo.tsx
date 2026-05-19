import { useState } from 'react';
import { Link } from 'react-router-dom';
import { categorizeMock, money } from './mockData';

/**
 * GLASS — A focused night console. Dark glassmorphism, vibrant accents,
 * a single-card spotlight with categories laid out as a category console below.
 */
export function CategorizeTwo() {
  const [queue, setQueue] = useState(categorizeMock.queue);
  const [confirmed, setConfirmed] = useState(categorizeMock.justConfirmed);
  const [hoverCat, setHoverCat] = useState<string | null>(null);
  const current = queue[0] ?? null;
  const remaining = queue.length;
  const sortedCount = categorizeMock.alreadyCategorized + (categorizeMock.queue.length - queue.length);
  const totalToSort = categorizeMock.totalTransactions;
  const pct = Math.round((sortedCount / totalToSort) * 100);

  function assign(cat: string) {
    if (!current) return;
    setConfirmed((prev) => [
      { merchant: current.merchant, category: cat, amount: current.amount, when: 'now' },
      ...prev,
    ].slice(0, 6));
    setQueue((prev) => prev.slice(1));
  }

  function skip() {
    setQueue((prev) => prev.length > 1 ? [...prev.slice(1), prev[0]] : prev);
  }

  function back() {
    setQueue((prev) => prev.length > 1 ? [prev[prev.length - 1], ...prev.slice(0, -1)] : prev);
  }

  return (
    <div className="glass-cat-root">
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <style>{GLASS_CAT_CSS}</style>

      <div className="aurora">
        <div className="aurora-blob a1" />
        <div className="aurora-blob a2" />
        <div className="aurora-blob a3" />
        <div className="aurora-blob a4" />
      </div>
      <div className="stars" />

      <div className="glass-frame">
        <aside className="glass-side">
          <Link to="/" className="g-brand">
            <span className="g-logo">◈</span>
            <span className="g-brand-text">finlens</span>
          </Link>
          <nav className="g-nav">
            <Link to="/2" className="gn"><span className="gn-i">◐</span>Dashboard</Link>
            <Link to="/categorize/2" className="gn active">
              <span className="gn-i">✦</span>Categorize
              <span className="gn-badge">{remaining}</span>
            </Link>
          </nav>
          <div className="g-section-label">Admin</div>
          <nav className="g-nav">
            <Link to="/transactions" className="gn"><span className="gn-i">≡</span>Transactions</Link>
            <Link to="/categories" className="gn"><span className="gn-i">❀</span>Categories</Link>
            <Link to="/statements" className="gn"><span className="gn-i">▤</span>Statements</Link>
          </nav>

          <div className="g-progress">
            <div className="g-prog-cap">progress</div>
            <div className="g-prog-num">{pct}<span className="pct">%</span></div>
            <div className="g-prog-bar"><div className="g-prog-fill" style={{ width: `${pct}%` }} /></div>
            <div className="g-prog-meta">{sortedCount}<span> of </span>{totalToSort} tx</div>
          </div>

          <div className="g-profile">
            <span className="g-av">P</span>
            <div>
              <div className="g-pname">Piotr</div>
              <div className="g-pmeta">account ⌄</div>
            </div>
          </div>
        </aside>

        <main className="glass-main">
          {/* Header bar */}
          <header className="g-head">
            <div>
              <div className="g-eyebrow">Categorize · Spotlight</div>
              <h1 className="g-title">
                <span className="g-count">{remaining}</span>
                <span className="g-of">transactions awaiting a home</span>
              </h1>
            </div>
            <div className="g-queue-peek">
              <span className="qp-cap">up next</span>
              <div className="qp-row">
                {queue.slice(1, 5).map((t) => (
                  <div key={t.id} className="qp-chip">
                    <span className="qp-merch">{t.merchant}</span>
                    <span className="qp-amt">−{money(t.amount, { showCents: false })}</span>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Spotlight card */}
          {current ? (
            <section className="spotlight">
              <div className="spotlight-aura" />
              <div className="spotlight-card">
                <div className="sl-top">
                  <div className="sl-meta">
                    <span className="sl-dot" />
                    <span className="sl-date">{current.date}</span>
                    <span className="sl-card">{current.card}</span>
                    {current.location && <span className="sl-loc">· {current.location}</span>}
                  </div>
                  <div className="sl-counter">№{current.id}</div>
                </div>

                <div className="sl-amount-row">
                  <div className="sl-amount">
                    <span className="sl-sign">{current.type === 'credit' ? '+' : '−'}</span>
                    <span className="sl-dollars">{Math.floor(current.amount / 100).toLocaleString()}</span>
                    <span className="sl-cents">.{String(current.amount % 100).padStart(2, '0')}</span>
                  </div>
                  <div className="sl-merchant">
                    <div className="sl-name">{current.merchant}</div>
                    <div className="sl-raw">{current.rawDescription}</div>
                  </div>
                </div>

                <div className="sl-suggestion">
                  <div className="sl-sug-glow" />
                  <span className="sl-sug-cap">our guess</span>
                  <button onClick={() => assign(current.suggested ?? 'Other')} className="sl-sug-btn">
                    <span className="sl-sug-dot" /> {current.suggested}
                    <kbd>↵ enter</kbd>
                  </button>
                </div>

                <div className="sl-controls">
                  <button onClick={back} className="sl-ctrl"><span>←</span> previous</button>
                  <button onClick={skip} className="sl-ctrl">defer <span>→</span></button>
                  <button className="sl-ctrl undo">undo last</button>
                </div>
              </div>
            </section>
          ) : (
            <section className="empty-state">
              <div className="es-orb" />
              <h2>Caught up.</h2>
              <p>The spotlight rests. Nothing left to categorize.</p>
            </section>
          )}

          {/* Category console */}
          <section className="console">
            <div className="console-head">
              <div className="ch-cap">choose a category</div>
              <div className="ch-hint">tap any tile or press <kbd>1</kbd>–<kbd>9</kbd>, <kbd>0</kbd></div>
            </div>
            <div className="cat-grid">
              {categorizeMock.favorites.map((c, i) => (
                <button
                  key={c}
                  className={`cat-tile ${hoverCat === c ? 'hover' : ''}`}
                  onMouseEnter={() => setHoverCat(c)}
                  onMouseLeave={() => setHoverCat(null)}
                  onClick={() => assign(c)}
                  style={{ '--accent': TILE_COLORS[i % TILE_COLORS.length] } as React.CSSProperties}
                >
                  <span className="tile-key">{i === 9 ? 0 : i + 1}</span>
                  <span className="tile-name">{c}</span>
                  <span className="tile-glow" />
                </button>
              ))}
            </div>
            <div className="all-categories-row">
              <span className="acr-cap">or browse all 20 categories</span>
              <button className="acr-btn">open list →</button>
            </div>
          </section>

          {/* Confirmed strip */}
          <section className="confirmed-strip">
            <div className="cs-head">
              <span>recently categorized</span>
              <span className="cs-count">{confirmed.length} just now</span>
            </div>
            <div className="cs-row">
              {confirmed.slice(0, 5).map((c, i) => (
                <div key={i} className="cs-chip">
                  <div className="cs-glow" />
                  <div className="cs-tick">✓</div>
                  <div className="cs-text">
                    <div className="cs-merch">{c.merchant}</div>
                    <div className="cs-meta"><span>{c.category}</span> · {c.when}</div>
                  </div>
                  <div className="cs-amt">−{money(c.amount, { showCents: false })}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const TILE_COLORS = [
  '#a78bfa', '#f472b6', '#22d3ee', '#fbbf24', '#34d399',
  '#fb7185', '#60a5fa', '#c084fc', '#2dd4bf', '#fde047',
];

const GLASS_CAT_CSS = `
.glass-cat-root {
  --bg: #0a0a18;
  --bg2: #14112b;
  --fg: #e8e6f5;
  --fg-muted: #9a98b8;
  --fg-dim: #6a6884;
  --accent: #a78bfa;
  --accent-2: #22d3ee;
  --accent-3: #f472b6;
  min-height: 100vh;
  background: radial-gradient(ellipse at top left, #1f1747 0%, #0a0a18 55%, #050510 100%);
  color: var(--fg);
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  position: relative;
  overflow-x: hidden;
}

.aurora { position: fixed; inset: 0; z-index: 0; filter: blur(80px); pointer-events: none; opacity: 0.65; }
.aurora-blob { position: absolute; border-radius: 50%; }
.a1 { width: 60vw; height: 60vw; top: -20vw; left: -10vw; background: radial-gradient(circle, #6c5ce7 0%, transparent 70%); animation: float 18s ease-in-out infinite alternate; }
.a2 { width: 50vw; height: 50vw; top: 20vw; right: -20vw; background: radial-gradient(circle, #22d3ee 0%, transparent 70%); animation: float 22s ease-in-out infinite alternate-reverse; opacity: 0.6; }
.a3 { width: 45vw; height: 45vw; bottom: -15vw; left: 25vw; background: radial-gradient(circle, #f472b6 0%, transparent 70%); animation: float 24s ease-in-out infinite alternate; opacity: 0.55; }
.a4 { width: 30vw; height: 30vw; top: 40vw; left: 10vw; background: radial-gradient(circle, #fbbf24 0%, transparent 70%); animation: float 26s ease-in-out infinite alternate-reverse; opacity: 0.35; }
@keyframes float { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(60px, -40px) scale(1.1); } }

.stars {
  position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.55;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.9), transparent),
    radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90% 20%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 10% 60%, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 85% 85%, rgba(255,255,255,0.5), transparent);
}

.glass-frame {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 220px 1fr; gap: 24px;
  padding: 24px 28px 60px; max-width: 1400px; margin: 0 auto;
}

/* SIDEBAR */
.glass-side {
  position: sticky; top: 24px; align-self: start; max-height: calc(100vh - 48px); overflow-y: auto;
  background: rgba(20, 17, 43, 0.55);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px; padding: 20px 14px 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
  display: flex; flex-direction: column; gap: 18px;
}
.g-brand { display: flex; align-items: center; gap: 11px; padding: 0 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.g-logo {
  width: 32px; height: 32px; border-radius: 10px;
  background: linear-gradient(135deg, #a78bfa, #22d3ee);
  display: inline-flex; align-items: center; justify-content: center;
  color: #0a0a18; font-size: 18px; font-weight: 600;
  box-shadow: 0 6px 18px rgba(167,139,250,0.45);
}
.g-brand-text { font-weight: 600; font-size: 16px; letter-spacing: -0.01em; }

.g-nav { display: flex; flex-direction: column; gap: 2px; }
.gn {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 12px;
  font-size: 13.5px; font-weight: 500;
  color: var(--fg-muted);
  transition: all 0.15s;
}
.gn:hover { background: rgba(255,255,255,0.04); color: var(--fg); }
.gn.active {
  background: linear-gradient(135deg, rgba(167,139,250,0.18), rgba(34,211,238,0.10));
  color: var(--fg);
  box-shadow: inset 0 0 0 1px rgba(167,139,250,0.3);
}
.gn-i {
  display: inline-flex; width: 22px; height: 22px; border-radius: 6px;
  background: rgba(255,255,255,0.06); color: var(--fg-muted);
  align-items: center; justify-content: center; font-size: 11px;
}
.gn.active .gn-i { background: var(--accent); color: #0a0a18; }
.gn-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #f472b6, #fb7185);
  color: #fff; font-size: 11px; font-weight: 600;
  padding: 1px 8px; border-radius: 999px;
  box-shadow: 0 2px 8px rgba(244,114,182,0.4);
}

.g-section-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--fg-dim); padding: 6px 12px 4px;
}

.g-progress {
  margin-top: 8px; padding: 14px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
}
.g-prog-cap { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--fg-dim); }
.g-prog-num { font-size: 32px; font-weight: 600; line-height: 1.1; margin-top: 4px; letter-spacing: -0.02em; }
.g-prog-num .pct { font-size: 16px; color: var(--fg-muted); margin-left: 2px; }
.g-prog-bar { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.08); margin: 8px 0 6px; overflow: hidden; }
.g-prog-fill { height: 100%; background: linear-gradient(90deg, #a78bfa, #22d3ee); box-shadow: 0 0 12px rgba(167,139,250,0.6); }
.g-prog-meta { font-size: 11px; color: var(--fg-dim); }
.g-prog-meta span { color: var(--fg-dim); opacity: 0.7; }

.g-profile {
  display: flex; align-items: center; gap: 10px;
  margin-top: auto; padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.g-av {
  width: 34px; height: 34px; border-radius: 12px;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  display: inline-flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 600; font-size: 14px;
}
.g-pname { font-size: 14px; font-weight: 500; }
.g-pmeta { font-size: 11px; color: var(--fg-dim); }

/* MAIN */
.glass-main { display: flex; flex-direction: column; gap: 22px; }

.g-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; padding: 4px; }
.g-eyebrow {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em;
  color: var(--accent); opacity: 0.85;
}
.g-title {
  display: flex; align-items: baseline; gap: 14px;
  font-family: 'Instrument Serif', serif; font-weight: 400;
  font-size: 44px; line-height: 1; letter-spacing: -0.01em; margin-top: 4px;
}
.g-count {
  font-size: 64px;
  background: linear-gradient(135deg, #a78bfa, #22d3ee 60%, #f472b6);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  font-style: italic;
}
.g-of { color: var(--fg-muted); font-size: 18px; font-family: 'Outfit', sans-serif; font-weight: 300; max-width: 220px; line-height: 1.2; }

.g-queue-peek {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.07);
  padding: 12px 14px; border-radius: 16px;
}
.qp-cap { font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: var(--fg-dim); }
.qp-row { display: flex; gap: 6px; margin-top: 8px; }
.qp-chip {
  display: flex; flex-direction: column; gap: 1px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 7px 10px; border-radius: 10px;
  min-width: 96px;
}
.qp-merch { font-size: 12px; font-weight: 500; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
.qp-amt { font-size: 11px; color: var(--fg-dim); font-variant-numeric: tabular-nums; }

/* SPOTLIGHT */
.spotlight { position: relative; }
.spotlight-aura {
  position: absolute; inset: -40px; z-index: -1;
  background: radial-gradient(ellipse at 30% 30%, rgba(167,139,250,0.35), transparent 60%),
              radial-gradient(ellipse at 70% 70%, rgba(34,211,238,0.25), transparent 60%);
  filter: blur(40px); pointer-events: none;
}
.spotlight-card {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 28px;
  padding: 28px 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
  position: relative;
}

.sl-top { display: flex; justify-content: space-between; align-items: center; }
.sl-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--fg-muted); }
.sl-dot { width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 10px #22d3ee; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.4; } }
.sl-date { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 14px; color: var(--fg); }
.sl-card { font-variant-numeric: tabular-nums; }
.sl-loc { color: var(--fg-dim); }
.sl-counter { font-family: ui-monospace, 'SF Mono', monospace; font-size: 11px; color: var(--fg-dim); letter-spacing: 0.1em; }

.sl-amount-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; margin-top: 22px; flex-wrap: wrap; }
.sl-amount {
  display: flex; align-items: baseline;
  font-family: 'Instrument Serif', serif; font-weight: 400;
  font-size: 96px; line-height: 0.9; letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(180deg, #ffffff 0%, #c4c2e0 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.sl-sign { font-size: 56px; opacity: 0.7; margin-right: 6px; }
.sl-cents { font-size: 36px; opacity: 0.55; margin-left: 2px; }
.sl-merchant { text-align: right; max-width: 360px; min-width: 200px; flex: 1; }
.sl-name { font-family: 'Instrument Serif', serif; font-size: 32px; line-height: 1.1; font-style: italic; }
.sl-raw {
  font-family: ui-monospace, 'SF Mono', monospace; font-size: 11px;
  color: var(--fg-dim); margin-top: 6px; letter-spacing: 0.02em;
  word-break: break-all;
}

.sl-suggestion {
  position: relative; margin-top: 24px;
  display: flex; align-items: center; gap: 16px;
  padding: 14px 18px;
  background: rgba(167,139,250,0.12);
  border: 1px solid rgba(167,139,250,0.3);
  border-radius: 16px;
  overflow: hidden;
}
.sl-sug-glow {
  position: absolute; inset: -50px; pointer-events: none;
  background: radial-gradient(circle at 20% 50%, rgba(167,139,250,0.4), transparent 50%);
  filter: blur(20px);
}
.sl-sug-cap { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent); position: relative; }
.sl-sug-btn {
  display: inline-flex; align-items: center; gap: 10px;
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  color: #ffffff; padding: 8px 14px 8px 12px; border-radius: 999px;
  font-size: 14px; font-weight: 600; cursor: pointer; position: relative;
  box-shadow: 0 6px 20px rgba(167,139,250,0.5);
  transition: transform 0.15s;
}
.sl-sug-btn:hover { transform: translateY(-1px); }
.sl-sug-dot { width: 6px; height: 6px; background: #fff; border-radius: 50%; box-shadow: 0 0 8px #fff; }
.sl-sug-btn kbd {
  font-family: ui-monospace, monospace; font-size: 10px;
  background: rgba(255,255,255,0.18); padding: 2px 6px; border-radius: 4px;
}

.sl-controls { display: flex; gap: 8px; margin-top: 20px; }
.sl-ctrl {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--fg-muted);
  padding: 8px 14px; border-radius: 999px;
  font-size: 13px; cursor: pointer;
  transition: all 0.15s;
}
.sl-ctrl:hover { background: rgba(255,255,255,0.08); color: var(--fg); }
.sl-ctrl span { font-size: 14px; opacity: 0.7; margin: 0 4px; }
.sl-ctrl.undo { margin-left: auto; }

/* CONSOLE */
.console {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 22px;
  padding: 20px 22px;
}
.console-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
.ch-cap { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 20px; }
.ch-hint { font-size: 12px; color: var(--fg-dim); }
.ch-hint kbd {
  font-family: ui-monospace, monospace; font-size: 10px;
  background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px;
  color: var(--fg-muted);
}

.cat-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
}
.cat-tile {
  position: relative;
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
  padding: 14px 14px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  text-align: left; cursor: pointer; overflow: hidden;
  transition: all 0.2s;
}
.cat-tile:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  background: rgba(255,255,255,0.06);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.tile-key {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 7px;
  background: rgba(255,255,255,0.06);
  font-family: ui-monospace, monospace;
  font-size: 12px; color: var(--fg-muted);
  transition: all 0.2s;
}
.cat-tile:hover .tile-key { background: var(--accent); color: #0a0a18; box-shadow: 0 0 12px var(--accent); }
.tile-name { font-size: 14px; font-weight: 500; color: var(--fg); }
.tile-glow {
  position: absolute; inset: 0; opacity: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, var(--accent) 0%, transparent 70%);
  transition: opacity 0.3s;
}
.cat-tile:hover .tile-glow { opacity: 0.08; }

.all-categories-row {
  margin-top: 14px; display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px dashed rgba(255,255,255,0.12);
  border-radius: 12px;
}
.acr-cap { font-size: 13px; color: var(--fg-muted); font-style: italic; font-family: 'Instrument Serif', serif; }
.acr-btn {
  background: transparent; color: var(--accent-2);
  font-size: 13px; cursor: pointer; padding: 4px 10px;
  border: 1px solid rgba(34,211,238,0.3); border-radius: 999px;
  transition: all 0.15s;
}
.acr-btn:hover { background: rgba(34,211,238,0.1); }

/* CONFIRMED STRIP */
.confirmed-strip {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px; padding: 16px 18px;
}
.cs-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; font-size: 12px;
  text-transform: uppercase; letter-spacing: 0.12em; color: var(--fg-dim);
}
.cs-count { color: #34d399; text-transform: none; letter-spacing: 0; font-size: 11px; }
.cs-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.cs-chip {
  position: relative;
  display: flex; align-items: center; gap: 10px;
  background: rgba(52,211,153,0.06);
  border: 1px solid rgba(52,211,153,0.18);
  border-radius: 12px; padding: 10px 12px;
  min-width: 220px;
}
.cs-glow {
  position: absolute; left: 0; top: 50%; width: 30px; height: 30px;
  transform: translate(-30%, -50%); pointer-events: none;
  background: radial-gradient(circle, rgba(52,211,153,0.4), transparent 70%);
  filter: blur(8px);
}
.cs-tick {
  position: relative;
  width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(135deg, #34d399, #10b981);
  display: inline-flex; align-items: center; justify-content: center;
  color: #052e1d; font-size: 12px; font-weight: 700;
  box-shadow: 0 2px 8px rgba(52,211,153,0.4);
}
.cs-text { flex: 1; }
.cs-merch { font-size: 13px; font-weight: 500; }
.cs-meta { font-size: 11px; color: var(--fg-dim); }
.cs-meta span { color: #34d399; }
.cs-amt { font-family: ui-monospace, monospace; font-size: 12px; color: var(--fg-muted); }

/* EMPTY */
.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 80px 20px;
  text-align: center; gap: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
}
.es-orb {
  width: 72px; height: 72px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #a78bfa, #22d3ee 70%);
  box-shadow: 0 0 60px rgba(167,139,250,0.5);
  margin-bottom: 8px;
}
.empty-state h2 { font-family: 'Instrument Serif', serif; font-size: 36px; font-style: italic; }
.empty-state p { color: var(--fg-muted); }
`;
