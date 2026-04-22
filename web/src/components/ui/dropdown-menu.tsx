import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  triggerLabel: string;
  children: React.ReactNode;
}

function DropdownMenu({ triggerLabel, children }: DropdownMenuProps) {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm">
        {triggerLabel}
      </summary>
      <div className="absolute right-0 z-10 mt-2 min-w-40 rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
        {children}
      </div>
    </details>
  );
}

function DropdownMenuItem({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[var(--muted)]', className)}
      type="button"
      {...props}
    />
  );
}

export { DropdownMenu, DropdownMenuItem };
