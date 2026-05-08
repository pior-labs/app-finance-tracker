import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border)] text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-sketch-sm)] hover:opacity-90',
        outline:
          'bg-[var(--card)] shadow-[var(--shadow-sketch-sm)] hover:bg-[var(--muted)]',
        ghost:
          'border-transparent bg-transparent shadow-none hover:bg-[var(--muted)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-[8px] px-3',
        lg: 'h-11 rounded-[var(--radius-sm)] px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
