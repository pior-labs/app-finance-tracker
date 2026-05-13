import { Link } from 'react-router-dom';
import { mock, money } from './mockData';

/**
 * BLOOM — soft organic gradient mesh, glass cards, Fraunces + Outfit.
 * Pistachio / peach / lavender / cream. A calm money diary.
 */
export function DashboardOne() {
  const max = mock.byCategory[0].cents;
  const palette = ['#cae0a8', '#f8d7c0', '#dcd3f0', '#f5e3a0', '#c6e3d4', '#f1c8d6', '#d4cdf2', '#ffd6b3'];

  return (
    <div className="bloom-root">
      <style>{BLOOM_CSS}</style>

      {/* gradient mesh blobs */}
      <div className="mesh">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="blob b4" />
        <div className="blob b5" />
      </div>
      <div className="grain" />

      <div className="bloom-frame">
        {/* SIDEBAR — app nav, bloom-styled */}
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
            <Link to="/1" className="bn active">
              <span className="bn-icon">◐</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/categorize" className="bn">
              <span className="bn-icon">✦</span>
              <span>Categorize</span>
              <span className="bn-badge">{mock.uncategorizedCount}</span>
            </Link>
          </nav>

          <div className="nav-section-label">Admin</div>
          <nav className="bloom-nav">
            <Link to="/transactions" className="bn">
              <span className="bn-icon">≡</span>
              <span>Transactions</span>
            </Link>
            <Link to="/categories" className="bn">
              <span className="bn-icon">❀</span>
              <span>Categories</span>
            </Link>
            <Link to="/statements" className="bn">
              <span className="bn-icon">▤</span>
              <span>Statements</span>
            </Link>
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
          {/* HEADER */}
          <header className="b-head">
            <div>
              <div className="b-eyebrow">a diary for <em>May 2026</em></div>
              <h1 className="b-title">good morning, <em>Piotr.</em></h1>
              <p className="b-sub">your month, gently summarised — sip your coffee, no rush.</p>
            </div>
            <div className="b-month-pill">
              <span>May 2026</span><span className="dot">⌄</span>
            </div>
          </header>

          {/* ACTION CARD — glass */}
          <section className="action-card">
            <div className="action-bg" />
            <div className="action-left">
              <div className="tag tag-warm">⚘ a few things to tend to</div>
              <div className="huge-num">
                {mock.uncategorizedCount}
                <span className="huge-sub">untended<br/>transactions</span>
              </div>
              <p className="action-copy">
                A small handful slipped past us this fortnight — once they have a home, your May
                picture will feel <em>just-so</em>.
              </p>
              <div className="action-buttons">
                <Link to="/categorize" className="pill-btn primary">
                  tend to them <span className="arr">→</span>
                </Link>
                <button className="pill-btn ghost">remind me later</button>
              </div>
            </div>
            <div className="action-right">
              <div className="recent-head">recently unsorted</div>
              {mock.recentUncategorized.map((t) => (
                <div key={t.id} className="recent-row">
                  <span className="r-dot" />
                  <span className="r-date">{t.date}</span>
                  <span className="r-name">{prettyName(t.merchant)}</span>
                  <span className="r-amt">{money(t.amount)}</span>
                </div>
              ))}
              <div className="recent-more">+ {mock.uncategorizedCount - 3} more, when you're ready</div>
            </div>
          </section>

          {/* STAT TRIO */}
          <section className="stat-trio">
            <div className="stat-card peach">
              <div className="stat-cap">spent this month</div>
              <div className="stat-figure">
                <span className="ccy">$</span>4,287<span className="cents">.43</span>
              </div>
              <div className="stat-meta">
                <span className="dot-good">●</span> 3.4% under April · 142 transactions
              </div>
              <svg className="wave" viewBox="0 0 200 40" preserveAspectRatio="none">
                <path d="M0 28 Q 25 18 50 22 T 100 24 T 150 16 T 200 22 L 200 40 L 0 40 Z" fill="rgba(255,255,255,0.4)"/>
                <path d="M0 28 Q 25 18 50 22 T 100 24 T 150 16 T 200 22" stroke="#9c5a3a" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>

            <div className="stat-card pistachio">
              <div className="stat-cap">categorized</div>
              <div className="stat-figure big-pct">
                91<span className="pct-sign">%</span>
              </div>
              <div className="ring-wrap">
                <Donut pct={91} />
                <div className="ring-meta">
                  <div><b>130</b> sorted</div>
                  <div className="dim">12 to go</div>
                </div>
              </div>
            </div>

            <div className="stat-card lavender">
              <div className="stat-cap">last statement</div>
              <div className="stmt-period">{mock.statement.period}</div>
              <div className="stmt-meta-row">
                <span className="avatar">P</span>
                <div>
                  <div className="stmt-uploader">uploaded by {mock.statement.uploadedBy}</div>
                  <div className="dim">{mock.statement.transactionCount} entries · 3 days ago</div>
                </div>
              </div>
              <button className="pill-btn small">+ add another</button>
            </div>
          </section>

          {/* BOTTOM — categories + merchants */}
          <section className="bottom-grid">
            <div className="big-card">
              <div className="bc-head">
                <h3 className="bc-title">how you spent it</h3>
                <span className="bc-sub">a quiet inventory</span>
              </div>
              <div className="cat-list">
                {mock.byCategory.map((c, i) => (
                  <div key={c.name} className="cat-row">
                    <div className="cat-name-row">
                      <span className="cat-bubble" style={{ background: palette[i % palette.length] }} />
                      <span className="cat-name">{c.name}</span>
                      <span className="cat-amt">{money(c.cents, { showCents: false })}</span>
                    </div>
                    <div className="cat-bar-wrap">
                      <div
                        className="cat-bar-fill"
                        style={{
                          width: `${(c.cents / max) * 100}%`,
                          background: `linear-gradient(90deg, ${palette[i % palette.length]}, ${palette[(i+1) % palette.length]})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="big-card">
              <div className="bc-head">
                <h3 className="bc-title">the regulars</h3>
                <span className="bc-sub">your most-visited places</span>
              </div>
              <ul className="merch-list">
                {mock.topMerchants.map((m, i) => (
                  <li key={m.name} className="merch-li">
                    <div
                      className="m-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${palette[i % palette.length]}, ${palette[(i+2) % palette.length]})`,
                      }}
                    >
                      {m.name[0]}
                    </div>
                    <div className="m-main">
                      <div className="m-name-row">
                        <span className="m-name">{m.name}</span>
                        <span className="m-amt">{money(m.cents)}</span>
                      </div>
                      <div className="m-visits">
                        {Array.from({ length: Math.min(m.count, 14) }).map((_, k) => (
                          <span key={k} className="visit-dot" style={{ background: palette[i % palette.length] }} />
                        ))}
                        <span className="m-count">{m.count} visits</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="warm-quote">
                <p>"the small daily ones add up to a self."</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function prettyName(s: string): string {
  return s.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase());
}

function Donut({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const off = c - (c * pct) / 100;
  return (
    <svg className="donut" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5d8a3f" />
          <stop offset="100%" stopColor="#8eb567" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r={r} stroke="rgba(0,0,0,0.07)" strokeWidth="10" fill="none" />
      <circle
        cx="40" cy="40" r={r}
        stroke="url(#donut-grad)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 40 40)"
      />
    </svg>
  );
}

const BLOOM_CSS = `
.bloom-root {
  --cream: #fdf9f0;
  --pistachio: #cae0a8;
  --peach: #f8d7c0;
  --lavender: #dcd3f0;
  --ink: #2d2418;
  --ink-2: #574532;
  --ink-3: #9c8a73;
  min-height: 100vh;
  background: var(--cream);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.55;
  position: relative;
}
.mesh {
  position: fixed; inset: 0;
  z-index: 0;
  filter: blur(60px);
  pointer-events: none;
  opacity: 0.8;
  overflow: hidden;
}
.blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: multiply;
}
.b1 { width: 50vw; height: 50vw; top: -10vw; left: -10vw; background: #cae0a8; animation: drift 22s ease-in-out infinite alternate; }
.b2 { width: 45vw; height: 45vw; top: 10vw; right: -15vw; background: #f8d7c0; animation: drift 28s ease-in-out infinite alternate-reverse; }
.b3 { width: 40vw; height: 40vw; bottom: -10vw; left: 15vw; background: #dcd3f0; animation: drift 26s ease-in-out infinite alternate; }
.b4 { width: 30vw; height: 30vw; top: 40vw; left: 30vw; background: #f5e3a0; animation: drift 32s ease-in-out infinite alternate-reverse; opacity: 0.7; }
.b5 { width: 28vw; height: 28vw; bottom: 5vw; right: 10vw; background: #c6e3d4; animation: drift 30s ease-in-out infinite alternate; }
@keyframes drift {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(40px, -50px) scale(1.08); }
}

.grain {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.45;
  mix-blend-mode: multiply;
}

.bloom-frame {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 28px;
  padding: 26px 32px 60px;
  max-width: 1320px;
  margin: 0 auto;
}

/* SIDE */
.bloom-side {
  position: sticky;
  top: 26px;
  align-self: start;
  max-height: calc(100vh - 52px);
  overflow-y: auto;
  background: rgba(255, 252, 244, 0.55);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 32px;
  padding: 22px 16px 18px;
  box-shadow: 0 8px 32px rgba(45,36,24,0.07), inset 0 0 0 1px rgba(255,255,255,0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.brand {
  display: flex; align-items: center; gap: 12px;
  padding: 0 8px 14px;
  border-bottom: 1px dashed rgba(45,36,24,0.12);
}
.brand-mark {
  position: relative;
  width: 34px; height: 34px;
}
.brand-mark .petal {
  position: absolute;
  width: 14px; height: 22px;
  border-radius: 50% 50% 50% 50% / 80% 80% 20% 20%;
  background: var(--pistachio);
  left: 10px; top: 0;
  transform-origin: 50% 100%;
}
.brand-mark .p1 { transform: rotate(0deg); background: #cae0a8; }
.brand-mark .p2 { transform: rotate(120deg); background: #f8d7c0; }
.brand-mark .p3 { transform: rotate(240deg); background: #dcd3f0; }
.brand-core {
  position: absolute;
  width: 10px; height: 10px;
  background: #fdf9f0;
  border-radius: 50%;
  left: 12px; top: 12px;
  border: 1.5px solid var(--ink);
  z-index: 2;
}
.brand-text {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-style: italic;
}

.bloom-nav { display: flex; flex-direction: column; gap: 2px; }
.bn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-2);
  transition: background 0.2s, color 0.2s;
}
.bn:hover { background: rgba(255,255,255,0.5); color: var(--ink); }
.bn.active {
  background: var(--ink);
  color: var(--cream);
  box-shadow: 0 6px 18px -6px rgba(45,36,24,0.35);
}
.bn-icon {
  display: inline-flex;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--ink-2);
  box-shadow: inset 0 0 0 1px rgba(45,36,24,0.08);
}
.bn.active .bn-icon {
  background: var(--pistachio);
  color: var(--ink);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4);
}
.bn-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #f8d7c0, #f5b893);
  color: #6b3a1f;
  font-family: 'Fraunces', serif;
  font-size: 12px;
  font-weight: 600;
  padding: 1px 9px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);
}

.nav-section-label {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 12px;
  color: var(--ink-3);
  padding: 6px 12px 2px;
  letter-spacing: 0.02em;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 8px 6px;
  border-top: 1px dashed rgba(45,36,24,0.12);
  margin-top: auto;
}
.profile-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dcd3f0, #f8d7c0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-size: 15px;
  color: var(--ink);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
}
.profile-info { line-height: 1.15; }
.profile-name {
  font-family: 'Fraunces', serif;
  font-size: 15px;
  color: var(--ink);
}
.profile-meta { font-size: 11px; color: var(--ink-3); }

/* MAIN */
.bloom-main { display: flex; flex-direction: column; gap: 26px; }
.b-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 12px 4px 0;
}
.b-eyebrow {
  font-size: 13px;
  color: var(--ink-3);
  letter-spacing: 0.02em;
}
.b-eyebrow em { font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-2); }
.b-title {
  font-family: 'Fraunces', serif;
  font-size: 56px;
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 6px 0 6px;
}
.b-title em { font-style: italic; font-weight: 300; color: #c5704a; }
.b-sub { color: var(--ink-2); font-size: 16px; margin: 0; max-width: 520px; }
.b-month-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 999px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 17px;
  box-shadow: 0 6px 18px rgba(45,36,24,0.05);
}

/* ACTION CARD */
.action-card {
  position: relative;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 32px;
  padding: 36px;
  border-radius: 36px;
  background: rgba(255,253,247,0.55);
  border: 1px solid rgba(255,255,255,0.8);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  box-shadow: 0 16px 50px -10px rgba(45,36,24,0.12), inset 0 0 0 1px rgba(255,255,255,0.5);
  overflow: hidden;
}
.action-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 100%, rgba(202,224,168,0.5), transparent 40%),
    radial-gradient(circle at 90% 0%, rgba(248,215,192,0.6), transparent 50%);
  pointer-events: none;
}
.action-left, .action-right { position: relative; z-index: 1; }
.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(248,215,192,0.7);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
  border: 1px solid rgba(255,255,255,0.6);
}
.tag-warm { background: rgba(248,215,192,0.8); }
.huge-num {
  font-family: 'Fraunces', serif;
  font-size: 168px;
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.05em;
  margin: 12px 0;
  display: flex;
  align-items: flex-end;
  gap: 18px;
  color: var(--ink);
}
.huge-sub {
  font-size: 18px;
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  color: var(--ink-2);
  line-height: 1.25;
  padding-bottom: 18px;
  letter-spacing: 0;
}
.action-copy {
  font-family: 'Fraunces', serif;
  font-size: 19px;
  line-height: 1.5;
  color: var(--ink-2);
  margin: 0 0 22px;
  max-width: 480px;
  font-weight: 400;
}
.action-copy em { font-style: italic; color: #c5704a; }
.action-buttons { display: flex; gap: 10px; }
.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 999px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 15px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.pill-btn.primary {
  background: var(--ink);
  color: var(--cream);
  box-shadow: 0 8px 22px -6px rgba(45,36,24,0.4);
}
.pill-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 10px 26px -6px rgba(45,36,24,0.5); }
.pill-btn.primary .arr { transition: transform 0.2s; }
.pill-btn.primary:hover .arr { transform: translateX(3px); }
.pill-btn.ghost {
  background: transparent;
  color: var(--ink-2);
  border: 1px solid rgba(45,36,24,0.18);
}
.pill-btn.ghost:hover { background: rgba(255,255,255,0.5); }
.pill-btn.small { padding: 8px 16px; font-size: 13px; background: rgba(45,36,24,0.06); color: var(--ink); margin-top: 14px; }
.pill-btn.small:hover { background: rgba(45,36,24,0.12); }

.action-right {
  align-self: center;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 24px;
  padding: 22px;
  backdrop-filter: blur(10px);
}
.recent-head {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 14px;
  color: var(--ink-3);
  margin-bottom: 14px;
}
.recent-row {
  display: grid;
  grid-template-columns: 8px 44px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(45,36,24,0.1);
  font-size: 14px;
}
.r-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: linear-gradient(135deg, #f8d7c0, #c5704a);
}
.r-date { font-size: 12px; color: var(--ink-3); }
.r-name { font-weight: 500; }
.r-amt { font-family: 'Fraunces', serif; font-weight: 500; font-size: 16px; }
.recent-more {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 13px;
  color: var(--ink-3);
  text-align: center;
  margin-top: 12px;
}

/* STAT TRIO */
.stat-trio {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1.1fr;
  gap: 20px;
}
.stat-card {
  position: relative;
  border-radius: 30px;
  padding: 26px 28px 24px;
  border: 1px solid rgba(255,255,255,0.8);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow: 0 12px 36px -10px rgba(45,36,24,0.1);
  overflow: hidden;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.stat-card.peach    { background: linear-gradient(135deg, rgba(248,215,192,0.75), rgba(245,227,160,0.55)); }
.stat-card.pistachio{ background: linear-gradient(135deg, rgba(202,224,168,0.75), rgba(198,227,212,0.55)); }
.stat-card.lavender { background: linear-gradient(135deg, rgba(220,211,240,0.75), rgba(248,215,192,0.4)); }

.stat-cap {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 15px;
  color: var(--ink-2);
}
.stat-figure {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: 56px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 4px 0 8px;
  font-feature-settings: 'lnum';
}
.ccy { font-size: 30px; color: var(--ink-3); vertical-align: top; }
.cents { font-size: 26px; color: var(--ink-3); }
.big-pct { font-size: 80px; }
.pct-sign { font-size: 32px; color: var(--ink-3); margin-left: 4px; }
.stat-meta { font-size: 13px; color: var(--ink-2); }
.dot-good { color: #5d8a3f; }
.wave {
  width: calc(100% + 56px);
  height: 50px;
  margin: 14px -28px -24px;
  display: block;
}

.ring-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
}
.ring-meta { font-size: 13px; line-height: 1.4; }
.ring-meta b { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 500; }
.ring-meta .dim { color: var(--ink-3); }

.stmt-period {
  font-family: 'Fraunces', serif;
  font-size: 32px;
  font-weight: 400;
  letter-spacing: -0.01em;
  margin: 6px 0 14px;
}
.stmt-meta-row { display: flex; gap: 12px; align-items: center; font-size: 13px; }
.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f8d7c0, #c5704a);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fraunces', serif;
  font-size: 17px;
  box-shadow: 0 4px 10px rgba(45,36,24,0.15);
}
.stmt-uploader { color: var(--ink); }
.dim { color: var(--ink-3); font-size: 12px; }

/* BOTTOM */
.bottom-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 22px;
}
.big-card {
  position: relative;
  border-radius: 32px;
  padding: 30px 32px 32px;
  background: rgba(255,253,247,0.55);
  border: 1px solid rgba(255,255,255,0.8);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  box-shadow: 0 14px 44px -10px rgba(45,36,24,0.1), inset 0 0 0 1px rgba(255,255,255,0.45);
}
.bc-head { margin-bottom: 22px; }
.bc-title {
  font-family: 'Fraunces', serif;
  font-size: 32px;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.1;
}
.bc-sub {
  display: block;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 14px;
  color: var(--ink-3);
  margin-top: 2px;
}

.cat-list { display: flex; flex-direction: column; gap: 14px; }
.cat-row {}
.cat-name-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}
.cat-bubble {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
}
.cat-name { flex: 1; font-weight: 500; font-size: 15px; }
.cat-amt { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 500; }
.cat-bar-wrap {
  height: 12px;
  background: rgba(45,36,24,0.06);
  border-radius: 999px;
  overflow: hidden;
}
.cat-bar-fill {
  height: 100%;
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
  transition: width 0.6s ease;
}

.merch-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.merch-li { display: flex; gap: 14px; align-items: center; }
.m-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--ink);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 4px 12px rgba(45,36,24,0.08);
}
.m-main { flex: 1; min-width: 0; }
.m-name-row { display: flex; justify-content: space-between; align-items: baseline; }
.m-name { font-weight: 500; font-size: 15px; }
.m-amt { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 500; }
.m-visits { display: flex; align-items: center; gap: 3px; margin-top: 4px; }
.visit-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  opacity: 0.7;
}
.m-count {
  margin-left: 8px;
  font-size: 12px;
  color: var(--ink-3);
  font-family: 'Fraunces', serif;
  font-style: italic;
}
.warm-quote {
  margin-top: 24px;
  padding: 18px 22px;
  background: rgba(248,215,192,0.4);
  border-radius: 22px;
  border: 1px dashed rgba(197,112,74,0.4);
}
.warm-quote p {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 17px;
  margin: 0;
  text-align: center;
  color: var(--ink-2);
}
`;
