import { getThemeClasses } from "../contexts/ThemeContext";

export const Select = ({ value, onValueChange, children, ...rest }) => {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="hidden" // Hide native select
            {...rest}
        >
            {children}
        </select>
    );
};

export const SelectTrigger = ({ children, className = "", theme, ...rest }) => {
    const { inputBg, inputBorder, text } = getThemeClasses(theme);
    // Mimic SelectTrigger using a styled div with current value visible
    const displayValue = children.find(c => c.type === SelectValue)?.props.placeholder || 'Select value';

    return (
        <div 
            className={`
                flex items-center justify-between 
                w-full p-2 mt-1 
                rounded-lg border 
                cursor-pointer 
                ${inputBg} ${inputBorder} ${text} 
                focus:ring-2 
                transition-colors
                ${className}
            `}
            onClick={() => document.querySelector('.native-select-mock').focus()} // Focus the hidden select
            {...rest}
        >
            {displayValue}
            <ChevronDown className="w-4 h-4 opacity-50" />
        </div>
    );
};

export const SelectValue = ({ placeholder }) => <div className="select-value-placeholder">{placeholder}</div>;

export const SelectContent = ({ children, className = "", theme }) => {
    const { cardBg, text, border } = getThemeClasses(theme);
    // In a real app, this would be a floating menu. Here, we just return the items.
    return (
        <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg ${cardBg} ${text} ${border} ${className}`}>
            {children}
        </div>
    );
};

export const SelectItem = ({ value, children, theme, ...rest }) => {
    const { text, hoverBg } = getThemeClasses(theme);
    return (
        <div 
            value={value}
            className={`p-2 cursor-pointer ${text} ${hoverBg}`}
            {...rest}
        >
            {children}
        </div>
    );
};
