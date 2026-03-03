import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Liquid glass button variants — theme-aware
const liquidbuttonVariants = cva(
    'inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    {
        variants: {
            variant: {
                default: 'bg-transparent hover:scale-105 duration-300 transition text-brand-400',
                destructive: 'bg-red-600 text-white hover:bg-red-600/90',
                outline: 'border border-border bg-transparent hover:bg-accent/50 hover:text-foreground',
                secondary: 'bg-accent/50 text-foreground/80 hover:bg-accent',
                ghost: 'hover:bg-accent/50 hover:text-foreground',
                link: 'text-brand-400 underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 text-xs gap-1.5 px-4',
                lg: 'h-10 rounded-md px-6',
                xl: 'h-12 rounded-md px-8',
                xxl: 'h-14 rounded-md px-10',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'xxl',
        },
    }
);

function GlassFilter() {
    return (
        <svg className="hidden">
            <defs>
                <filter
                    id="container-glass"
                    x="0%"
                    y="0%"
                    width="100%"
                    height="100%"
                    colorInterpolationFilters="sRGB"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05 0.05"
                        numOctaves="1"
                        seed="1"
                        result="turbulence"
                    />
                    <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="blurredNoise"
                        scale="70"
                        xChannelSelector="R"
                        yChannelSelector="B"
                        result="displaced"
                    />
                    <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
                    <feComposite in="finalBlur" in2="finalBlur" operator="over" />
                </filter>
            </defs>
        </svg>
    );
}

export function LiquidButton({
    className,
    variant,
    size,
    asChild = false,
    children,
    ...props
}) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(
                'relative',
                liquidbuttonVariants({ variant, size, className })
            )}
            {...props}
        >
            <div className="absolute top-0 left-0 z-0 h-full w-full rounded-full shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)] transition-all" />
            <div
                className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md"
                style={{ backdropFilter: 'url("#container-glass")' }}
            />
            <div className="pointer-events-none z-10">
                {children}
            </div>
            <GlassFilter />
        </Comp>
    );
}

// Metal button color variants — theme-aware
// Primary uses brand emerald, default adapts to light/dark
const colorVariants = {
    default: {
        // Light: silver metallic | Dark: dark steel metallic
        outer: 'bg-gradient-to-b from-[#6b7280] to-[#d1d5db] dark:from-[#000] dark:to-[#A0A0A0]',
        inner: 'bg-gradient-to-b from-[#f3f4f6] via-[#9ca3af] to-[#e5e7eb] dark:from-[#FAFAFA] dark:via-[#3E3E3E] dark:to-[#E5E5E5]',
        button: 'bg-gradient-to-b from-[#d1d5db] to-[#9ca3af] dark:from-[#B9B9B9] dark:to-[#969696]',
        textColor: 'text-gray-800 dark:text-white',
        textShadow: '[text-shadow:_0_1px_0_rgb(255_255_255_/_30%)] dark:[text-shadow:_0_-1px_0_rgb(80_80_80_/_100%)]',
    },
    primary: {
        outer: 'bg-gradient-to-b from-[#064E3B] to-[#6EE7B7]',
        inner: 'bg-gradient-to-b from-[#D1FAE5] via-[#065F46] to-[#A7F3D0]',
        button: 'bg-gradient-to-b from-[#34D399] to-[#059669]',
        textColor: 'text-white',
        textShadow: '[text-shadow:_0_-1px_0_rgb(6_78_59_/_100%)]',
    },
    success: {
        outer: 'bg-gradient-to-b from-[#005A43] to-[#7CCB9B]',
        inner: 'bg-gradient-to-b from-[#E5F8F0] via-[#00352F] to-[#D1F0E6]',
        button: 'bg-gradient-to-b from-[#9ADBC8] to-[#3E8F7C]',
        textColor: 'text-[#FFF7F0]',
        textShadow: '[text-shadow:_0_-1px_0_rgb(6_78_59_/_100%)]',
    },
    error: {
        outer: 'bg-gradient-to-b from-[#5A0000] to-[#FFAEB0]',
        inner: 'bg-gradient-to-b from-[#FFDEDE] via-[#680002] to-[#FFE9E9]',
        button: 'bg-gradient-to-b from-[#F08D8F] to-[#A45253]',
        textColor: 'text-[#FFF7F0]',
        textShadow: '[text-shadow:_0_-1px_0_rgb(146_64_14_/_100%)]',
    },
};

function metalButtonVariants(variant = 'default', isPressed, isHovered, isTouchDevice) {
    const colors = colorVariants[variant];
    const transitionStyle = 'all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)';

    return {
        wrapper: cn(
            'relative inline-flex transform-gpu rounded-md p-[1.25px] will-change-transform',
            colors.outer,
        ),
        wrapperStyle: {
            transform: isPressed
                ? 'translateY(2.5px) scale(0.99)'
                : 'translateY(0) scale(1)',
            boxShadow: isPressed
                ? '0 1px 2px rgba(0, 0, 0, 0.15)'
                : isHovered && !isTouchDevice
                    ? '0 4px 12px rgba(0, 0, 0, 0.12)'
                    : '0 3px 8px rgba(0, 0, 0, 0.08)',
            transition: transitionStyle,
            transformOrigin: 'center center',
        },
        inner: cn(
            'absolute inset-[1px] transform-gpu rounded-lg will-change-transform',
            colors.inner,
        ),
        innerStyle: {
            transition: transitionStyle,
            transformOrigin: 'center center',
            filter: isHovered && !isPressed && !isTouchDevice ? 'brightness(1.05)' : 'none',
        },
        button: cn(
            'relative z-10 m-[1px] rounded-md inline-flex h-11 transform-gpu cursor-pointer items-center justify-center overflow-hidden rounded-md px-6 py-2 text-sm leading-none font-semibold will-change-transform outline-none',
            colors.button,
            colors.textColor,
            colors.textShadow,
        ),
        buttonStyle: {
            transform: isPressed ? 'scale(0.97)' : 'scale(1)',
            transition: transitionStyle,
            transformOrigin: 'center center',
            filter: isHovered && !isPressed && !isTouchDevice ? 'brightness(1.02)' : 'none',
        },
    };
}

function ShineEffect({ isPressed }) {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300',
                isPressed ? 'opacity-20' : 'opacity-0',
            )}
        >
            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
        </div>
    );
}

export const MetalButton = React.forwardRef(
    ({ children, className, variant = 'default', ...props }, ref) => {
        const [isPressed, setIsPressed] = React.useState(false);
        const [isHovered, setIsHovered] = React.useState(false);
        const [isTouchDevice, setIsTouchDevice] = React.useState(false);

        React.useEffect(() => {
            setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
        }, []);

        const buttonText = children || 'Button';
        const variants = metalButtonVariants(variant, isPressed, isHovered, isTouchDevice);

        return (
            <div className={variants.wrapper} style={variants.wrapperStyle}>
                <div className={variants.inner} style={variants.innerStyle} />
                <button
                    ref={ref}
                    className={cn(variants.button, className)}
                    style={variants.buttonStyle}
                    {...props}
                    onMouseDown={() => setIsPressed(true)}
                    onMouseUp={() => setIsPressed(false)}
                    onMouseLeave={() => { setIsPressed(false); setIsHovered(false); }}
                    onMouseEnter={() => { if (!isTouchDevice) setIsHovered(true); }}
                    onTouchStart={() => setIsPressed(true)}
                    onTouchEnd={() => setIsPressed(false)}
                    onTouchCancel={() => setIsPressed(false)}
                >
                    <ShineEffect isPressed={isPressed} />
                    {buttonText}
                    {isHovered && !isPressed && !isTouchDevice && (
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t rounded-lg from-transparent to-white/5" />
                    )}
                </button>
            </div>
        );
    }
);

MetalButton.displayName = 'MetalButton';

export { liquidbuttonVariants };
