import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  variant?: 'default' | 'good';
}

function Progress({ className, value = 0, variant = 'default', ...props }: ProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        'relative h-2.5 w-full overflow-hidden rounded-md border-[1.3px] border-border bg-muted',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all',
          variant === 'good' ? 'bar-fill-good' : 'bar-fill'
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export { Progress };
