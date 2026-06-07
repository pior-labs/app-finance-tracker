import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border-[1.3px] border-dashed border-muted-foreground bg-transparent px-3 py-2 text-sm text-muted-foreground outline-none ring-primary placeholder:text-muted-foreground focus:border-solid focus:border-border focus:ring-2',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export { Input };
