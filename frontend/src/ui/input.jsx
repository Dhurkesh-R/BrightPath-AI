import { getThemeClasses } from "../contexts/ThemeContext";

export const Input = ({ className = "", type = "text", theme, ...rest }) => {
    const { inputBg, inputBorder, text } = getThemeClasses(theme);
    return (
        <input
            type={type}
            className={`
                w-full p-2 mt-1 
                rounded-lg border 
                ${inputBg} 
                ${inputBorder} 
                ${text} 
                focus:ring-2 
                transition-colors 
                duration-150 
                placeholder-gray-500
                ${className}
            `}
            {...rest}
        />
    );
};