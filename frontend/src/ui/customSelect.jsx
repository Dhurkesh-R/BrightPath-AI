import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

export const CustomSelect = ({ onValueChange, defaultValue, options, placeholder, className = "w-[150px]" }) => {
    const { theme, getThemeClasses } = useTheme();
    const [localValue, setLocalValue] = useState(defaultValue);
    const {cardBg, border, text } = getThemeClasses(theme);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <div className="relative">
            <select
                onChange={handleChange}
                value={localValue}
                className={`appearance-none block h-10 px-4 py-2 border ${border} rounded-lg text-sm 
                            ${cardBg} ${text} cursor-pointer 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`}
            >
                {placeholder && (
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <svg className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </div>
    );
};