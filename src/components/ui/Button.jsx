import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        /* shadcn-standard variants (used by Dialog, etc.) */
        default:
          'bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30',
        outline:
          'border border-border bg-background hover:bg-accent hover:text-foreground',
        /* project custom variants */
        primary:
          'bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30',
        secondary:
          'bg-accent/50 text-foreground/80 hover:bg-accent border border-border hover:border-border',
        ghost:
          'text-muted-foreground hover:text-foreground/90 hover:bg-accent/50 border border-border hover:border-border',
        danger:
          'bg-danger-500 text-white hover:bg-danger-400 shadow-lg shadow-danger-500/20',
        link:
          'text-brand-400 hover:text-brand-300 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm rounded-md',
        sm: 'h-8 px-3 text-[12px] rounded',
        md: 'h-10 px-5 text-[13px] rounded-lg',
        lg: 'h-12 px-7 text-[14px] rounded-lg',
        xl: 'h-14 px-9 text-[15px] rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
