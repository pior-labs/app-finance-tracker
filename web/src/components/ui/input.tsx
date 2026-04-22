import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--primary)] placeholder:text-[var(--muted-foreground)] focus:ring-2',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export { Input };
