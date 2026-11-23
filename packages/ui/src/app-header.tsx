import type { ReactNode } from "react";
import { HeaderRadar, RadarLogo } from "./radar-logo";

export interface AppHeaderProps {
  /** Shown at the top right (e.g. settings menu). */
  right?: ReactNode;
  /** Shown under the logo row (e.g. the "Add application" button). */
  children?: ReactNode;
  /**
   * The slow radar sweep in the header. Off where the page background is
   * already animated (web app).
   */
  animated?: boolean;
  /** Space under the content; the extension's list overlaps the bottom 18px. */
  paddingBottom?: number;
  /** Extra classes for the content row, e.g. "mx-auto max-w-6xl" to line up with the page. */
  contentClassName?: string;
}

/** Dark radar-style header with the Apply Radar logo, shared by the extension and web. */
export const AppHeader = ({
  right,
  children,
  animated = true,
  paddingBottom = 28,
  contentClassName = "",
}: AppHeaderProps) => {
  return (
    <div
      data-radar-avoid
      className="w-full relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #050b1a 0%, #071328 55%, #0c1a32 100%)",
        paddingBottom,
      }}
    >
      {/* Scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 3px)",
        }}
      />

      {/* Slow radar sweep around the logo */}
      {animated && <HeaderRadar />}

      {/* Teal radial glow, with the radar in the bottom-right corner */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-40px",
          right: "-40px",
          width: "200px",
          height: "120px",
          background:
            "radial-gradient(ellipse, rgba(20,184,166,0.18) 0%, transparent 70%)",
        }}
      />

      <div className={`relative z-10 px-[18px] pt-[18px] flex flex-col gap-3.5 ${contentClassName}`}>
        {/* Top row: logo + settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RadarLogo />

            {/* Brand text — left-aligned to the logo (overrides the inherited `#root { text-align: center }`) */}
            <div className="text-left">
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#f0fdf9",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  fontFamily: "Roboto, sans-serif",
                }}
              >
                Apply Radar
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(94,234,212,0.75)",
                  letterSpacing: "0.03em",
                  fontWeight: 400,
                  fontFamily: "Roboto, sans-serif",
                }}
              >
                Every application. Always on radar.
              </div>
            </div>
          </div>

          {right && <div className="flex-shrink-0">{right}</div>}
        </div>

        {children}
      </div>
    </div>
  );
};
