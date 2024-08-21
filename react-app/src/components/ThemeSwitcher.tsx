import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'normal' ? 'dark' : 'normal');
    };

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={toggleTheme}
                className="relative flex items-center justify-between w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer transition duration-300 outline-none ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-700 focus:ring-4"
                aria-label="Toggle theme"
            >
                <div
                    className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                        theme === 'normal' ? 'translate-x-1' : 'translate-x-7'
                    }`}
                />
                <FaSun className="text-yellow-500 w-5 h-5 ml-1" />
                <FaMoon className="text-blue-900 w-5 h-5 mr-1" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {theme === 'normal' ? 'Dark Mode' : 'Light Mode' }
            </span>
        </div>
    );
};

export default ThemeSwitcher;