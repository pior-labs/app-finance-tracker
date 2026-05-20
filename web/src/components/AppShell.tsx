import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const mainNav = [
  { name: 'Dashboard', path: '/', icon: '◐' },
  { name: 'Categorize', path: '/categorize', icon: '✦', badgeKey: 'uncategorized' as const },
];

const adminNav = [
  { name: 'Transactions', path: '/transactions', icon: '≡' },
  { name: 'Categories', path: '/categories', icon: '❀' },
  { name: 'Statements', path: '/statements', icon: '▤' },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [uncategorizedTotal, setUncategorizedTotal] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/transactions?status=needs_review&limit=1', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`tx ${res.status}`))))
      .then((payload: { pagination?: { total?: number } }) => {
        if (cancelled) return;
        setUncategorizedTotal(Number(payload.pagination?.total ?? 0));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [profileMenuOpen]);

  return (
    <div className="bloom-root">
      <style>{BLOOM_SHELL_CSS}</style>

      <div className="mesh">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="blob b4" />
        <div className="blob b5" />
      </div>
      <div className="grain" />

      <div className="bloom-frame">
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
            {mainNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `bn${isActive ? ' active' : ''}`}
              >
                <span className="bn-icon">{item.icon}</span>
                <span className="bn-label">{item.name}</span>
                {item.badgeKey === 'uncategorized' && uncategorizedTotal > 0 && (
                  <span className="bn-badge">{uncategorizedTotal}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="nav-section-label">Admin</div>
          <nav className="bloom-nav">
            {adminNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `bn${isActive ? ' active' : ''}`}
              >
                <span className="bn-icon">{item.icon}</span>
                <span className="bn-label">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="side-spacer" />

          <div ref={profileMenuRef} className="profile-wrap">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              className={`profile-card${profileMenuOpen ? ' open' : ''}`}
            >
              <span className="profile-avatar">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="profile-info">
                <span className="profile-name">{user?.name ?? 'Account'}</span>
                <span className="profile-meta">Account ⌄</span>
              </span>
            </button>
            {profileMenuOpen && (
              <div role="menu" className="profile-menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    void logout();
                  }}
                  className="profile-menu-item"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="bloom-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const BLOOM_SHELL_CSS = `
.bloom-root {
  --cream: #fdf9f0;
  --pistachio: #cae0a8;
  --peach: #f8d7c0;
  --lavender: #dcd3f0;
  --ink: #2d2418;
  --ink-2: #574532;
  --ink-3: #9c8a73;
  --accent: #c5704a;
  min-height: 100vh;
  background: var(--cream);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.55;
  position: relative;
}
.bloom-root .mesh {
  position: fixed; inset: 0;
  z-index: 0;
  filter: blur(60px);
  pointer-events: none;
  opacity: 0.8;
  overflow: hidden;
}
.bloom-root .blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: multiply;
}
.bloom-root .b1 { width: 50vw; height: 50vw; top: -10vw; left: -10vw; background: #cae0a8; animation: bloom-drift 22s ease-in-out infinite alternate; }
.bloom-root .b2 { width: 45vw; height: 45vw; top: 10vw; right: -15vw; background: #f8d7c0; animation: bloom-drift 28s ease-in-out infinite alternate-reverse; }
.bloom-root .b3 { width: 40vw; height: 40vw; bottom: -10vw; left: 15vw; background: #dcd3f0; animation: bloom-drift 26s ease-in-out infinite alternate; }
.bloom-root .b4 { width: 30vw; height: 30vw; top: 40vw; left: 30vw; background: #f5e3a0; animation: bloom-drift 32s ease-in-out infinite alternate-reverse; opacity: 0.7; }
.bloom-root .b5 { width: 28vw; height: 28vw; bottom: 5vw; right: 10vw; background: #c6e3d4; animation: bloom-drift 30s ease-in-out infinite alternate; }
@keyframes bloom-drift {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(40px, -50px) scale(1.08); }
}

.bloom-root .grain {
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
  gap: 6px;
}
.bloom-side .brand {
  display: flex; align-items: center; gap: 12px;
  padding: 0 8px 14px;
  border-bottom: 1px dashed rgba(45,36,24,0.12);
  text-decoration: none;
  color: inherit;
  margin-bottom: 8px;
}
.bloom-side .brand-mark {
  position: relative;
  width: 34px; height: 34px;
  flex-shrink: 0;
}
.bloom-side .brand-mark .petal {
  position: absolute;
  width: 14px; height: 22px;
  border-radius: 50% 50% 50% 50% / 80% 80% 20% 20%;
  background: var(--pistachio);
  left: 10px; top: 0;
  transform-origin: 50% 100%;
}
.bloom-side .brand-mark .p1 { transform: rotate(0deg); background: #cae0a8; }
.bloom-side .brand-mark .p2 { transform: rotate(120deg); background: #f8d7c0; }
.bloom-side .brand-mark .p3 { transform: rotate(240deg); background: #dcd3f0; }
.bloom-side .brand-core {
  position: absolute;
  width: 10px; height: 10px;
  background: #fdf9f0;
  border-radius: 50%;
  left: 12px; top: 12px;
  border: 1.5px solid var(--ink);
  z-index: 2;
}
.bloom-side .brand-text {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-style: italic;
}

.bloom-side .bloom-nav { display: flex; flex-direction: column; gap: 2px; }
.bloom-side .bn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-2);
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
}
.bloom-side .bn:hover { background: rgba(255,255,255,0.5); color: var(--ink); }
.bloom-side .bn.active {
  background: var(--ink);
  color: var(--cream);
  box-shadow: 0 6px 18px -6px rgba(45,36,24,0.35);
}
.bloom-side .bn-icon {
  display: inline-flex;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--ink-2);
  box-shadow: inset 0 0 0 1px rgba(45,36,24,0.08);
  flex-shrink: 0;
}
.bloom-side .bn.active .bn-icon {
  background: var(--pistachio);
  color: var(--ink);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4);
}
.bloom-side .bn-label { flex: 1; }
.bloom-side .bn-badge {
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

.bloom-side .nav-section-label {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 12px;
  color: var(--ink-3);
  padding: 12px 12px 4px;
  letter-spacing: 0.02em;
}

.bloom-side .side-spacer { flex: 1; min-height: 12px; }

.bloom-side .profile-wrap {
  position: relative;
  padding-top: 12px;
  border-top: 1px dashed rgba(45,36,24,0.12);
}
.bloom-side .profile-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  width: 100%;
  background: transparent;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s;
}
.bloom-side .profile-card:hover { background: rgba(255,255,255,0.5); }
.bloom-side .profile-card.open { background: rgba(255,255,255,0.7); }
.bloom-side .profile-avatar {
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
  flex-shrink: 0;
}
.bloom-side .profile-info {
  line-height: 1.15;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.bloom-side .profile-name {
  font-family: 'Fraunces', serif;
  font-size: 15px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bloom-side .profile-meta { font-size: 11px; color: var(--ink-3); }

.bloom-side .profile-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background: rgba(255,253,247,0.92);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 18px;
  padding: 6px;
  box-shadow: 0 14px 36px -8px rgba(45,36,24,0.18), inset 0 0 0 1px rgba(255,255,255,0.5);
  z-index: 20;
}
.bloom-side .profile-menu-item {
  width: 100%;
  background: transparent;
  border: 0;
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
}
.bloom-side .profile-menu-item:hover { background: rgba(45,36,24,0.06); }

.bloom-main {
  display: flex;
  flex-direction: column;
  gap: 26px;
  min-width: 0;
}
`;
