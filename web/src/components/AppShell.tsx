import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const mainNav = [
  { name: 'Dashboard', path: '/', icon: 'D' },
  { name: 'Categorize', path: '/categorize', icon: '★' },
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
          'flex items-center gap-2.5 rounded-[8px] border-[1.3px] px-2.5 py-2 text-sm transition-colors',
          isActive
            ? 'border-[var(--border)] bg-[var(--primary-soft)] shadow-[1px_1.5px_0_0_var(--border)]'
            : 'border-transparent hover:bg-[var(--card)]'
        )
      }
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-[1.3px] border-[var(--border)] bg-[var(--card)] font-hand text-sm">
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 font-bold">{label}</span>
          {badge != null && badge > 0 && (
            <span className="rounded-full border-[1.3px] border-[var(--border)] bg-[var(--warn-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--warn)] shadow-none">
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
          'flex flex-col border-r-[1.5px] border-[var(--border)] bg-[var(--muted)] p-3 transition-all duration-200',
          collapsed ? 'w-[64px]' : 'w-[200px]'
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="mb-4 flex items-center justify-between px-1">
          <Link to="/" className="flex items-center gap-2">
            {/* Sketchy logo glyph */}
            <span className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--border)] bg-[var(--primary-soft)]">
              <span className="absolute inset-[5px] rounded-full border-[1.5px] border-[var(--border)] bg-[var(--card)]" />
            </span>
            {!collapsed && <span className="font-hand text-2xl tracking-wide">FinLens</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-6 w-6 items-center justify-center rounded-[6px] border-[1.3px] border-[var(--border)] bg-[var(--card)] font-hand text-sm hover:bg-[var(--primary-soft)]"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Main nav */}
        <nav className="space-y-1">
          {mainNav.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              label={item.name}
              icon={item.icon}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Admin section */}
        {!collapsed && (
          <div className="mt-4 px-2.5 text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            Admin
          </div>
        )}
        {collapsed && <div className="mt-4" />}
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
        <div className="mt-4 flex items-center gap-2.5 border-t-[1.3px] border-dashed border-[var(--muted-foreground)] pt-3">
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.3px] border-[var(--border)] bg-[var(--primary-soft)] font-hand text-[13px]">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1" style={{ lineHeight: 1.1 }}>
              <div className="font-hand text-base">{user?.name ?? 'Account'}</div>
              <button
                onClick={() => void logout()}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b-[1.3px] border-dashed border-[var(--muted-foreground)] px-5 py-3">
          <h1 className="font-hand text-2xl">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border-[1.3px] border-dashed border-[var(--muted-foreground)] bg-transparent px-2.5 py-0.5 text-[13px] text-[var(--muted-foreground)]">
              {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} ▾
            </span>
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.3px] border-[var(--border)] bg-[var(--primary-soft)] font-hand text-[13px]">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
