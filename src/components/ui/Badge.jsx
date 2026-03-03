import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border border-primary/15',
        success: 'bg-success-500/10 text-success-400 border border-success-500/15',
        danger: 'bg-danger-500/10 text-danger-400 border border-danger-500/15',
        warning: 'bg-warning-500/10 text-warning-400 border border-warning-500/15',
        info: 'bg-info-500/10 text-info-400 border border-info-500/15',
        outline: 'border border-border text-muted-foreground',
        ghost: 'text-muted-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] rounded-md',
        md: 'px-2.5 py-1 text-[11px] rounded-lg',
        lg: 'px-3 py-1.5 text-[12px] rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const Badge = forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
