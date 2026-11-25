import { ApplicationStatus } from "@apply-radar/shared";

// Full class names (Tailwind only generates classes it finds as written).

/** Blip dot color per status. */
export const BLIP_DOT: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.55)]",
  [ApplicationStatus.INTERVIEW]: "bg-teal-400 shadow-[0_0_10px_2px_rgba(45,212,191,0.6)]",
  [ApplicationStatus.OFFERED]: "bg-emerald-500 shadow-[0_0_12px_3px_rgba(16,185,129,0.6)]",
  [ApplicationStatus.REJECTED]: "bg-red-500/80 shadow-[0_0_8px_1px_rgba(239,68,68,0.45)]",
};

/** Status pill (chips, labels). */
export const STATUS_PILL: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]:
    "bg-amber-400/15 text-amber-800 ring-amber-500/30 dark:text-amber-200",
  [ApplicationStatus.INTERVIEW]:
    "bg-teal-400/15 text-teal-800 ring-teal-500/30 dark:text-teal-200",
  [ApplicationStatus.OFFERED]:
    "bg-emerald-500/15 text-emerald-800 ring-emerald-500/30 dark:text-emerald-200",
  [ApplicationStatus.REJECTED]: "bg-red-500/12 text-red-700 ring-red-500/30 dark:text-red-300",
};

/** The extension's animated status icons (packages/ui styles.css). */
export const STATUS_ICON: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "radar-no-target",
  [ApplicationStatus.INTERVIEW]: "radar-weak-lock",
  [ApplicationStatus.OFFERED]: "radar-strong-lock",
  [ApplicationStatus.REJECTED]: "radar-lost",
};

/** Number on a "+N" group bubble, readable on its status color. */
export const GROUP_TEXT: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "text-amber-950",
  [ApplicationStatus.INTERVIEW]: "text-teal-950",
  [ApplicationStatus.OFFERED]: "text-emerald-950",
  [ApplicationStatus.REJECTED]: "text-white",
};
