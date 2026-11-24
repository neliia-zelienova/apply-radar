import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";
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
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm cursor-pointer";

    const variantStyles = {
      primary:
        "bg-teal-600 text-white shadow-md hover:shadow-teal-950/30 dark:hover:shadow-teal-400/30 focus-visible:ring-white/70 border hover:border-white/30 dark:border-teal-700",
      secondary:
        "bg-blue-950 dark:bg-white/10 text-white border dark:border-white/30 border-blue-950/30 dark:hover:bg-white/20 hover:border-white/30 dark:hover:border-white/40 hover:shadow-blue-950/50 dark:hover:shadow-white shadow-md dark:focus-visible:ring-white/50 focus-visible:ring-blue-950/50",
      danger:
        "bg-red-600 text-white border border-red-700 shadow-md hover:bg-red-500 hover:shadow-red-950/40 focus-visible:ring-red-300/70",
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
