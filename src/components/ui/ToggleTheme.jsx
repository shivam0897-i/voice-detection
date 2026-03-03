import React from 'react';
import { MonitorCogIcon, MoonStarIcon, SunIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ui/ThemeProvider';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
    {
        icon: MonitorCogIcon,
        value: 'system',
    },
    {
        icon: SunIcon,
        value: 'light',
    },
    {
        icon: MoonStarIcon,
        value: 'dark',
    },
];

export function ToggleTheme() {
    const { theme, setTheme } = useTheme();

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div
            className={cn(
                'flex items-center rounded-full border p-1 gap-0.5',
                'bg-muted/80 border-border'
            )}
        >
            {THEME_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    className={cn(
                        'relative flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-200',
                        theme === option.value
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground/70'
                    )}
                    onClick={() => setTheme(option.value)}
                    aria-label={`Switch to ${option.value} theme`}
                >
                    {theme === option.value && (
                        <motion.div
                            layoutId="theme-option"
                            className="absolute inset-0 rounded-full border border-primary/50 bg-primary/10"
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                            }}
                        />
                    )}
                    <option.icon className="relative h-3.5 w-3.5" />
                </button>
            ))}
        </div>
    );
}
