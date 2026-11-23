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
  /** Absent in dots-only mode. */
  label?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/** Footprint of a detection plus how far it stays from content / the viewport edge. */
interface Size {
  width: number;
  height: number;
  gap: number;
  edge: number;
}
// Generous estimate of a blip + label, px.
const LABELED: Size = { width: 230, height: 34, gap: 16, edge: 24 };
// A blip + its ping ring: tiny, so it can sit much closer to content.
const DOT: Size = { width: 18, height: 18, gap: 6, edge: 12 };
const LABEL_MS = 4800;
const BLIP_MS = 3800;
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

const overlapsContent = (x: number, y: number, size: Size, rects: DOMRect[]) =>
  rects.some(
    (r) =>
      x < r.right + size.gap &&
      x + size.width > r.left - size.gap &&
      y < r.bottom + size.gap &&
      y + size.height > r.top - size.gap,
  );

const fitsViewport = (x: number, y: number, size: Size) =>
  x >= size.edge &&
  y >= size.edge &&
  x <= window.innerWidth - size.width - size.edge &&
  y <= window.innerHeight - size.height - size.edge;

/** A random empty spot in the viewport, or near (`around`) a point. */
const findFreeSpot = (size: Size, around?: { x: number; y: number }) => {
  const rects = avoidRects();
  for (let attempt = 0; attempt < 40; attempt++) {
    let x: number;
    let y: number;
    if (around) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 110;
      x = around.x + Math.cos(angle) * distance - size.width / 4;
      y = around.y + Math.sin(angle) * distance - size.height / 2;
    } else {
      x = size.edge + Math.random() * (window.innerWidth - size.width - 2 * size.edge);
      y = size.edge + Math.random() * (window.innerHeight - size.height - 2 * size.edge);
    }
    if (fitsViewport(x, y, size) && !overlapsContent(x, y, size, rects)) return { x, y };
  }
  return null; // no empty space right now — skip
};

export interface RadarBackgroundProps {
  /**
   * Occasionally pop up "detections" by itself. Clicks on empty space can
   * always produce an "echo" detection.
   */
  detections?: boolean;
  /**
   * true (default): one work-themed label every 25–45s.
   * false: dots only — 1–3 blips that flash, ping twice and fade, every 6–12s.
   */
  labels?: boolean;
}

/**
 * Radar net behind the whole page: slow sweep, a "scanner" spotlight that
 * follows the cursor over empty space, ping ripples on click, and rare
 * work-themed detections. Never reacts over content (`data-radar-avoid`,
 * dialogs, controls); decorative only; off for prefers-reduced-motion.
 *
 * Put page content in a positioned layer above it (e.g. `relative z-[1]`).
 */
export const RadarBackground = ({
  detections = false,
  labels = true,
}: RadarBackgroundProps) => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Detection[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const lastLabel = useRef<string | null>(null);
  const nextId = useRef(1);
  const timers = useRef(new Set<number>());
  const size = labels ? LABELED : DOT;

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  };

  const showDetection = (spot: { x: number; y: number }) => {
    const id = nextId.current++;
    if (labels) {
      const choices = DETECTION_LABELS.filter((l) => l !== lastLabel.current);
      const label = choices[Math.floor(Math.random() * choices.length)];
      lastLabel.current = label;
      setShown([{ id, label, ...spot }]); // one label at a time
    } else {
      setShown((current) => [...current.slice(-5), { id, ...spot }]);
    }
    later(
      () => setShown((current) => current.filter((d) => d.id !== id)),
      labels ? LABEL_MS : BLIP_MS,
    );
  };

  // Passive detections.
  useEffect(() => {
    if (!detections || prefersReducedMotion()) return;
    let timer: number | undefined;
    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          // Labels: one; dots: a small cluster, staggered like a sweep passing.
          const count = labels ? 1 : 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < count; i++) {
            later(() => {
              const spot = findFreeSpot(size);
              if (spot) showDetection(spot);
            }, i * (300 + Math.random() * 600));
          }
        }
        schedule(labels ? 25_000 + Math.random() * 20_000 : 6_000 + Math.random() * 6_000);
      }, delay);
    };
    schedule(labels ? 8_000 + Math.random() * 7_000 : 2_000 + Math.random() * 3_000);
    return () => window.clearTimeout(timer);
  }, [detections, labels]);

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
        const spot = findFreeSpot(size, { x: event.clientX, y: event.clientY });
        if (spot) {
          lastEcho = now;
          later(() => showDetection(spot), 450); // the "echo" comes back
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
  }, [labels]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

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
      {shown.map((d) =>
        d.label ? (
          <div key={d.id} className="radar-detection" style={{ left: d.x, top: d.y }}>
            <span className="radar-detection__dot" />
            <span className="radar-detection__label">{d.label}</span>
          </div>
        ) : (
          <span key={d.id} className="radar-blip" style={{ left: d.x, top: d.y }}>
            <span className="radar-blip__ring" />
            <span className="radar-blip__ring radar-blip__ring--late" />
            <span className="radar-blip__dot" />
          </span>
        ),
      )}
    </div>
  );
};
