import React from "react";
import { getThemeClasses } from "../contexts/ThemeContext";


export const Card = ({ children, className = "", theme, ...props }) => {
  const { cardBg, border } = getThemeClasses(theme);
  return (
    <div 
      {...props}
      className={`${cardBg} ${border} border rounded-2xl transition-colors duration-200 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => (
  <div {...props} className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h2 {...props} className={`text-xl font-bold ${className}`}>
    {children}
  </h2>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div {...props} className={`p-6 ${className}`}>
    {children}
  </div>
);