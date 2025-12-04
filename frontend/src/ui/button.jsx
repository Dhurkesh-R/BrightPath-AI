import { getThemeClasses } from "../contexts/ThemeContext";

/**
 * A reusable button component that automatically applies theme-based styling.
 * It also supports different variants like 'primary', 'secondary', and 'danger'.
 * @param {object} props
 * @param {React.ReactNode} props.children - The content inside the button.
 * @param {string} [props.className=""] - Additional custom Tailwind CSS classes.
 * @param {string} [props.theme] - The current theme identifier (e.g., 'light', 'dark').
 * @param {string} [props.variant="primary"] - The button variant ('primary', 'secondary', 'danger').
 * @param {object} [props.rest] - Any other standard button props (onClick, disabled, etc.).
 */
export const Button = ({ children, className = "", theme, variant = "primary", ...rest }) => {
  const { buttonPrimaryBg, buttonPrimaryHoverBg, buttonSecondaryBg, buttonSecondaryHoverBg, textOnPrimary, textOnSecondary, textDanger, bgDanger, hoverBgDanger } = getThemeClasses(theme);

  let variantClasses = "";
  let textClasses = "";
  
  // Determine classes based on the variant
  switch (variant) {
    case 'secondary':
      variantClasses = `${buttonSecondaryBg} ${buttonSecondaryHoverBg}`;
      textClasses = `${textOnSecondary}`;
      break;
    case 'danger':
      variantClasses = `${bgDanger} ${hoverBgDanger}`;
      textClasses = `${textDanger}`;
      break;
    case 'primary':
    default:
      variantClasses = `${buttonPrimaryBg} ${buttonPrimaryHoverBg}`;
      textClasses = `${textOnPrimary}`;
      break;
  }

  return (
    <button
      className={`
        px-4 py-2 
        rounded-lg 
        font-medium 
        shadow-md 
        transition-all 
        duration-150 
        focus:outline-none focus:ring-4 focus:ring-opacity-50 
        ${variantClasses} 
        ${textClasses} 
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
};