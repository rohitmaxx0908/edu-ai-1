
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { THEME } from '../theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    toggleTheme: () => void;
    // Helper access to current theme tokens
    t: typeof THEME['light'];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Default to dark mode for a premium feel or check generic preference
    const [theme, setTheme] = useState<ThemeType>('light');

    useEffect(() => {
        // Hydrate from local storage or system preference if desired
        const savedTheme = localStorage.getItem('app-theme') as ThemeType;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('app-theme', newTheme);
            return newTheme;
        });
    };

    const t = THEME[theme];

    // Apply global classes
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Body background transition
        document.body.className = theme === 'dark' ? 'bg-black text-slate-100 transition-colors duration-500' : 'bg-[#f8fafc] text-slate-900 transition-colors duration-500';
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, t }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
