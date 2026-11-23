import { forwardRef, type ButtonHTMLAttributes } from "react";

const idle = {
  background: "transparent",
  boxShadow: "0 0 12px rgba(20,184,166,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
  borderColor: "rgba(20,184,166,0.55)",
};
const hover = {
  background: "rgba(20,184,166,0.12)",
  boxShadow: "0 0 20px rgba(20,184,166,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
  borderColor: "rgba(20,184,166,0.8)",
};

/** Teal outline pill used for the header actions ("Add application", "From this page"). */
export const PillButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ style, onMouseEnter, onMouseLeave, className = "", ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`flex items-center gap-1.5 cursor-pointer disabled:cursor-wait disabled:opacity-70 ${className}`}
      style={{
        ...idle,
        padding: "9px 18px",
        borderRadius: "9999px",
        borderWidth: "1.5px",
        borderStyle: "solid",
        color: "#5eead4",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        transition: "all 0.2s ease",
        fontFamily: "Roboto, sans-serif",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!e.currentTarget.disabled) Object.assign(e.currentTarget.style, hover);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, idle);
        onMouseLeave?.(e);
      }}
      {...props}
    />
  ),
);
PillButton.displayName = "PillButton";
