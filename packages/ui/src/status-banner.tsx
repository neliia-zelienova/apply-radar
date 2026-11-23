import type { ReactNode } from "react";
import classNames from "classnames";

export interface StatusBannerProps {
  tone?: "info" | "success" | "error";
  children: ReactNode;
  /** Buttons/links shown on the right (e.g. Retry, Dismiss). */
  actions?: ReactNode;
  className?: string;
}

const TONES = {
  info: "border-teal-500/30 bg-teal-500/10 text-teal-900 dark:text-teal-200",
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
  error: "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200",
} as const;

/** One-line notice for sync/upload status and errors. */
export const StatusBanner = ({
  tone = "info",
  children,
  actions,
  className,
}: StatusBannerProps) => (
  <div
    data-radar-avoid
    role={tone === "error" ? "alert" : "status"}
    className={classNames(
      "flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-xs",
      TONES[tone],
      className,
    )}
  >
    <div className="min-w-0 text-left">{children}</div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

/** Small text button for banner actions. */
export const BannerAction = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer font-semibold underline-offset-2 hover:underline"
  >
    {children}
  </button>
);
