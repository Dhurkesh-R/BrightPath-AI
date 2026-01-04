import React from "react";
import { motion } from "framer-motion";
import { getThemeClasses } from "../contexts/ThemeContext";

export const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null;
    
    // Modal background overlay
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-300"
            onClick={() => onOpenChange(false)} // Close when clicking outside
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                className="w-full max-w-lg mx-4"
            >
                {children}
            </motion.div>
        </div>
    );
};


export const DialogTrigger = ({ children, onClick }) => {
    return React.cloneElement(children, {
        onClick: (e) => {
            if (children.props.onClick) children.props.onClick(e);
            if (onClick) onClick(e);
        }
    });
};


export const DialogContent = ({ children, className = "", theme }) => {
    const { cardBg, text, border } = getThemeClasses(theme);
    return (
        <div className={`p-6 rounded-xl border ${cardBg} ${text} ${border} shadow-2xl ${className}`}>
            {children}
        </div>
    );
};

export const DialogHeader = ({ children, className }) => <div className={`mb-4 ${className}`}>{children}</div>;
export const DialogTitle = ({ children }) => <h3 className="text-2xl font-bold">{children}</h3>;

