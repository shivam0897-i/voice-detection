import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', setTheme: () => { } });

export function useTheme() {
    return useContext(ThemeContext);
}

const STORAGE_KEY = 'voiceguard-theme';

function getSystemTheme() {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ defaultTheme = 'dark', children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window === 'undefined') return defaultTheme;
        try {
            return localStorage.getItem(STORAGE_KEY) || defaultTheme;
        } catch {
            return defaultTheme;
        }
    });

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
        } catch {
            // localStorage not available
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        const resolved = theme === 'system' ? getSystemTheme() : theme;

        root.classList.remove('light', 'dark');
        root.classList.add(resolved);

        // Listen for system theme changes when in "system" mode
        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const onChange = () => {
                root.classList.remove('light', 'dark');
                root.classList.add(mq.matches ? 'dark' : 'light');
            };
            mq.addEventListener('change', onChange);
            return () => mq.removeEventListener('change', onChange);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
