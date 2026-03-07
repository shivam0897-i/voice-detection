import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 relative overflow-hidden rounded-lg';

const buttonVariants = cva(baseStyles, {
  variants: {
    variant: {
      default: 'font-semibold shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
      primary: 'font-semibold shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
      secondary: 'border hover:bg-[var(--color-accent-subtle)] active:bg-[var(--color-accent-subtle)]',
      outline: 'border hover:bg-[var(--color-accent-subtle)] active:bg-[var(--color-accent-subtle)]',
      ghost: 'hover:bg-[var(--color-accent-subtle)] active:bg-[var(--color-accent-subtle)]',
      danger: 'border-2 hover:bg-[var(--color-danger-bg)] active:bg-[var(--color-danger-bg)] active:scale-[0.98]',
      recording: 'font-semibold animate-pulse shadow-lg ring-4',
      loading: 'font-semibold cursor-wait opacity-60',
      link: 'underline-offset-4 hover:underline p-0 h-auto',
    },
    size: {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-7 text-base',
      xl: 'h-14 px-9 text-lg',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

const variantStyles = {
  default: {
    background: 'linear-gradient(to bottom, var(--color-accent), var(--color-accent-hover))',
    color: '#030308',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
  },
  primary: {
    background: 'linear-gradient(to bottom, var(--color-accent), var(--color-accent-hover))',
    color: '#030308',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
  },
  danger: {
    background: 'transparent',
    color: 'var(--color-danger)',
    borderColor: 'var(--color-danger)',
  },
  recording: {
    background: 'var(--color-danger)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
    '--tw-ring-color': 'rgba(239, 68, 68, 0.2)',
  },
  loading: {
    background: 'var(--color-accent)',
    color: '#030308',
  },
  link: {
    color: 'var(--color-accent)',
  },
};

const Button = forwardRef(({ className, variant = 'primary', size = 'md', loading, asChild = false, children, style, ...props }, ref) => {
  const variantStyle = variantStyles[variant] || variantStyles.primary;
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant: loading ? 'loading' : variant, size, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      <Slottable>{children}</Slottable>
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
