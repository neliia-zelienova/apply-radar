/**
 * Apply Radar logo: a still radar scope — range rings, crosshair, a sweep
 * wedge and two blips. Not animated on purpose (the backgrounds already move).
 * Base color follows the theme (see `.radar-logo` in styles.css).
 */
export const RadarLogo = ({ size = 36 }: { size?: number }) => (
  <div
    aria-hidden
    className="radar-logo relative shrink-0 overflow-hidden"
    style={{ width: size, height: size }}
  >
    {/* Rings + crosshair (24 units = full diameter) */}
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" className="absolute inset-0">
      <g stroke="rgba(20,184,166,0.45)" strokeWidth="0.55">
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="12" cy="12" r="7.6" />
        <line x1="12" y1="0.5" x2="12" y2="23.5" strokeOpacity="0.6" />
        <line x1="0.5" y1="12" x2="23.5" y2="12" strokeOpacity="0.6" />
      </g>
      <circle cx="12" cy="12" r="0.9" fill="rgba(20,184,166,0.95)" />
    </svg>

    <div className="radar-logo-sweep" />

    {/* Just swept (bright) and further around (dim) */}
    <span className="radar-logo-blip" style={{ left: "68%", top: "30%" }} />
    <span className="radar-logo-blip" style={{ left: "30%", top: "64%", opacity: 0.35 }} />
  </div>
);

/**
 * Faint radar sweep with range rings, centered on the header's bottom-right
 * corner (away from the logo). Purely decorative; fades out towards the edges.
 */
export const HeaderRadar = () => (
  <div aria-hidden className="header-radar">
    <div className="header-radar__sweep" />
    {/* Blips in the visible (upper-left) quadrant; delay = angle from 12 o'clock / 360 × 10s,
        so each lights up as the sweep passes. Box is 520px, center 260/260. */}
    <span className="header-radar__blip" style={{ left: 67, top: 208, animationDelay: "7.92s" }} />
    <span className="header-radar__blip" style={{ left: 165, top: 205, animationDelay: "8.33s" }} />
    <span className="header-radar__blip" style={{ left: 174, top: 137, animationDelay: "9.03s" }} />
  </div>
);
