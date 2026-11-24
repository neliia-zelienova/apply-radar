import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import classNames from "classnames";

/**
 * Text fields: rounded (12px) with a soft neutral fill; on focus a teal border
 * and a soft teal glow. Buttons are pills; fields stay rounded rectangles so a
 * multi-line notes box matches the single-line inputs next to it.
 */
const surface =
  "w-full rounded-xl border bg-black/[0.03] text-inherit transition-[border-color,box-shadow,background-color] duration-150 " +
  "placeholder:text-gray-400 dark:bg-white/[0.05] dark:placeholder:text-white/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

// Class names are written out in full: Tailwind only generates classes it finds as-is.
const BORDER = {
  normal: "border-black/10 hover:border-black/20 dark:border-white/12 dark:hover:border-white/20",
  invalid: "border-red-500/80 dark:border-red-400/80",
};
const FOCUS = {
  normal:
    "focus:outline-none focus:ring-4 focus:border-teal-500 focus:ring-teal-500/15 focus:bg-white dark:focus:border-teal-400 dark:focus:bg-white/[0.07]",
  invalid:
    "focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:bg-white dark:focus:bg-white/[0.07]",
};
const FOCUS_WITHIN = {
  normal:
    "focus-within:ring-4 focus-within:border-teal-500 focus-within:ring-teal-500/15 focus-within:bg-white dark:focus-within:border-teal-400 dark:focus-within:bg-white/[0.07]",
  invalid:
    "focus-within:ring-4 focus-within:ring-red-500/15 focus-within:bg-white dark:focus-within:bg-white/[0.07]",
};

/**
 * Field classes for custom controls (a select trigger, a wrapper around a
 * textarea). `within`: the glow follows focus inside the element.
 */
export const fieldClasses = ({
  invalid = false,
  within = false,
}: { invalid?: boolean; within?: boolean } = {}) => {
  const state = invalid ? "invalid" : "normal";
  return classNames(surface, BORDER[state], (within ? FOCUS_WITHIN : FOCUS)[state]);
};

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

/** Single-line text field, 40px tall (the height of a medium Button). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, className, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={classNames("h-10 px-3.5", fieldClasses({ invalid }), className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid = false, className, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={classNames("min-h-24 resize-none px-3.5 py-2.5", fieldClasses({ invalid }), className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

/** Label above a control, with an optional error (or hint) below it. */
export const Field = ({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) => (
  <label className={classNames("flex w-full flex-col items-start gap-1.5", className)}>
    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
    {children}
    {error ? (
      <span role="alert" className="text-xs text-red-600 dark:text-red-400">
        {error}
      </span>
    ) : (
      hint
    )}
  </label>
);
