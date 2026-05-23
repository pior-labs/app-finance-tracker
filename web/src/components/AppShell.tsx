import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/BrandMark';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileNavOpen]);

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
    <div className="bloom-root relative min-h-screen bg-cream text-ink font-sans text-[15px] leading-[1.55]">
      <div className="bloom-mesh">
        <div className="bloom-blob b1" />
        <div className="bloom-blob b2" />
        <div className="bloom-blob b3" />
        <div className="bloom-blob b4" />
        <div className="bloom-blob b5" />
      </div>
      <div className="bloom-grain" />

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/70 bg-[rgba(255,252,244,0.85)] px-4 py-3 backdrop-blur-xl backdrop-saturate-150 md:hidden [padding-top:max(0.75rem,env(safe-area-inset-top))]">
        <Link to="/" className="flex items-center gap-2.5 text-inherit no-underline">
          <BrandMark size={28} />
          <span className="font-serif text-[19px] font-medium italic tracking-tight">finlens</span>
        </Link>
        <button
          type="button"
          aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileNavOpen}
          aria-controls="bloom-mobile-nav"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/80 bg-white/60 p-0 shadow-[inset_0_0_0_1px_rgba(45,36,24,0.04)] hover:bg-white/85"
        >
          <BurgerBars open={mobileNavOpen} />
        </button>
      </header>

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 cursor-pointer border-0 bg-ink/40 p-0 animate-bloom-scrim-in motion-reduce:animate-none backdrop-blur-[2px] md:hidden"
        />
      )}

      <div className="relative z-[2] mx-auto grid max-w-[1320px] grid-cols-1 gap-0 px-4 pt-4 pb-12 md:grid-cols-[220px_1fr] md:gap-7 md:px-8 md:pt-6 md:pb-15">
        <aside
          id="bloom-mobile-nav"
          className={[
            'flex flex-col gap-1.5 rounded-[32px] border border-white/80 bg-[rgba(255,252,244,0.55)] p-[22px_16px_18px] shadow-[0_8px_32px_rgba(45,36,24,0.07),inset_0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150',
            'fixed left-0 top-0 bottom-0 z-50 w-[min(86vw,320px)] max-h-none rounded-l-none -translate-x-[105%] transition-transform duration-250 motion-reduce:transition-none [padding-top:max(1.375rem,env(safe-area-inset-top))] [padding-bottom:max(1.125rem,env(safe-area-inset-bottom))]',
            mobileNavOpen ? 'translate-x-0 shadow-[24px_0_60px_-20px_rgba(45,36,24,0.3)]' : '',
            'md:sticky md:top-6 md:left-auto md:bottom-auto md:z-auto md:w-auto md:max-h-[calc(100vh-52px)] md:translate-x-0 md:self-start md:overflow-y-auto md:rounded-[32px] md:py-[22px] md:pb-[18px]',
          ].join(' ')}
        >
          <Link
            to="/"
            className="mb-2 flex items-center gap-3 border-b border-dashed border-ink/10 px-2 pb-3.5 text-inherit no-underline max-md:hidden"
          >
            <BrandMark size={34} />
            <span className="font-serif text-[22px] font-medium italic tracking-tight">finlens</span>
          </Link>

          <nav className="flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <NavIcon active={isActive}>{item.icon}</NavIcon>
                    <span className="flex-1">{item.name}</span>
                    {item.badgeKey === 'uncategorized' && uncategorizedTotal > 0 && (
                      <span className="ml-auto rounded-full bg-[linear-gradient(135deg,#f8d7c0,#f5b893)] px-2.5 py-px font-serif text-xs font-semibold text-[#6b3a1f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]">
                        {uncategorizedTotal}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="px-3 pt-3 pb-1 font-serif text-xs italic tracking-wide text-ink-3">Admin</div>
          <nav className="flex flex-col gap-0.5">
            {adminNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <NavIcon active={isActive}>{item.icon}</NavIcon>
                    <span className="flex-1">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="min-h-3 flex-1" />

          <div ref={profileMenuRef} className="relative border-t border-dashed border-ink/10 pt-3">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              className={[
                'flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border-0 bg-transparent p-[8px_10px] text-left font-[inherit] transition-colors hover:bg-white/50',
                profileMenuOpen ? 'bg-white/70' : '',
              ].join(' ')}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dcd3f0,#f8d7c0)] font-serif text-[15px] text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-[1.15]">
                <span className="truncate font-serif text-[15px] text-ink">{user?.name ?? 'Account'}</span>
                <span className="text-[11px] text-ink-3">Account ⌄</span>
              </span>
            </button>
            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-[18px] border border-white/80 bg-[rgba(255,253,247,0.92)] p-1.5 shadow-[0_14px_36px_-8px_rgba(45,36,24,0.18),inset_0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    void logout();
                  }}
                  className="w-full cursor-pointer rounded-xl border-0 bg-transparent px-3 py-2.5 text-left font-[inherit] text-[13px] text-ink hover:bg-ink/5"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function navLinkClass(isActive: boolean) {
  const base =
    'flex items-center gap-2.5 rounded-full px-3 py-2.5 text-sm font-medium no-underline transition-colors';
  return isActive
    ? `${base} bg-pistachio text-ink shadow-[0_6px_18px_-8px_rgba(93,138,63,0.45)] ring-1 ring-inset ring-white/60`
    : `${base} text-ink-2 hover:bg-white/50 hover:text-ink`;
}

function NavIcon({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={[
        'inline-flex h-5.5 w-5.5 flex-shrink-0 items-center justify-center rounded-full text-xs shadow-[inset_0_0_0_1px_rgba(45,36,24,0.08)]',
        active ? 'bg-cream text-ink shadow-[inset_0_0_0_1px_rgba(45,36,24,0.08)]' : 'bg-white/70 text-ink-2',
      ].join(' ')}
      style={{ width: 22, height: 22 }}
    >
      {children}
    </span>
  );
}

function BurgerBars({ open }: { open: boolean }) {
  return (
    <span className="relative inline-block h-3.5 w-[18px]">
      <span
        className="absolute left-0 right-0 h-0.5 rounded-sm bg-ink transition-[transform,opacity,top] duration-200"
        style={{ top: open ? 6 : 0, transform: open ? 'rotate(45deg)' : 'none' }}
      />
      <span
        className="absolute left-0 right-0 h-0.5 rounded-sm bg-ink transition-[transform,opacity,top] duration-200"
        style={{ top: 6, opacity: open ? 0 : 1 }}
      />
      <span
        className="absolute left-0 right-0 h-0.5 rounded-sm bg-ink transition-[transform,opacity,top] duration-200"
        style={{ top: open ? 6 : 12, transform: open ? 'rotate(-45deg)' : 'none' }}
      />
    </span>
  );
}
