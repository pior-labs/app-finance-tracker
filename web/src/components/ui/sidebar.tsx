import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        'w-64 border-r border-[var(--border)] bg-[var(--card)] p-4 md:block',
        className
      )}
      {...props}
    />
  );
}

interface SidebarNavItemProps {
  to: string;
  label: string;
}

function SidebarNavItem({ to, label }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'block rounded-md px-3 py-2 text-sm transition-colors',
          isActive ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'hover:bg-[var(--muted)]'
        )
      }
    >
      {label}
    </NavLink>
  );
}

export { Sidebar, SidebarNavItem };
