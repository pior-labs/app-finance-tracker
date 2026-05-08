import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border-[1.3px] border-[var(--border)] px-2.5 py-0.5 text-xs font-bold shadow-[1px_1.5px_0_0_var(--border)]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--card)]',
        success: 'bg-[var(--good-soft)] text-[var(--good)]',
        warning: 'bg-[var(--warn-soft)] text-[var(--warn)]',
        accent: 'bg-[var(--primary-soft)] text-[var(--primary)]',
        ghost: 'border-dashed bg-transparent shadow-none text-[var(--muted-foreground)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
