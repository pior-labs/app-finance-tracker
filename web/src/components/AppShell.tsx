import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  DASHBOARD_THEMES,
  useDashboardTheme,
  type DashboardTheme,
} from '@/hooks/useDashboardTheme';
import { cn } from '@/lib/utils';
import { GLASS_THEME, type BentoTheme } from '@/pages/designs/DashboardTwo';
import { SWISS_THEME } from '@/pages/designs/DashboardThree';
import { BLOOM_THEME } from '@/pages/designs/DashboardFour';

const BENTO_THEMES: Record<Exclude<DashboardTheme, 'warm-sketch'>, BentoTheme> = {
  bloom: BLOOM_THEME,
  glass: GLASS_THEME,
  swiss: SWISS_THEME,
};

function extractBorderColor(border: string, fallback: string): string {
  const trimmed = border.trim();
  if (trimmed === 'none' || trimmed === '0') return fallback;
  const match = trimmed.match(/(?:\d+(?:\.\d+)?px\s+)?(?:solid|dashed|dotted)\s+(.+)$/i);
  return match ? match[1].trim() : fallback;
}

function getThemeVars(theme: DashboardTheme): CSSProperties | undefined {
  if (theme === 'warm-sketch') return undefined;
  const t = BENTO_THEMES[theme];
  const borderColor = extractBorderColor(t.sidebarBorder, t.muted);
  return {
    '--muted': t.sidebarBg,
    '--card': t.cardBg,
    '--primary-soft': t.navActiveBg,
    '--border': borderColor,
    '--border-soft': borderColor,
    '--foreground': t.fg,
    '--muted-foreground': t.muted,
  } as CSSProperties;
}

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

/* ─────────────────────────── Sketch (warm-sketch) ─────────────────────────── */

function SketchNavItem({ to, label, icon, collapsed, badge }: NavItemProps) {
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

/* ─────────────────────────────── Bento NavItem ─────────────────────────────── */

interface BentoNavItemProps extends NavItemProps {
  t: BentoTheme;
}

function BentoNavItem({ t, to, label, icon, collapsed, badge }: BentoNavItemProps) {
  return (
    <NavLink to={to} end={to === '/'} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <div
          style={{
            padding: collapsed ? '10px 0' : '10px 12px',
            borderRadius: Math.max(8, t.radius / 1.5),
            background: isActive ? t.navActiveBg : 'transparent',
            color: isActive ? t.navActiveFg : t.navFg,
            fontWeight: isActive ? 600 : 500,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            transition: 'background .15s',
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: isActive ? t.navActiveIconBg : t.navIconBg,
              color: isActive ? t.navActiveIconFg : t.navIconFg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
          {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
          {!collapsed && badge != null && badge > 0 ? (
            <span
              style={{
                background: t.badgeBg,
                color: t.badgeFg,
                padding: '1px 9px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {badge}
            </span>
          ) : null}
        </div>
      )}
    </NavLink>
  );
}

/* ─────────────────────────────── AppShell ─────────────────────────────── */

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useDashboardTheme();
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

  const isBento = theme !== 'warm-sketch';
  const bentoTheme = isBento ? BENTO_THEMES[theme] : null;

  /* ───────────────────────────── Bento render ───────────────────────────── */
  if (bentoTheme) {
    const t = bentoTheme;
    const itemRadius = Math.max(8, t.radius / 1.5);
    const showMonthPicker = location.pathname === '/';

    return (
      <div
        className="flex min-h-screen"
        style={{
          background: t.appBg,
          color: t.fg,
          fontFamily: t.font,
          ...getThemeVars(theme),
        }}
      >
        {t.fontImport && <link rel="stylesheet" href={t.fontImport} />}

        {/* SIDEBAR */}
        <aside
          style={{
            width: collapsed ? 68 : 240,
            padding: '20px 16px',
            background: t.sidebarBg,
            borderRight: t.sidebarBorder,
            backdropFilter: theme === 'glass' ? 'blur(20px) saturate(140%)' : undefined,
            WebkitBackdropFilter: theme === 'glass' ? 'blur(20px) saturate(140%)' : undefined,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            position: 'sticky',
            top: 0,
            height: '100vh',
            alignSelf: 'flex-start',
            transition: 'width .18s ease',
            boxSizing: 'border-box',
            color: t.fg,
          }}
        >
          {/* Logo + collapse toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '4px 0 16px' : '4px 8px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                color: 'inherit',
              }}
              aria-label="FinLens"
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: t.logoBg,
                  color: t.logoFg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                F
              </span>
              {!collapsed && (
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-.3px',
                    fontFamily: t.displayFont ?? t.font,
                  }}
                >
                  FinLens
                </span>
              )}
            </Link>
            {!collapsed && (
              <>
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  title="Collapse sidebar"
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: t.muted,
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 4,
                  }}
                >
                  «
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Open sidebar"
              style={{
                background: 'transparent',
                border: 0,
                color: t.muted,
                cursor: 'pointer',
                fontSize: 14,
                padding: 4,
                marginBottom: 6,
              }}
            >
              »
            </button>
          )}

          {/* Main nav */}
          {mainNav.map((item) => (
            <BentoNavItem
              key={item.path}
              t={t}
              to={item.path}
              label={item.name}
              icon={item.icon}
              collapsed={collapsed}
              badge={item.badgeKey === 'uncategorized' ? uncategorizedTotal : undefined}
            />
          ))}

          {/* Admin section */}
          {!collapsed ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.2,
                color: t.muted,
                padding: '14px 12px 6px',
                textTransform: 'uppercase',
              }}
            >
              Admin
            </div>
          ) : (
            <div
              aria-hidden="true"
              style={{
                margin: '10px 8px',
                borderTop: `1px solid ${extractBorderColor(t.sidebarBorder, t.muted)}`,
                opacity: 0.4,
              }}
            />
          )}
          {adminNav.map((item) => (
            <BentoNavItem
              key={item.path}
              t={t}
              to={item.path}
              label={item.name}
              icon={item.icon}
              collapsed={collapsed}
            />
          ))}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Profile */}
          <div
            ref={profileMenuRef}
            style={{
              position: 'relative',
              marginTop: 12,
              paddingTop: collapsed ? 10 : 0,
              borderTop: collapsed
                ? `1px solid ${extractBorderColor(t.sidebarBorder, t.muted)}`
                : 'none',
            }}
          >
            <button
              type="button"
              onClick={() => setProfileMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              style={{
                width: '100%',
                padding: collapsed ? '10px 0' : '10px 12px',
                borderRadius: itemRadius,
                background: profileMenuOpen ? t.navActiveBg : t.profileBg,
                color: profileMenuOpen ? t.navActiveFg : t.fg,
                border: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                justifyContent: collapsed ? 'center' : 'flex-start',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: t.av1,
                  color: t.av1Fg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
              {!collapsed && (
                <div style={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.name ?? 'Account'}
                  </div>
                  <div style={{ fontSize: 11, color: profileMenuOpen ? t.navActiveFg : t.muted, opacity: 0.85 }}>
                    Account ▾
                  </div>
                </div>
              )}
            </button>
            {profileMenuOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  zIndex: 20,
                  minWidth: 200,
                  background: t.cardBg,
                  border: t.cardBorder,
                  borderRadius: itemRadius,
                  boxShadow: t.cardShadow,
                  padding: 6,
                  ...(collapsed
                    ? { bottom: 0, left: '100%', marginLeft: 8 }
                    : { bottom: '100%', left: 0, right: 0, marginBottom: 6 }),
                }}
              >
                {/* Theme picker */}
                <div style={{ padding: '6px 8px 4px' }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 1.2,
                      color: t.muted,
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Theme
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {DASHBOARD_THEMES.map((opt) => {
                      const selected = theme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTheme(opt.id)}
                          title={opt.label}
                          aria-label={`Switch to ${opt.label} theme`}
                          aria-pressed={selected}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            background: opt.swatch,
                            border: selected
                              ? `2px solid ${t.fg}`
                              : `1.5px solid ${extractBorderColor(t.cardBorder, t.muted)}`,
                            opacity: selected ? 1 : 0.55,
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'opacity .15s',
                          }}
                        />
                      );
                    })}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: t.muted,
                      fontFamily: t.displayFont ?? t.font,
                    }}
                  >
                    {DASHBOARD_THEMES.find((d) => d.id === theme)?.label}
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    margin: '6px 4px',
                    borderTop: `1px solid ${extractBorderColor(t.cardBorder, t.muted)}`,
                    opacity: 0.6,
                  }}
                />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    void logout();
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 0,
                    padding: '8px 10px',
                    borderRadius: Math.max(6, itemRadius - 4),
                    fontSize: 13,
                    textAlign: 'left',
                    color: t.fg,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN COLUMN */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          {/* HEADER */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 32px',
              borderBottom: t.headerBorder,
              gap: 16,
              flexWrap: 'wrap',
              background: 'transparent',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '-.4px',
                fontFamily: t.displayFont ?? t.font,
                color: t.fg,
              }}
            >
              {pageTitle}
            </h1>
            {showMonthPicker && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div ref={pickerRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={pickerOpen}
                    style={{
                      background: t.chipBg,
                      color: t.fg,
                      border: t.chipBorder,
                      padding: '8px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {formatMonthLabel(selectedMonth)} ▾
                  </button>
                  {pickerOpen && (
                    <div
                      role="listbox"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: 6,
                        zIndex: 20,
                        minWidth: 220,
                        background: t.cardBg,
                        border: t.cardBorder,
                        borderRadius: itemRadius,
                        boxShadow: t.cardShadow,
                        padding: 6,
                      }}
                    >
                      {availableMonths.length === 0 ? (
                        <div style={{ padding: '8px 10px', fontSize: 13, color: t.muted }}>
                          No months yet
                        </div>
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
                              style={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 10px',
                                borderRadius: Math.max(6, itemRadius - 4),
                                background: isSelected ? t.navActiveBg : 'transparent',
                                color: isSelected ? t.navActiveFg : t.fg,
                                border: 0,
                                fontSize: 13,
                                fontWeight: isSelected ? 600 : 500,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                              }}
                            >
                              <span>{formatMonthLabel(m)}</span>
                              {isCurrent && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: isSelected ? t.navActiveFg : t.muted,
                                    opacity: 0.8,
                                    marginLeft: 12,
                                  }}
                                >
                                  current
                                </span>
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

          {/* MAIN */}
          <main
            style={{
              flex: 1,
              overflow: 'auto',
              padding: location.pathname === '/categorize' ? 0 : '24px 32px',
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  /* ───────────────────────────── Sketch render ───────────────────────────── */
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
            <SketchNavItem
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
            <SketchNavItem
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
          className={cn(
            'relative border-dashed border-muted-foreground',
            collapsed ? 'mt-4 border-t-[1.3px] pt-3' : 'mt-3 pt-0'
          )}
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
                'absolute z-20 min-w-48 rounded-sketch-sm border-[1.3px] border-border bg-card p-1.5 shadow-sketch-sm',
                collapsed ? 'bottom-0 left-full ml-2' : 'bottom-full left-0 right-0 mb-1.5'
              )}
            >
              {/* Theme picker */}
              <div className="px-2 pb-1.5 pt-1">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Theme
                </div>
                <div className="flex items-center gap-1.5">
                  {DASHBOARD_THEMES.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      title={opt.label}
                      aria-label={`Switch to ${opt.label} theme`}
                      aria-pressed={theme === opt.id}
                      className={cn(
                        'h-6 w-6 rounded-full border-[1.5px] transition-all',
                        theme === opt.id
                          ? 'border-foreground shadow-sketch-xs'
                          : 'border-border opacity-50 hover:opacity-100'
                      )}
                      style={{ background: opt.swatch }}
                    />
                  ))}
                </div>
                <div className="mt-1.5 font-hand text-[13px] text-muted-foreground">
                  {DASHBOARD_THEMES.find((d) => d.id === theme)?.label}
                </div>
              </div>
              <div className="my-1 border-t-[1.3px] border-dashed border-muted-foreground" />
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
