import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      variant = "primary", 
      size = "md", 
      children, 
      fullWidth = false,
      className = "", 
      disabled = false,
      ...props 
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm cursor-pointer";
    
    const variantStyles = {
      primary: "bg-teal-600/70 hover:bg-teal-600/80 text-white shadow-md hover:shadow-teal-950/30 dark:hover:shadow-teal-400/30 focus:ring-white border border-teal-700",
      secondary: "dark:bg-white/10 bg-blue-950/10 text-white border dark:border-white/30 border-blue-950/30 dark:hover:bg-white/20 hover:bg-blue-950/20 dark:hover:border-white/50 hover:border-bulue-950/50 shadow-md hover:shadow-lg dark:focus:ring-white/50 focus:ring-blue-950/50",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
