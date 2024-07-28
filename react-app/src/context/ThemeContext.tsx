import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = {
    theme: 'normal' | 'dark';
};

type ThemeContextType = {
    setTheme: (theme: 'normal' | 'dark') => void;
} & Theme;

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    setTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'normal' | 'dark'>('dark');

    useEffect(() => {
        const localTheme = localStorage.getItem('theme') as 'normal' | 'dark';
        if (localTheme) {
            setTheme(localTheme);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
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