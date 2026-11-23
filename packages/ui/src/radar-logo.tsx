/**
 * Apply Radar logo: a small radar scope — range rings, crosshair and a sweep
 * wedge (bright leading edge, fading trail) that lights up blips as it passes.
 * Animations stop for prefers-reduced-motion (see styles.css).
 */
export const RadarLogo = ({ size = 36 }: { size?: number }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <span aria-hidden className="radar-logo-ping" />
    <span aria-hidden className="radar-logo-ping radar-logo-ping--delayed" />
    <div
      aria-hidden
      className="relative h-full w-full overflow-hidden"
      style={{
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 50% 50%, rgba(20,184,166,0.32), rgba(20,184,166,0.08) 70%)",
        border: "1.5px solid rgba(20,184,166,0.45)",
        boxShadow: "0 0 16px rgba(20,184,166,0.25)",
      }}
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

      {/* Rotating sweep: fading wedge + bright leading line (one turn = 4s) */}
      <div className="radar-logo-sweep" />

      {/* Blips flash when the sweep crosses them (delay = angle / 360 × 4s) */}
      <span className="radar-logo-blip" style={{ left: "68%", top: "30%", animationDelay: "0.47s" }} />
      <span className="radar-logo-blip" style={{ left: "30%", top: "64%", animationDelay: "2.61s" }} />
    </div>
  </div>
);

/**
 * Faint radar sweep with range rings, centered on the header logo.
 * Purely decorative; fades out towards the edges.
 */
export const HeaderRadar = () => (
  <div aria-hidden className="header-radar">
    <div className="header-radar__sweep" />
    {/* delay = angle from 12 o'clock / 360 × 10s, so each lights up as the sweep passes */}
    <span className="header-radar__blip" style={{ left: 356, top: 268, animationDelay: "2.64s" }} />
    <span className="header-radar__blip" style={{ left: 392, top: 312, animationDelay: "3.1s" }} />
    <span className="header-radar__blip" style={{ left: 300, top: 344, animationDelay: "4.29s" }} />
  </div>
);
