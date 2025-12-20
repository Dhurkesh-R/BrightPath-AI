import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getThemeClasses } from "../contexts/ThemeContext";

export const Select = ({ value, onValueChange, children }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative w-full">
            {React.Children.map(children, child =>
                React.cloneElement(child, {
                    open,
                    setOpen,
                    value,
                    onValueChange
                })
            )}
        </div>
    );
};

export const SelectTrigger = ({
    children,
    open,
    setOpen,
    className = "",
    theme
}) => {
    const { inputBg, inputBorder, text } = getThemeClasses(theme);

    return (
        <div
            className={`
                flex items-center justify-between
                w-full p-2 rounded-lg border cursor-pointer
                ${inputBg} ${inputBorder} ${text}
                ${className}
            `}
            onClick={() => setOpen(!open)}
        >
            {children}
            <ChevronDown
                className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
        </div>
    );
};

export const SelectValue = ({ value, placeholder }) => {
    return <span>{value || placeholder}</span>;
};

export const SelectContent = ({
    children,
    open,
    setOpen,
    onValueChange,
    className = "",
    theme
}) => {
    const { cardBg, text, border } = getThemeClasses(theme);

    if (!open) return null;

    return (
        <div
            className={`
                absolute z-50 w-full mt-1 rounded-lg border shadow-lg
                ${cardBg} ${text} ${border} ${className}
            `}
        >
            {React.Children.map(children, child =>
                React.cloneElement(child, {
                    onSelect: (value) => {
                        onValueChange(value);
                        setOpen(false);
                    }
                })
            )}
        </div>
    );
};

export const SelectItem = ({ value, children, onSelect, theme }) => {
    const { hoverBg, text } = getThemeClasses(theme);

    return (
        <div
            className={`p-2 cursor-pointer ${text} ${hoverBg}`}
            onClick={() => onSelect(value)}
        >
            {children}
        </div>
    );
};
