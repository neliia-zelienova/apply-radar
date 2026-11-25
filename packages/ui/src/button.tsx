import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

/**
 * primary: the main action. secondary: Cancel / Keep editing (a soft tint).
 * danger: delete / discard. outline: a teal outline, for actions on the page.
 * ghost: text only, for small actions.
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

// Pills: flat fills, a slight press-in, and a soft focus ring (no offset,
// so it looks right on any background).
const baseStyles =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap select-none cursor-pointer " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.97] " +
  "focus:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50";

const variantStyles = {
  primary:
    "bg-teal-600 text-white shadow-sm shadow-teal-950/20 hover:bg-teal-700 focus-visible:ring-teal-500/30 dark:hover:bg-teal-500",
  secondary:
    "bg-black/[0.06] text-gray-900 hover:bg-black/[0.1] focus-visible:ring-black/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/[0.16] dark:focus-visible:ring-white/15",
  danger:
    "bg-red-600 text-white shadow-sm shadow-red-950/20 hover:bg-red-700 focus-visible:ring-red-500/30 dark:hover:bg-red-500",
  outline:
    "border border-teal-600/40 text-teal-700 hover:border-teal-600/70 hover:bg-teal-600/10 focus-visible:ring-teal-500/25 dark:border-teal-400/40 dark:text-teal-300 dark:hover:border-teal-400/70 dark:hover:bg-teal-400/10",
  ghost:
    "text-teal-700 hover:bg-teal-600/10 focus-visible:ring-teal-500/25 dark:text-teal-300 dark:hover:bg-teal-400/10",
};

// md matches the height of an Input (40px).
const sizeStyles = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/** Button classes, for links that should look like a Button. */
export const buttonClasses = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) =>
  `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`;

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
  ) => (
    <button
      ref={ref}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
