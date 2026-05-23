import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/BrandMark';
import { ToastViewport } from '@/hooks/useToast';

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
  const [scrolled, setScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

      <header
        aria-hidden={mobileNavOpen}
        className={[
          'pointer-events-none fixed top-0 left-0 right-0 z-30 md:hidden',
          mobileNavOpen ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
        style={{ transition: 'opacity 200ms ease-out' }}
      >
        <div
          aria-hidden="true"
          style={{ transition: 'opacity 300ms ease-out' }}
          className={[
            'pointer-events-none absolute inset-0 border-b border-white/70 bg-[rgba(255,252,244,0.85)] backdrop-blur-xl backdrop-saturate-150',
            scrolled ? 'opacity-0' : 'opacity-100',
          ].join(' ')}
        />
        <div className="relative flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link
            to="/"
            style={{ transition: 'opacity 300ms ease-out' }}
            className={[
              'flex items-center gap-2.5 text-inherit no-underline',
              scrolled ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100',
            ].join(' ')}
            aria-hidden={scrolled}
            tabIndex={scrolled ? -1 : 0}
          >
            <BrandMark size={28} />
            <span className="font-serif text-[19px] font-medium italic tracking-tight">finlens</span>
          </Link>
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
            aria-controls="bloom-mobile-nav"
            onClick={() => setMobileNavOpen(true)}
            className="pointer-events-auto inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-ink/10 bg-ink p-0 text-cream shadow-[0_8px_22px_-6px_rgba(45,36,24,0.4)] transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-px hover:bg-ink/95 hover:shadow-[0_10px_26px_-6px_rgba(45,36,24,0.5)] motion-reduce:hover:translate-y-0"
          >
            <BurgerBars open={false} />
          </button>
        </div>
      </header>

      {mobileNavOpen && (
        <MobileNavOverlay
          uncategorizedTotal={uncategorizedTotal}
          userName={user?.name}
          onClose={() => setMobileNavOpen(false)}
          onSignOut={() => {
            setMobileNavOpen(false);
            void logout();
          }}
        />
      )}

      <div className="relative z-[2] mx-auto grid max-w-[1320px] grid-cols-1 gap-0 px-4 pt-[calc(68px+env(safe-area-inset-top))] pb-12 md:grid-cols-[220px_1fr] md:gap-7 md:px-8 md:pt-6 md:pb-15">
        <aside
          id="bloom-desktop-nav"
          className="hidden flex-col gap-1.5 rounded-[32px] border border-white/80 bg-[rgba(255,252,244,0.55)] p-[22px_16px_18px] shadow-[0_8px_32px_rgba(45,36,24,0.07),inset_0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150 md:sticky md:top-6 md:flex md:max-h-[calc(100vh-52px)] md:self-start md:overflow-y-auto"
        >
          <Link
            to="/"
            className="mb-2 flex items-center gap-3 border-b border-dashed border-ink/10 px-2 pb-3.5 text-inherit no-underline"
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
      <ToastViewport />
    </div>
  );
}

function navLinkClass(isActive: boolean) {
  const base =
    'flex items-center gap-2.5 rounded-full px-3 py-2.5 text-sm font-medium no-underline transition-colors';
  return isActive
    ? `${base} bg-ink text-cream shadow-[0_6px_18px_-6px_rgba(45,36,24,0.35)]`
    : `${base} text-ink-2 hover:bg-white/50 hover:text-ink`;
}

function NavIcon({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={[
        'inline-flex h-5.5 w-5.5 flex-shrink-0 items-center justify-center rounded-full text-xs shadow-[inset_0_0_0_1px_rgba(45,36,24,0.08)]',
        active ? 'bg-pistachio text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]' : 'bg-white/70 text-ink-2',
      ].join(' ')}
      style={{ width: 22, height: 22 }}
    >
      {children}
    </span>
  );
}

type MobileNavOverlayProps = {
  uncategorizedTotal: number;
  userName: string | undefined;
  onClose: () => void;
  onSignOut: () => void;
};

function MobileNavOverlay({ uncategorizedTotal, userName, onClose, onSignOut }: MobileNavOverlayProps) {
  const allItems = [
    ...mainNav.map((item) => ({ ...item, group: 'main' as const })),
    ...adminNav.map((item) => ({ ...item, group: 'admin' as const, badgeKey: undefined as undefined })),
  ];
  return (
    <div
      id="bloom-mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
      className="bloom-overlay-anim fixed inset-0 z-50 flex flex-col bg-cream motion-reduce:animate-none md:hidden"
    >
      <div className="bloom-mesh pointer-events-none" aria-hidden="true">
        <div className="bloom-blob b1" />
        <div className="bloom-blob b3" />
        <div className="bloom-blob b5" />
      </div>

      <div className="relative flex items-center justify-between gap-3 px-5 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]">
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5 text-inherit no-underline">
          <BrandMark size={30} />
          <span className="font-serif text-[20px] font-medium italic tracking-tight">finlens</span>
        </Link>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-ink/10 bg-white/60 p-0 text-ink shadow-[0_4px_14px_-4px_rgba(45,36,24,0.18),inset_0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-md transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-px hover:bg-white/80 motion-reduce:hover:translate-y-0"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-6 pb-6 pt-6">
        {allItems.map((item, idx) => {
          const showAdminHeader = item.group === 'admin' && allItems[idx - 1]?.group !== 'admin';
          return (
            <div key={item.path} style={{ animationDelay: `${120 + idx * 70}ms` }} className="bloom-overlay-item-anim motion-reduce:animate-none">
              {showAdminHeader && (
                <div className="mb-2 mt-5 font-serif text-xs italic tracking-[0.18em] uppercase text-ink-3">Admin</div>
              )}
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'group flex items-baseline gap-3 border-b border-dashed border-ink/10 py-3.5 text-left no-underline transition-colors',
                    isActive ? 'text-ink' : 'text-ink-2 hover:text-ink',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={[
                        'font-serif text-[13px] italic w-6 shrink-0',
                        isActive ? 'text-ink' : 'text-ink-3',
                      ].join(' ')}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={[
                        'flex-1 font-serif text-[28px] leading-[1.1] tracking-tight',
                        isActive ? 'italic' : '',
                      ].join(' ')}
                    >
                      {item.name}
                    </span>
                    {item.badgeKey === 'uncategorized' && uncategorizedTotal > 0 && (
                      <span className="rounded-full bg-[linear-gradient(135deg,#f8d7c0,#f5b893)] px-2.5 py-0.5 font-serif text-xs font-semibold text-[#6b3a1f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]">
                        {uncategorizedTotal}
                      </span>
                    )}
                    {isActive && (
                      <span aria-hidden="true" className="font-serif text-[20px] italic text-ink">
                        →
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </div>
          );
        })}
      </nav>

      <div className="relative flex items-center justify-between gap-3 border-t border-dashed border-ink/15 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dcd3f0,#f8d7c0)] font-serif text-[16px] text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
            {userName?.[0]?.toUpperCase() ?? '?'}
          </span>
          <span className="flex min-w-0 flex-col leading-[1.15]">
            <span className="truncate font-serif text-[15px] text-ink">{userName ?? 'Account'}</span>
            <span className="text-[11px] text-ink-3">Signed in</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="cursor-pointer rounded-full border border-ink/15 bg-transparent px-4 py-2 font-serif text-[13px] italic text-ink transition-colors hover:bg-ink/5"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BurgerBars({ open }: { open: boolean }) {
  return (
    <span className="relative inline-block h-3.5 w-[18px]">
      <span
        className="absolute left-0 right-0 h-0.5 rounded-sm bg-cream transition-[transform,opacity,top] duration-200"
        style={{ top: open ? 6 : 0, transform: open ? 'rotate(45deg)' : 'none' }}
      />
      <span
        className="absolute left-0 right-0 h-0.5 rounded-sm bg-cream transition-[transform,opacity,top] duration-200"
        style={{ top: 6, opacity: open ? 0 : 1 }}
      />
      <span
        className="absolute left-0 right-0 h-0.5 rounded-sm bg-cream transition-[transform,opacity,top] duration-200"
        style={{ top: open ? 6 : 12, transform: open ? 'rotate(-45deg)' : 'none' }}
      />
    </span>
  );
}
