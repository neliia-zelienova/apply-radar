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

/** Radar-style header with the Apply Radar logo (light or dark with the theme), shared by the extension and web. */
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
      // Colors follow the theme (see `.app-header` in styles.css).
      className="app-header w-full relative overflow-hidden"
      style={{ paddingBottom }}
    >
      {/* Scanline texture */}
      <div className="app-header__scanlines absolute inset-0 pointer-events-none" />

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
                className="text-slate-900 dark:text-[#f0fdf9]"
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  fontFamily: "Roboto, sans-serif",
                }}
              >
                Apply Radar
              </div>
              <div
                className="text-teal-700/85 dark:text-teal-300/75"
                style={{
                  fontSize: "12px",
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
