import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isValidMonth(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}$/.test(value);
}

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-');
  const parsed = new Date(Number(year), Number(monthNumber) - 1, 1);
  if (Number.isNaN(parsed.getTime())) return month;
  return parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

const mainNav = [
  { name: 'Dashboard', path: '/', icon: 'D' },
  { name: 'Categorize', path: '/categorize', icon: '★', badgeKey: 'uncategorized' as const },
];

const adminNav = [
  { name: 'Transactions', path: '/transactions', icon: 'T' },
  { name: 'Categories', path: '/categories', icon: 'C' },
  { name: 'Statements', path: '/statements', icon: 'S' },
];

interface NavItemProps {
  to: string;
  label: string;
  icon: string;
  collapsed: boolean;
  badge?: number;
}

function NavItem({ to, label, icon, collapsed, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg border-[1.3px] py-2 text-sm transition-colors',
          collapsed ? 'justify-center px-0' : 'px-2.5',
          isActive
            ? 'border-border bg-primary-soft shadow-sketch-xs'
            : 'border-transparent hover:bg-card'
        )
      }
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm">
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 font-bold">{label}</span>
          {badge != null && (
            <span
              className={cn(
                'rounded-full border-[1.3px] border-border px-2 py-0.5 text-[11px] font-bold shadow-none',
                badge > 0 ? 'bg-warn-soft text-warn' : 'bg-good-soft text-good'
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const monthFromUrl = searchParams.get('month');
  const selectedMonth = isValidMonth(monthFromUrl) ? monthFromUrl : getCurrentMonth();
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [uncategorizedTotal, setUncategorizedTotal] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/transactions/stats', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`stats ${res.status}`))))
      .then((payload: { meta?: { availableMonths?: string[] } }) => {
        if (cancelled) return;
        const months = new Set<string>([getCurrentMonth(), ...(payload.meta?.availableMonths ?? [])]);
        setAvailableMonths(Array.from(months).sort((a, b) => b.localeCompare(a)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
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
    if (!pickerOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [pickerOpen]);

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

  const onPickMonth = (m: string) => {
    const next = new URLSearchParams(searchParams);
    if (m === getCurrentMonth()) {
      next.delete('month');
    } else {
      next.set('month', m);
    }
    setSearchParams(next, { replace: true });
    setPickerOpen(false);
  };

  const pageTitle = (() => {
    if (location.pathname === '/') return 'Hey there 👋';
    if (location.pathname === '/categorize') return 'Categorize';
    if (location.pathname === '/transactions') return 'All transactions';
    if (location.pathname === '/categories') return 'Categories';
    if (location.pathname === '/statements') return 'Statements';
    return 'FinLens';
  })();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r-[1.5px] border-border bg-muted p-3 transition-all duration-200',
          collapsed ? 'w-16' : 'w-50'
        )}
      >
        {/* Logo + collapse toggle */}
        {collapsed ? (
          <div className="group relative mb-4 flex justify-center px-1">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex items-center"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <span className="relative flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border bg-primary-soft transition-colors group-hover:bg-card">
                <span className="absolute inset-1.25 rounded-full border-[1.5px] border-border bg-card transition-colors group-hover:bg-primary-soft" />
              </span>
            </button>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-lg border-[1.3px] border-border bg-card px-2.5 py-1.5 font-hand text-sm opacity-0 shadow-sketch-xs transition-opacity duration-150 group-hover:opacity-100"
            >
              <span>»</span>
              <span>Open sidebar</span>
            </span>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between px-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="relative flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border bg-primary-soft">
                <span className="absolute inset-1.25 rounded-full border-[1.5px] border-border bg-card" />
              </span>
              <span className="font-hand text-2xl tracking-wide">FinLens</span>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-primary-soft"
              title="Collapse sidebar"
            >
              «
            </button>
          </div>
        )}

        {/* Main nav */}
        <nav className="space-y-1">
          {mainNav.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              label={item.name}
              icon={item.icon}
              collapsed={collapsed}
              badge={item.badgeKey === 'uncategorized' ? uncategorizedTotal : undefined}
            />
          ))}
        </nav>

        {/* Admin section */}
        {!collapsed ? (
          <div className="mt-4 px-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Admin
          </div>
        ) : (
          <div className="mx-2 my-3 border-t-[1.3px] border-dashed border-muted-foreground" />
        )}
        <nav className="mt-1 space-y-1">
          {adminNav.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              label={item.name}
              icon={item.icon}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User profile */}
        <div
          ref={profileMenuRef}
          className="relative mt-4 border-t-[1.3px] border-dashed border-muted-foreground pt-3"
        >
          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg border-[1.3px] px-1.5 py-1 text-left transition-colors',
              profileMenuOpen
                ? 'border-border bg-primary-soft shadow-sketch-xs'
                : 'border-transparent hover:bg-card',
              collapsed && 'justify-center px-0'
            )}
          >
            <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border-[1.3px] border-border bg-primary-soft font-hand text-base">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1" style={{ lineHeight: 1.1 }}>
                <div className="truncate font-hand text-base">{user?.name ?? 'Account'}</div>
                <div className="text-[11px] text-muted-foreground">Account ▾</div>
              </div>
            )}
          </button>
          {profileMenuOpen && (
            <div
              role="menu"
              className={cn(
                'absolute z-20 min-w-40 rounded-sketch-sm border-[1.3px] border-border bg-card p-1.5 shadow-sketch-sm',
                collapsed ? 'bottom-0 left-full ml-2' : 'bottom-full left-0 right-0 mb-1.5'
              )}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileMenuOpen(false);
                  void logout();
                }}
                className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[13px] hover:bg-muted"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b-[1.3px] border-dashed border-muted-foreground bg-muted px-5 py-3">
          <h1 className="font-hand text-2xl">{pageTitle}</h1>
          {location.pathname === '/' && (
            <div className="flex items-center gap-3">
              <div ref={pickerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border-[1.3px] border-dashed border-muted-foreground bg-transparent px-2.5 py-0.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-haspopup="listbox"
                  aria-expanded={pickerOpen}
                >
                  {formatMonthLabel(selectedMonth)} ▾
                </button>
                {pickerOpen && (
                  <div
                    role="listbox"
                    className="absolute right-0 top-full z-20 mt-1.5 min-w-50 rounded-sketch-sm border-[1.3px] border-border bg-card p-1.5 shadow-sketch-sm"
                  >
                    {availableMonths.length === 0 ? (
                      <div className="px-2.5 py-1.5 text-[13px] text-muted-foreground">No months yet</div>
                    ) : (
                      availableMonths.map((m) => {
                        const isSelected = m === selectedMonth;
                        const isCurrent = m === getCurrentMonth();
                        return (
                          <button
                            key={m}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => onPickMonth(m)}
                            className={cn(
                              'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px]',
                              isSelected
                                ? 'bg-primary-soft font-bold text-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            <span>{formatMonthLabel(m)}</span>
                            {isCurrent && (
                              <span className="ml-3 text-[11px] text-muted-foreground">current</span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>
        <main
          className={cn(
            'flex-1 overflow-auto',
            location.pathname === '/categorize' ? '' : 'p-5'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
