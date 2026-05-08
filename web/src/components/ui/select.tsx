import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  variant?: 'default' | 'dashed';
}

export function Select({ className, options, variant = 'default', ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-[8px] bg-[var(--card)] px-3 text-sm outline-none ring-[var(--primary)] focus:ring-2',
        variant === 'dashed'
          ? 'border-[1.3px] border-dashed border-[var(--muted-foreground)] text-[var(--muted-foreground)] shadow-none'
          : 'border-[1.3px] border-[var(--border)] shadow-[1px_1.5px_0_0_var(--border)]',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
