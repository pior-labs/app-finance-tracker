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
        'h-10 w-full rounded-lg bg-card px-3 text-sm outline-none ring-primary focus:ring-2',
        variant === 'dashed'
          ? 'border-[1.3px] border-dashed border-muted-foreground text-muted-foreground shadow-none'
          : 'border-[1.3px] border-border shadow-sketch-xs',
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
