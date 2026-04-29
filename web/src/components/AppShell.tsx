import { Link, Outlet } from 'react-router-dom';
import { Sidebar, SidebarNavItem } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <div className="mb-6 px-3">
          <Link to="/" className="text-lg font-semibold">
            FinLens
          </Link>
        </div>
        <nav className="space-y-2">
          <SidebarNavItem to="/" label="Dashboard" />
          <SidebarNavItem to="/transactions" label="Transactions" />
          <SidebarNavItem to="/categories" label="Categories" />
          <SidebarNavItem to="/upload" label="Upload" />
        </nav>
      </Sidebar>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <p className="text-sm text-[var(--muted-foreground)]">Shared household finance tracker</p>
          <DropdownMenu triggerLabel={user?.name ?? 'Account'}>
            <DropdownMenuItem onClick={() => void logout()}>Logout</DropdownMenuItem>
          </DropdownMenu>
        </header>
        <Separator />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
