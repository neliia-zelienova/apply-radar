import { useEffect, useRef, useState } from "react";

/** Tongue-in-cheek "detections" for the background easter egg. */
export const DETECTION_LABELS = [
  "Recruiter ping detected",
  "New posting · 2 km",
  "Signal: Senior Frontend role",
  "Coffee chat incoming ☕",
  "Interview frequency locked",
  "Unidentified offer approaching…",
  "Hiring manager sighted",
  "LinkedIn activity spike",
  "Referral beacon active",
  "Salary band within range",
  "Take-home assignment on radar",
  "Follow-up window open",
];

interface Detection {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const LABEL_WIDTH = 230; // generous estimate of a blip + label, px
const LABEL_HEIGHT = 34;
const EDGE = 24;
const GAP = 16; // keep this far away from content
const SPOTLIGHT = 340; // px, diameter of the hover "scanner"
const ECHO_CHANCE = 0.35; // share of clicks that get a detection nearby
const ECHO_COOLDOWN = 3000;

/** Interactive UI where background effects must never react or appear. */
const CONTENT_SELECTOR =
  '[data-radar-avoid], [role="dialog"], [role="menu"], [role="listbox"], button, a, input, textarea, select, label';

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isEmptySpace = (target: EventTarget | null) =>
  target instanceof Element && !target.closest(CONTENT_SELECTOR);

const avoidRects = () =>
  Array.from(document.querySelectorAll("[data-radar-avoid]")).map((el) =>
    el.getBoundingClientRect(),
  );

const overlapsContent = (x: number, y: number, rects: DOMRect[]) =>
  rects.some(
    (r) =>
      x < r.right + GAP &&
      x + LABEL_WIDTH > r.left - GAP &&
      y < r.bottom + GAP &&
      y + LABEL_HEIGHT > r.top - GAP,
  );

const fitsViewport = (x: number, y: number) =>
  x >= EDGE &&
  y >= EDGE &&
  x <= window.innerWidth - LABEL_WIDTH - EDGE &&
  y <= window.innerHeight - LABEL_HEIGHT - EDGE;

/** A random empty spot in the viewport, or near (`around`) a point. */
const findFreeSpot = (around?: { x: number; y: number }) => {
  const rects = avoidRects();
  for (let attempt = 0; attempt < 20; attempt++) {
    let x: number;
    let y: number;
    if (around) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 110;
      x = around.x + Math.cos(angle) * distance - LABEL_WIDTH / 4;
      y = around.y + Math.sin(angle) * distance - LABEL_HEIGHT / 2;
    } else {
      x = EDGE + Math.random() * (window.innerWidth - LABEL_WIDTH - 2 * EDGE);
      y = EDGE + Math.random() * (window.innerHeight - LABEL_HEIGHT - 2 * EDGE);
    }
    if (fitsViewport(x, y) && !overlapsContent(x, y, rects)) return { x, y };
  }
  return null; // no empty space right now — skip
};

export interface RadarBackgroundProps {
  /**
   * Occasionally pop up a work-themed "detection" by itself (every 25–45s).
   * Clicks on empty space can always produce an "echo" detection.
   */
  detections?: boolean;
}

/**
 * Radar net behind the whole page: slow sweep, a "scanner" spotlight that
 * follows the cursor over empty space, ping ripples on click, and rare
 * work-themed detections. Never reacts over content (`data-radar-avoid`,
 * dialogs, controls); decorative only; off for prefers-reduced-motion.
 *
 * Put page content in a positioned layer above it (e.g. `relative z-[1]`).
 */
export const RadarBackground = ({ detections = false }: RadarBackgroundProps) => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const lastLabel = useRef<string | null>(null);
  const nextId = useRef(1);
  const hideTimer = useRef<number | undefined>(undefined);

  const showDetection = (spot: { x: number; y: number }) => {
    const choices = DETECTION_LABELS.filter((l) => l !== lastLabel.current);
    const label = choices[Math.floor(Math.random() * choices.length)];
    lastLabel.current = label;
    setDetection({ id: nextId.current++, label, ...spot });
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setDetection(null), 4800);
  };

  // Passive detections.
  useEffect(() => {
    if (!detections || prefersReducedMotion()) return;
    let timer: number | undefined;
    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          const spot = findFreeSpot();
          if (spot) showDetection(spot);
        }
        schedule(25_000 + Math.random() * 20_000); // every 25–45s
      }, delay);
    };
    schedule(8_000 + Math.random() * 7_000); // first one after 8–15s
    return () => window.clearTimeout(timer);
  }, [detections]);

  // Hover scanner + click pings.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    let frame = 0;
    let lastEcho = 0;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const visible = isEmptySpace(event.target);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        spotlight.dataset.visible = visible ? "1" : "0";
        if (!visible) return;
        const left = event.clientX - SPOTLIGHT / 2;
        const top = event.clientY - SPOTLIGHT / 2;
        spotlight.style.transform = `translate(${left}px, ${top}px)`;
        // The net is centered on the bottom-right corner; keep the copy aligned.
        spotlight.style.setProperty("--net-x", `${window.innerWidth - left}px`);
        spotlight.style.setProperty("--net-y", `${window.innerHeight - top}px`);
      });
    };

    const hide = () => {
      spotlight.dataset.visible = "0";
    };

    const onClick = (event: MouseEvent) => {
      if (!isEmptySpace(event.target)) return;
      const ripple = { id: nextId.current++, x: event.clientX, y: event.clientY };
      setRipples((current) => [...current.slice(-3), ripple]);
      window.setTimeout(
        () => setRipples((current) => current.filter((r) => r.id !== ripple.id)),
        1400,
      );
      const now = Date.now();
      if (now - lastEcho > ECHO_COOLDOWN && Math.random() < ECHO_CHANCE) {
        const spot = findFreeSpot({ x: event.clientX, y: event.clientY });
        if (spot) {
          lastEcho = now;
          window.setTimeout(() => showDetection(spot), 450); // the "echo" comes back
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  return (
    <div aria-hidden className="radar-bg">
      <div className="radar-bg__grid" />
      <div className="radar-bg__sweep" />
      <div
        ref={spotlightRef}
        className="radar-bg__spotlight"
        data-visible="0"
        style={{ width: SPOTLIGHT, height: SPOTLIGHT }}
      />
      {ripples.map((r) => (
        <span key={r.id} className="radar-ripple" style={{ left: r.x, top: r.y }}>
          <span className="radar-ripple__ring" />
          <span className="radar-ripple__ring radar-ripple__ring--late" />
        </span>
      ))}
      {detection && (
        <div
          key={detection.id}
          className="radar-detection"
          style={{ left: detection.x, top: detection.y }}
        >
          <span className="radar-detection__dot" />
          <span className="radar-detection__label">{detection.label}</span>
        </div>
      )}
    </div>
  );
};
