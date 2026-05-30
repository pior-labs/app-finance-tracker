import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border-[1.3px] border-border px-2.5 py-0.5 text-xs font-bold shadow-sketch-xs',
  {
    variants: {
      variant: {
        default: 'bg-card',
        success: 'bg-good-soft text-good',
        warning: 'bg-warn-soft text-warn',
        accent: 'bg-primary-soft text-primary',
        ghost: 'border-dashed bg-transparent shadow-none text-muted-foreground',
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
