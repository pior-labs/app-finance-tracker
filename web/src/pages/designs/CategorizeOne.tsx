import { useState } from 'react';
import { Link } from 'react-router-dom';
import { categorizeMock, mock, money } from './mockData';

/**
 * BLOOM — A sorting parlor. Postcards tied with twine on a pastel mesh table.
 * Pistachio / peach / lavender / cream. Fraunces + Outfit.
 */
export function CategorizeOne() {
  const [queue, setQueue] = useState(categorizeMock.queue);
  const [confirmed, setConfirmed] = useState(categorizeMock.justConfirmed);
  const current = queue[0] ?? null;
  const remaining = queue.length;
  const sortedCount = categorizeMock.alreadyCategorized + (categorizeMock.queue.length - queue.length);
  const totalToSort = categorizeMock.totalTransactions;
  const pct = Math.round((sortedCount / totalToSort) * 100);

  const palette = ['#cae0a8', '#f8d7c0', '#dcd3f0', '#f5e3a0', '#c6e3d4', '#f1c8d6', '#d4cdf2', '#ffd6b3', '#d0e6c4', '#eed4ee'];

  function assign(cat: string) {
    if (!current) return;
    setConfirmed((prev) => [
      { merchant: current.merchant, category: cat, amount: current.amount, when: 'just now' },
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
    <div className="bloom-cat-root">
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{BLOOM_CAT_CSS}</style>

      <div className="mesh">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="blob b4" />
      </div>
      <div className="grain" />

      <div className="bloom-frame">
        {/* SIDEBAR — bloom nav */}
        <aside className="bloom-side">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <span className="petal p1" />
              <span className="petal p2" />
              <span className="petal p3" />
              <span className="brand-core" />
            </span>
            <span className="brand-text">finlens</span>
          </Link>

          <nav className="bloom-nav">
            <Link to="/1" className="bn">
              <span className="bn-icon">◐</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/categorize/1" className="bn active">
              <span className="bn-icon">✦</span>
              <span>Categorize</span>
              <span className="bn-badge">{remaining}</span>
            </Link>
          </nav>

          <div className="nav-section-label">Admin</div>
          <nav className="bloom-nav">
            <Link to="/transactions" className="bn"><span className="bn-icon">≡</span><span>Transactions</span></Link>
            <Link to="/categories" className="bn"><span className="bn-icon">❀</span><span>Categories</span></Link>
            <Link to="/statements" className="bn"><span className="bn-icon">▤</span><span>Statements</span></Link>
          </nav>

          <div className="profile-card">
            <span className="profile-avatar">P</span>
            <div className="profile-info">
              <div className="profile-name">Piotr</div>
              <div className="profile-meta">Account ⌄</div>
            </div>
          </div>
        </aside>

        <main className="bloom-main">
          <header className="b-head">
            <div>
              <div className="b-eyebrow">a little quiet sorting · <em>May 2026</em></div>
              <h1 className="b-title">tend to <em>{remaining}</em> stragglers,<br/>one at a time.</h1>
              <p className="b-sub">no rush — each one finds a home and then we move on.</p>
            </div>
            <div className="progress-bouquet">
              <Donut pct={pct} />
              <div className="bouquet-meta">
                <div className="bouquet-num">{pct}<span className="bouquet-pct">%</span></div>
                <div className="bouquet-label">tended</div>
                <div className="bouquet-sub">{sortedCount} of {totalToSort}</div>
              </div>
            </div>
          </header>

          <section className="stage">
            {/* Main card stack */}
            <div className="stack-area">
              {current ? (
                <div className="card-stack">
                  {/* Back ghosts */}
                  {queue[2] && <div className="ghost g3" />}
                  {queue[1] && (
                    <div className="ghost g2">
                      <div className="ghost-merchant">{queue[1].merchant}</div>
                      <div className="ghost-amt">−{money(queue[1].amount)}</div>
                    </div>
                  )}

                  {/* Top postcard */}
                  <article className="postcard">
                    <div className="postage">
                      <div className="postage-inner">
                        <div className="postage-amt">{money(current.amount, { showCents: false })}</div>
                        <div className="postage-cents">.{String(current.amount % 100).padStart(2, '0')}</div>
                      </div>
                      <div className="postage-cancel">
                        <div className="cancel-line" /><div className="cancel-line" /><div className="cancel-line" />
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="meta-row">
                        <span className="date-stamp">{current.date}</span>
                        <span className="card-info">on <em>{current.card}</em></span>
                      </div>
                      <h2 className="merchant-name">{current.merchant}</h2>
                      <p className="raw-desc">{current.rawDescription}</p>
                      {current.location && (
                        <div className="location-row">
                          <span className="loc-pin">◉</span> {current.location}
                        </div>
                      )}

                      <div className="suggested-row">
                        <span className="sug-label">a guess —</span>
                        <button onClick={() => assign(current.suggested ?? 'Other')} className="sug-btn">
                          {current.suggested} <span className="sug-arr">↵</span>
                        </button>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button onClick={back} className="nav-btn">← previous</button>
                      <span className="card-num">№ {String(current.id).padStart(4, '0')}</span>
                      <button onClick={skip} className="nav-btn">defer →</button>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="empty">
                  <div className="empty-mark">✿</div>
                  <h2>nothing left to tend.</h2>
                  <p>all twelve found their homes. enjoy a moment.</p>
                </div>
              )}
            </div>

            {/* Right rail */}
            <div className="rail">
              <div className="rail-section">
                <div className="rail-cap">choose a home</div>
                <p className="rail-hint">tap or press the <kbd>number</kbd></p>
                <div className="petal-grid">
                  {categorizeMock.favorites.map((c, i) => (
                    <button
                      key={c}
                      onClick={() => assign(c)}
                      className="petal-chip"
                      style={{ background: palette[i % palette.length] }}
                    >
                      <span className="petal-key">{i === 9 ? 0 : i + 1}</span>
                      <span className="petal-name">{c}</span>
                    </button>
                  ))}
                </div>
                <button className="all-btn">
                  <span>or pick from all twenty</span>
                  <span className="all-arr">→</span>
                </button>
              </div>

              <div className="rail-section">
                <div className="rail-cap">just tended</div>
                <ul className="tended-list">
                  {confirmed.slice(0, 4).map((c, i) => (
                    <li key={i} className="tended-row">
                      <span className="tick">✓</span>
                      <span className="t-merchant">{c.merchant}</span>
                      <span className="t-cat" style={{ background: palette[i % palette.length] }}>{c.category}</span>
                      <span className="t-amt">−{money(c.amount, { showCents: false })}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rail-section keys">
                <div className="rail-cap">keys</div>
                <div className="key-row"><kbd>1–9, 0</kbd> favorites</div>
                <div className="key-row"><kbd>←</kbd> back · <kbd>→</kbd> defer · <kbd>U</kbd> undo</div>
              </div>
            </div>
          </section>

          <p className="footnote">
            <em>{mock.uncategorizedCount} untended this fortnight.</em> · brewed with care.
          </p>
        </main>
      </div>
    </div>
  );
}

function Donut({ pct }: { pct: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const off = c - (c * pct) / 100;
  return (
    <svg className="bouquet-svg" viewBox="0 0 80 80" width="92" height="92">
      <defs>
        <linearGradient id="bcat-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5d8a3f" />
          <stop offset="100%" stopColor="#a8c97c" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r={r} stroke="rgba(45,36,24,0.10)" strokeWidth="8" fill="none" />
      <circle
        cx="40" cy="40" r={r}
        stroke="url(#bcat-grad)" strokeWidth="8" fill="none" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 40 40)"
      />
    </svg>
  );
}

const BLOOM_CAT_CSS = `
.bloom-cat-root {
  --cream: #fdf9f0;
  --paper: #fcf5e6;
  --pistachio: #cae0a8;
  --peach: #f8d7c0;
  --lavender: #dcd3f0;
  --ink: #2d2418;
  --ink-2: #574532;
  --ink-3: #9c8a73;
  --ink-4: #c4b69f;
  min-height: 100vh;
  background: var(--cream);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.55;
  position: relative;
  overflow-x: hidden;
}
.mesh { position: fixed; inset: 0; z-index: 0; filter: blur(60px); pointer-events: none; opacity: 0.78; }
.blob { position: absolute; border-radius: 50%; mix-blend-mode: multiply; }
.b1 { width: 50vw; height: 50vw; top: -12vw; left: -10vw; background: #cae0a8; animation: drift 24s ease-in-out infinite alternate; }
.b2 { width: 45vw; height: 45vw; top: 8vw; right: -15vw; background: #f8d7c0; animation: drift 28s ease-in-out infinite alternate-reverse; }
.b3 { width: 40vw; height: 40vw; bottom: -10vw; left: 22vw; background: #dcd3f0; animation: drift 26s ease-in-out infinite alternate; }
.b4 { width: 32vw; height: 32vw; bottom: 6vw; right: 8vw; background: #c6e3d4; animation: drift 30s ease-in-out infinite alternate-reverse; }
@keyframes drift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(40px, -50px) scale(1.08); } }

.grain {
  position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.45; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

.bloom-frame {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 220px 1fr; gap: 28px;
  padding: 26px 32px 60px; max-width: 1320px; margin: 0 auto;
}

/* SIDEBAR (matched to DashboardOne) */
.bloom-side {
  position: sticky; top: 26px; align-self: start; max-height: calc(100vh - 52px); overflow-y: auto;
  background: rgba(255, 252, 244, 0.55);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 32px; padding: 22px 16px 18px;
  box-shadow: 0 8px 32px rgba(45,36,24,0.07), inset 0 0 0 1px rgba(255,255,255,0.5);
  display: flex; flex-direction: column; gap: 20px;
}
.brand { display: flex; align-items: center; gap: 12px; padding: 0 8px 14px; border-bottom: 1px dashed rgba(45,36,24,0.12); }
.brand-mark { position: relative; width: 34px; height: 34px; }
.brand-mark .petal { position: absolute; width: 14px; height: 22px; border-radius: 50% 50% 50% 50% / 80% 80% 20% 20%; left: 10px; top: 0; transform-origin: 50% 100%; }
.brand-mark .p1 { transform: rotate(0deg); background: #cae0a8; }
.brand-mark .p2 { transform: rotate(120deg); background: #f8d7c0; }
.brand-mark .p3 { transform: rotate(240deg); background: #dcd3f0; }
.brand-core { position: absolute; width: 10px; height: 10px; background: #fdf9f0; border-radius: 50%; left: 12px; top: 12px; border: 1.5px solid var(--ink); z-index: 2; }
.brand-text { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 500; letter-spacing: -0.02em; font-style: italic; }
.bloom-nav { display: flex; flex-direction: column; gap: 2px; }
.bn { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 999px; font-size: 14px; font-weight: 500; color: var(--ink-2); transition: background 0.2s, color 0.2s; }
.bn:hover { background: rgba(255,255,255,0.5); color: var(--ink); }
.bn.active { background: var(--ink); color: var(--cream); box-shadow: 0 6px 18px -6px rgba(45,36,24,0.35); }
.bn-icon { display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.7); align-items: center; justify-content: center; font-size: 12px; color: var(--ink-2); box-shadow: inset 0 0 0 1px rgba(45,36,24,0.08); }
.bn.active .bn-icon { background: var(--pistachio); color: var(--ink); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4); }
.bn-badge { margin-left: auto; background: linear-gradient(135deg, #f8d7c0, #f5b893); color: #6b3a1f; font-family: 'Fraunces', serif; font-size: 12px; font-weight: 600; padding: 1px 9px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5); }
.nav-section-label { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--ink-3); padding: 6px 12px 2px; letter-spacing: 0.02em; }
.profile-card { display: flex; align-items: center; gap: 10px; padding: 12px 8px 6px; border-top: 1px dashed rgba(45,36,24,0.12); margin-top: auto; }
.profile-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #dcd3f0, #f8d7c0); display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-size: 15px; color: var(--ink); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }
.profile-info { line-height: 1.15; }
.profile-name { font-family: 'Fraunces', serif; font-size: 15px; }
.profile-meta { font-size: 11px; color: var(--ink-3); }

/* MAIN */
.bloom-main { display: flex; flex-direction: column; gap: 28px; }
.b-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 4px 0; gap: 24px; }
.b-eyebrow { font-size: 13px; color: var(--ink-3); letter-spacing: 0.02em; }
.b-eyebrow em { font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-2); }
.b-title { font-family: 'Fraunces', serif; font-weight: 500; font-size: 44px; line-height: 1.05; letter-spacing: -0.02em; margin: 4px 0 6px; }
.b-title em { font-style: italic; color: #6b9c3a; }
.b-sub { color: var(--ink-2); font-size: 15px; max-width: 460px; }

.progress-bouquet {
  display: flex; align-items: center; gap: 14px;
  background: rgba(255,252,244,0.7);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.8);
  padding: 14px 20px 14px 14px;
  border-radius: 100px;
  box-shadow: 0 6px 24px rgba(45,36,24,0.06);
}
.bouquet-meta { line-height: 1.1; }
.bouquet-num { font-family: 'Fraunces', serif; font-size: 30px; font-weight: 500; }
.bouquet-pct { font-size: 16px; color: var(--ink-3); margin-left: 2px; }
.bouquet-label { font-family: 'Fraunces', serif; font-style: italic; font-size: 13px; color: var(--ink-2); }
.bouquet-sub { font-size: 11px; color: var(--ink-3); margin-top: 2px; }

.stage {
  display: grid; grid-template-columns: 1fr 320px; gap: 28px; align-items: start;
}

/* CARD STACK */
.stack-area { position: relative; min-height: 540px; }
.card-stack { position: relative; }
.ghost {
  position: absolute; inset: 0; background: rgba(255,252,244,0.85); border: 1px solid rgba(255,255,255,0.9);
  border-radius: 24px; box-shadow: 0 8px 32px rgba(45,36,24,0.08);
}
.g2 { transform: rotate(-2.2deg) translate(-10px, 14px) scale(0.985); opacity: 0.95; padding: 26px; display: flex; flex-direction: column; justify-content: flex-end; }
.g3 { transform: rotate(3deg) translate(14px, 22px) scale(0.97); opacity: 0.7; }
.ghost-merchant { font-family: 'Fraunces', serif; font-size: 18px; color: var(--ink-3); }
.ghost-amt { font-family: 'Fraunces', serif; font-size: 22px; color: var(--ink-4); }

.postcard {
  position: relative; background: var(--paper);
  border: 1px solid rgba(255,255,255,0.95);
  border-radius: 24px; padding: 0;
  box-shadow: 0 14px 40px rgba(45,36,24,0.12), 0 2px 6px rgba(45,36,24,0.06), inset 0 0 0 1px rgba(255,255,255,0.6);
  transform: rotate(-0.6deg);
  overflow: hidden;
}
.postcard::before {
  content: ''; position: absolute; inset: 10px;
  border: 1.5px dashed rgba(45,36,24,0.12);
  border-radius: 18px; pointer-events: none;
}

/* Postage stamp top-right */
.postage {
  position: absolute; top: 18px; right: 18px;
  width: 130px; padding: 12px 12px 10px;
  background: linear-gradient(135deg, #f8d7c0, #f1c8a4);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(155,90,40,0.18), inset 0 0 0 2px rgba(255,255,255,0.55);
  text-align: center;
  font-family: 'Fraunces', serif;
  transform: rotate(2deg);
}
.postage::before, .postage::after {
  content: ''; position: absolute; left: -3px; right: -3px; height: 6px;
  background-image: radial-gradient(circle at 4px 0, var(--cream) 3px, transparent 3.3px);
  background-size: 8px 6px;
  background-position: 0 0;
}
.postage::before { top: -3px; }
.postage::after { bottom: -3px; transform: rotate(180deg); }
.postage-amt { font-size: 28px; font-weight: 600; color: #6b3a1f; line-height: 1; }
.postage-cents { font-size: 13px; color: #6b3a1f; opacity: 0.7; margin-top: -2px; }
.postage-cancel { display: flex; flex-direction: column; gap: 2px; margin-top: 6px; align-items: center; }
.cancel-line { width: 60%; height: 1px; background: rgba(107,58,31,0.4); transform: rotate(-6deg); }

.card-body { padding: 28px 32px 18px; max-width: calc(100% - 160px); position: relative; z-index: 1; }
.meta-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.date-stamp {
  display: inline-block; font-family: 'Fraunces', serif; font-style: italic;
  font-size: 13px; color: var(--ink-2);
  border: 1.5px dashed rgba(45,36,24,0.25);
  padding: 3px 10px; border-radius: 999px;
}
.card-info { font-size: 12px; color: var(--ink-3); }
.card-info em { font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-2); }

.merchant-name {
  font-family: 'Fraunces', serif; font-weight: 500;
  font-size: 48px; line-height: 1; letter-spacing: -0.02em;
  margin: 0 0 8px;
}
.raw-desc { font-size: 12.5px; color: var(--ink-3); font-family: ui-monospace, 'SF Mono', Consolas, monospace; letter-spacing: 0.01em; }
.location-row { font-size: 13px; color: var(--ink-2); margin-top: 10px; }
.loc-pin { color: #c46a3a; margin-right: 4px; }

.suggested-row {
  margin-top: 20px; display: flex; align-items: center; gap: 12px;
  padding: 14px 16px 14px 18px;
  background: rgba(202,224,168,0.45);
  border: 1px dashed rgba(93,138,63,0.45);
  border-radius: 14px;
}
.sug-label { font-family: 'Fraunces', serif; font-style: italic; font-size: 14px; color: #4a6b2d; }
.sug-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Fraunces', serif; font-size: 17px; color: var(--ink); font-weight: 500;
  background: #fff; padding: 6px 14px; border-radius: 999px;
  box-shadow: 0 2px 8px rgba(93,138,63,0.18); border: 1px solid rgba(93,138,63,0.3);
  cursor: pointer; transition: transform 0.15s;
}
.sug-btn:hover { transform: translateY(-1px); }
.sug-arr { font-size: 13px; color: var(--ink-3); }

.card-footer {
  position: relative; z-index: 1;
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 32px 24px;
  border-top: 1.5px dashed rgba(45,36,24,0.12);
  margin: 0 10px; /* respect the inner dashed border */
  font-family: 'Fraunces', serif; font-style: italic; font-size: 14px; color: var(--ink-3);
}
.nav-btn { cursor: pointer; transition: color 0.15s; color: var(--ink-3); }
.nav-btn:hover { color: var(--ink); }
.card-num { font-family: ui-monospace, 'SF Mono', monospace; font-style: normal; font-size: 11px; letter-spacing: 0.08em; color: var(--ink-4); }

/* RIGHT RAIL */
.rail { display: flex; flex-direction: column; gap: 18px; }
.rail-section {
  background: rgba(255,252,244,0.72);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 22px; padding: 18px 18px 16px;
  box-shadow: 0 6px 22px rgba(45,36,24,0.06);
}
.rail-cap { font-family: 'Fraunces', serif; font-style: italic; font-size: 14px; color: var(--ink-2); margin-bottom: 4px; }
.rail-hint { font-size: 12px; color: var(--ink-3); margin-bottom: 12px; }
.rail-hint kbd { font-family: ui-monospace, monospace; font-size: 10px; padding: 1px 5px; border-radius: 4px; background: rgba(45,36,24,0.08); }

.petal-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.petal-chip {
  position: relative; display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 11px 5px 5px; border-radius: 999px;
  border: 1px solid rgba(45,36,24,0.12);
  font-size: 13px; color: var(--ink); cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 3px rgba(45,36,24,0.06);
}
.petal-chip:hover { transform: translateY(-2px) rotate(-1deg); box-shadow: 0 4px 10px rgba(45,36,24,0.1); }
.petal-key {
  display: inline-flex; width: 18px; height: 18px; border-radius: 50%;
  background: rgba(255,255,255,0.7); color: var(--ink);
  align-items: center; justify-content: center;
  font-family: 'Fraunces', serif; font-style: italic; font-size: 12px;
  box-shadow: inset 0 0 0 1px rgba(45,36,24,0.12);
}
.petal-name { font-weight: 500; }

.all-btn {
  margin-top: 12px; display: flex; justify-content: space-between; align-items: center; width: 100%;
  padding: 9px 14px; border-radius: 999px;
  background: var(--ink); color: var(--cream);
  font-family: 'Fraunces', serif; font-style: italic; font-size: 13px;
  cursor: pointer; transition: transform 0.15s;
}
.all-btn:hover { transform: translateY(-1px); }
.all-arr { font-size: 14px; }

.tended-list { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
.tended-row {
  display: grid; grid-template-columns: 14px 1fr auto auto; gap: 8px; align-items: center;
  font-size: 13px;
}
.tick { color: #6b9c3a; font-weight: 600; }
.t-merchant { font-family: 'Fraunces', serif; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.t-cat {
  font-size: 10px; padding: 2px 7px; border-radius: 999px;
  font-weight: 500; color: #3d3220;
  box-shadow: inset 0 0 0 1px rgba(45,36,24,0.08);
}
.t-amt { font-family: ui-monospace, monospace; font-size: 12px; color: var(--ink-3); }

.keys .key-row { font-size: 12px; color: var(--ink-2); margin-top: 6px; }
.keys kbd {
  font-family: ui-monospace, monospace; font-size: 11px;
  padding: 2px 6px; border-radius: 4px;
  background: rgba(255,255,255,0.7); color: var(--ink);
  box-shadow: inset 0 0 0 1px rgba(45,36,24,0.15);
}

.footnote { font-family: 'Fraunces', serif; font-style: italic; font-size: 13px; color: var(--ink-3); text-align: center; padding-top: 4px; }
.footnote em { color: var(--ink-2); font-style: italic; }

/* EMPTY */
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 12px; text-align: center; }
.empty-mark { font-size: 64px; color: #c46a3a; }
.empty h2 { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 500; }
.empty p { color: var(--ink-2); }
`;
