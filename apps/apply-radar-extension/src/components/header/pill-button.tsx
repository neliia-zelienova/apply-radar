import { forwardRef, type ButtonHTMLAttributes } from "react";

/**
 * Teal outline pill used for the header actions ("Add application", "From this
 * page"). Darker teal on the light header, bright teal with a glow on the dark one.
 */
export const PillButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={[
        "flex items-center gap-1.5 rounded-full border-[1.5px] px-[18px] py-[9px] font-roboto text-xs font-semibold tracking-[0.02em]",
        "cursor-pointer transition-all duration-200 disabled:cursor-wait disabled:opacity-70",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30",
        "border-teal-600/45 bg-white/60 text-teal-700 hover:border-teal-600/70 hover:bg-teal-600/10",
        "dark:border-teal-500/55 dark:bg-transparent dark:text-teal-300 dark:shadow-[0_0_12px_rgba(20,184,166,0.15)]",
        "dark:hover:border-teal-500/80 dark:hover:bg-teal-500/12 dark:hover:shadow-[0_0_20px_rgba(20,184,166,0.35)]",
        className,
      ].join(" ")}
      {...props}
    />
  ),
);
PillButton.displayName = "PillButton";
