export const Label = ({ children, htmlFor, className = "" }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium mb-1 ${className}`}>
        {children}
    </label>
);