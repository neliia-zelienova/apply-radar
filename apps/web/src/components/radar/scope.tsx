import type { ReactNode } from "react";
import type { ApplicationStatus } from "@apply-radar/shared";
import { useRadarEffects } from "@apply-radar/ui";
import { polarToPercent } from "./geometry";
import { BLIP_DOT, GROUP_TEXT } from "./status-style";

/** One sweep, in seconds (keep in sync with `.scope-sweep` in styles.css). */
const SWEEP_SECONDS = 6;

/** Range rings, outer edge as an inset of the scope. The closer to the center, the closer to an offer. */
const RINGS = [
  { inset: "36%", label: "Offer" },
  { inset: "22%", label: "Interview" },
  { inset: "8%", label: "Applied" },
];

export interface ScopeBlip {
  id: string;
  /** Shown next to the blip on hover/focus. */
  label: string;
  /** Read by screen readers. */
  ariaLabel: string;
  status: ApplicationStatus;
  /** Degrees clockwise from 12 o'clock. */
  angle: number;
  /** Distance from the center, 0-1 of the scope's radius. */
  radius: number;
  /** Pulsing ring, e.g. an upcoming interview. */
  ping?: boolean;
  /** A slightly bigger dot, e.g. a favorite. */
  large?: boolean;
  /** More than 1: a bubble with this number (blips too close to tell apart). */
  count?: number;
}

/** A label around the rim, outside the scope (leave room for it around the scope). */
export interface ScopeTick {
  angle: number;
  label: string;
}

/**
 * The radar scope: rings, a rotating sweep and clickable blips. It only draws;
 * the caller decides where blips go and what a click does.
 */
export const Scope = ({
  blips,
  selectedId,
  onSelect,
  ariaLabel,
  ticks = [],
  badge,
  blipSize = "md",
  className = "",
}: {
  blips: readonly ScopeBlip[];
  selectedId: string | null;
  /** Called with null when the selected blip is clicked again. */
  onSelect: (id: string | null) => void;
  ariaLabel: string;
  ticks?: readonly ScopeTick[];
  /** Pill in the top right corner. */
  badge?: ReactNode;
  /** Hit area: md 36px (few blips), sm 28px (many), xs 24px (many on a small scope). */
  blipSize?: "xs" | "sm" | "md";
  className?: string;
}) => {
  const { enabled: effects } = useRadarEffects();

  return (
    <div
      className={`scope relative aspect-square w-full rounded-full ${effects ? "" : "scope--still"} ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {/* Range rings, labeled at the top */}
      <div aria-hidden className="absolute inset-0 rounded-full">
        {RINGS.map(({ inset, label }) => (
          <div
            key={label}
            className="absolute rounded-full border border-teal-600/25 dark:border-teal-300/20"
            style={{ inset }}
          >
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--bg-app)] px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700/80 dark:text-teal-300/70">
              {label}
            </span>
          </div>
        ))}
        <div className="absolute inset-y-[3%] left-1/2 w-px bg-teal-600/15 dark:bg-teal-300/12" />
        <div className="absolute inset-x-[3%] top-1/2 h-px bg-teal-600/15 dark:bg-teal-300/12" />
        <div className="scope-sweep absolute inset-0 rounded-full" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500 shadow-[0_0_12px_3px_rgba(20,184,166,0.55)]" />
      </div>

      {/* Rim ticks: a short mark on the edge and the label just outside it */}
      {ticks.map(({ angle, label }) => {
        const mark = polarToPercent(angle, 0.985);
        const text = polarToPercent(angle, 1.1);
        return (
          <div key={label} aria-hidden>
            <span
              className="absolute h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-teal-600/40 dark:bg-teal-300/35"
              style={{ left: `${mark.left}%`, top: `${mark.top}%`, rotate: `${angle}deg` }}
            />
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-700/70 dark:text-teal-300/60"
              style={{ left: `${text.left}%`, top: `${text.top}%` }}
            >
              {label}
            </span>
          </div>
        );
      })}

      {blips.map((blip) => {
        const isSelected = blip.id === selectedId;
        const { left, top } = polarToPercent(blip.angle, blip.radius);
        const dotSize = isSelected ? "h-4 w-4" : blip.large ? "h-3.5 w-3.5" : "h-3 w-3";
        return (
          <button
            key={blip.id}
            type="button"
            onClick={() => onSelect(isSelected ? null : blip.id)}
            aria-pressed={isSelected}
            aria-label={blip.ariaLabel}
            className={`scope-blip group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-[left,top] duration-700 ease-out hover:z-10 focus:outline-none focus-visible:z-10 focus-visible:ring-4 focus-visible:ring-teal-500/40 ${
              { xs: "h-6 w-6", sm: "h-7 w-7", md: "h-9 w-9" }[blipSize]
            } ${isSelected ? "z-10" : ""}`}
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {blip.ping && (
              <>
                {/* A steady ring, plus a pulse going out from it */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute h-5 w-5 rounded-full ring-[1.5px] ring-teal-500/70 dark:ring-teal-300/70"
                />
                <span
                  aria-hidden
                  className="scope-blip-ping pointer-events-none absolute h-5 w-5 rounded-full ring-2 ring-teal-400/60"
                />
              </>
            )}
            {blip.count && blip.count > 1 ? (
              <span
                className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums ring-2 ring-white/70 transition-transform duration-200 group-hover:scale-110 dark:ring-slate-950/50 ${BLIP_DOT[blip.status]} ${GROUP_TEXT[blip.status]}`}
              >
                {blip.count}
              </span>
            ) : (
              <span
                className={`scope-blip-dot block rounded-full transition-transform duration-200 group-hover:scale-125 ${BLIP_DOT[blip.status]} ${dotSize} ${isSelected ? "scope-blip-dot--selected" : ""}`}
                // Lights up as the sweep passes its angle.
                style={{ animationDelay: `${(blip.angle / 360) * SWEEP_SECONDS - SWEEP_SECONDS}s` }}
              />
            )}
            {isSelected && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-teal-500/60 dark:ring-teal-300/60"
              />
            )}
            <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-900/90 dark:text-slate-200">
              {blip.label}
            </span>
          </button>
        );
      })}

      {badge && <div className="absolute -top-1 right-2 flex">{badge}</div>}
    </div>
  );
};
