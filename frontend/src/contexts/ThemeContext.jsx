import React, { useState, useEffect, createContext, useContext, useMemo } from "react";

// --- THEME CONTEXT DEFINITION ---
const ThemeContext = createContext();

// Utility function to get dynamic Tailwind classes based on the current theme
export const getThemeClasses = (theme) => ({
    // General styles
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    primary: 'blue',
    
    // Component specific styles (Card, Input)
    cardBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    inputBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100',
    inputText: theme === 'dark' ? 'text-gray-100' : 'text-gray-800',
    // States
    inputBorder: theme === 'dark' ? 'border-transparent' : 'border-gray-200',
    inputFocus: theme === 'dark' 
      ? 'focus:border-blue-500 focus:bg-gray-700/80' 
      : 'focus:border-blue-600 focus:bg-white',
    
    // Disabled states
    disabledText: theme === 'dark' ? 'disabled:text-gray-500' : 'disabled:text-gray-300',
    disabledBg: 'disabled:bg-transparent',
    barBg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100',
    
    // --- Button Specific Styles (New Additions) ---
    // Primary Button
    buttonPrimaryBg: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600',
    buttonPrimaryHoverBg: theme === 'dark' ? 'hover:bg-blue-700' : 'hover:bg-blue-700',
    textOnPrimary: 'text-white', // Used as textClasses for primary

    // Secondary Button
    buttonSecondaryBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100',
    buttonSecondaryHoverBg: theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200',
    textOnSecondary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900', // Used as textClasses for secondary
    
    // Danger Button
    bgDanger: 'bg-red-600',
    hoverBgDanger: 'hover:bg-red-700',
    textDanger: 'text-white', // Used as textClasses for danger

    // Add more specific classes as needed (e.g., hover states, shadows, etc.)
    hoverBg: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
});


// Custom hook to use theme (This is what Dashboard.jsx will import)
export const useTheme = () => useContext(ThemeContext);


// Theme Provider Component
export const ThemeProviderWrapper = ({ children }) => {
    // 1. State for theme management
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    // 2. Effect to apply global theme classes and persist theme preference
    useEffect(() => {
        const classes = getThemeClasses(theme);
        // Apply global background and text colors to the body
        document.body.className = `${classes.bg} ${classes.text}`;
        localStorage.setItem("theme", theme);
    }, [theme]);

    // 3. Memoized value for the context provider
    const value = useMemo(() => ({ 
        theme, 
        setTheme, 
        getThemeClasses // Expose the utility function
    }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};