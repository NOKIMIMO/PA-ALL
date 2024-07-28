import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'normal' ? 'dark' : 'normal');
    };

    return (
        <button onClick={toggleTheme} className="btn btn-primary">
            Switch to {theme === 'normal' ? 'Dark' : 'Normal'} Theme
        </button>
    );
};

export default ThemeSwitcher;