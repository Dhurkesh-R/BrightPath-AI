import React, { useState, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";
import { getThemeClasses } from "../contexts/ThemeContext";

// 1. Create the Context
const SelectContext = createContext(null);

export const Select = ({ value, onValueChange, children }) => {
    const [open, setOpen] = useState(false);

    return (
        // 2. Provide the state to all descendants
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative w-full">{children}</div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = ({ children, className = "", theme }) => {
    const { open, setOpen } = useContext(SelectContext);
    const { inputBg, inputBorder, text } = getThemeClasses(theme);

    return (
        <div
            className={`flex items-center justify-between w-full p-2 rounded-lg border cursor-pointer ${inputBg} ${inputBorder} ${text} ${className}`}
            onClick={() => setOpen(!open)}
        >
            {children}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
    );
};

export const SelectValue = ({ placeholder }) => {
    // 3. Now SelectValue can actually see the value!
    const { value } = useContext(SelectContext);
    return <span>{value || placeholder}</span>;
};

export const SelectContent = ({ children, className = "", theme }) => {
    const { open } = useContext(SelectContext);
    const { cardBg, text, border } = getThemeClasses(theme);

    if (!open) return null;

    return (
        <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg ${cardBg} ${text} ${border} ${className}`}>
            {children}
        </div>
    );
};

export const SelectItem = ({ value: itemValue, children, theme }) => {
    const { onValueChange, setOpen } = useContext(SelectContext);
    const { hoverBg, text } = getThemeClasses(theme);

    return (
        <div
            className={`p-2 cursor-pointer ${text} ${hoverBg}`}
            onClick={() => {
                onValueChange(itemValue);
                setOpen(false);
            }}
        >
            {children}
        </div>
    );
};