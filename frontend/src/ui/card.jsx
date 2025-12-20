import { getThemeClasses } from "../contexts/ThemeContext";

export const Card = ({ children, className = "", theme }) => {
  const { cardBg, border } = getThemeClasses(theme);
  return (
      <div className={`${cardBg} ${border} border rounded-2xl transition-colors duration-200 shadow-lg ${className}`}>
          {children}
      </div>
  );
};

export const CardHeader = ({ children, className = "" }) => <div className={`p-6 pb-4 ${className}`}>{children}</div>;
export const CardTitle = ({ children, className = "" }) => <h2 className={`text-xl font-bold ${className}`}>{children}</h2>;
export const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;
