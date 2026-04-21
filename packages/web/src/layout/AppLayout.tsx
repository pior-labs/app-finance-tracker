import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/upload', label: 'Upload' }
] as const;

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#f2f6fa_0%,#ffffff_45%,#e9f0f5_100%)] text-slate-800 md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200/80 bg-white/85 px-5 py-6 backdrop-blur md:border-b-0 md:border-r md:px-6 md:py-8">
        <h1 className="mb-5 text-2xl font-semibold tracking-wide text-slate-900">FinLens</h1>
        <nav className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-2" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive
                  ? 'rounded-xl bg-sky-100 px-3 py-2 text-center text-sm font-semibold text-sky-950 md:text-left'
                  : 'rounded-xl px-3 py-2 text-center text-sm text-slate-700 transition hover:bg-slate-100 md:text-left'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="grid grid-rows-[auto_1fr]">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/70 px-4 py-4 md:px-8">
          <div>
            <p className="text-base font-bold text-slate-900">Household Workspace</p>
            <p className="mt-1 text-sm text-slate-600">Signed in as {user?.name ?? 'Unknown'}</p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
