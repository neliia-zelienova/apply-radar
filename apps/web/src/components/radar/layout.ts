import type { ApplicationStatus } from "@apply-radar/shared";
import { STATUS_BAND } from "./bands";
import { polarToPercent } from "./geometry";
import type { ScopeTick } from "./scope";

/*
 * Where an application sits on the dashboard radar:
 * - distance from the center: its stage (ring band per status);
 * - angle: days since you applied, clockwise from 12 o'clock.
 *
 * The time scale is a square root, so the last few weeks get most of the dial
 * (people apply in bursts) and anything older than MAX_DAYS waits at the end.
 * It starts a little after 12 o'clock to keep clear of the ring labels.
 */
const START_ANGLE = 24;
const END_ANGLE = 345;
const MAX_DAYS = 90;

export const angleForDays = (days: number) =>
  START_ANGLE +
  (END_ANGLE - START_ANGLE) * Math.sqrt(Math.min(Math.max(days, 0), MAX_DAYS) / MAX_DAYS);

export const TIME_TICKS: ScopeTick[] = [
  { days: 0, label: "Today" },
  { days: 7, label: "1w" },
  { days: 14, label: "2w" },
  { days: 30, label: "1m" },
  { days: 60, label: "2m" },
  { days: MAX_DAYS, label: "3m+" },
].map(({ days, label }) => ({ angle: angleForDays(days), label }));

/** Stable 0-1 value per id and salt (FNV-1a), so blips don't move between renders. */
const hash01 = (value: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x1_0000_0000;
};

export interface LayoutItem {
  id: string;
  status: ApplicationStatus;
  daysAgo: number;
}

export interface BlipPosition {
  angle: number;
  radius: number;
}

/** Default closest gap between blip centers, in percent of the scope's width. */
const MIN_GAP = 5;
const PASSES = 40;
/** How far a crowded blip may drift from its time, in degrees. */
const MAX_DRIFT = 25;

const toPolar = (x: number, y: number) => {
  const dx = x - 50;
  const dy = 50 - y;
  const angle = ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
  return { angle, radius: Math.hypot(dx, dy) / 50 };
};

/**
 * Positions for every item: its time and band, a small stable jitter, then a
 * few passes that push overlapping blips apart without leaving their band.
 */
export const layoutBlips = (
  items: readonly LayoutItem[],
  minGap = MIN_GAP,
): Map<string, BlipPosition> => {
  const sorted = [...items].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const points = sorted.map((item) => {
    const [inner, outer] = STATUS_BAND[item.status];
    // Keep a little margin inside the band so dots don't touch the ring lines.
    const pad = (outer - inner) * 0.12;
    const lo = inner + pad;
    const hi = outer - pad;
    const home = angleForDays(item.daysAgo) + (hash01(`${item.id}:a`) - 0.5) * 6;
    const radius = lo + (hi - lo) * hash01(`${item.id}:r`);
    return { id: item.id, lo, hi, home, ...polarToPercent(home, radius) };
  });

  const clampToBand = (p: (typeof points)[number]) => {
    const polar = toPolar(p.left, p.top);
    // Measure from the blip's own time, so crossing 12 o'clock doesn't wrap around.
    let angle = polar.angle;
    if (angle - p.home > 180) angle -= 360;
    else if (p.home - angle > 180) angle += 360;
    angle = Math.min(Math.max(angle, p.home - MAX_DRIFT), p.home + MAX_DRIFT);
    angle = Math.min(Math.max(angle, START_ANGLE - 8), END_ANGLE + 8);
    const radius = Math.min(Math.max(polar.radius, p.lo), p.hi);
    Object.assign(p, polarToPercent(angle, radius));
  };

  for (let pass = 0; pass < PASSES; pass++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        let dx = b.left - a.left;
        let dy = b.top - a.top;
        let distance = Math.hypot(dx, dy);
        if (distance >= minGap) continue;
        if (distance < 0.01) {
          // Same spot: pick a stable direction.
          const turn = hash01(`${a.id}:${b.id}`) * Math.PI * 2;
          dx = Math.cos(turn);
          dy = Math.sin(turn);
          distance = 1;
        }
        const push = (minGap - distance) / 2;
        const ux = dx / distance;
        const uy = dy / distance;
        a.left -= ux * push;
        a.top -= uy * push;
        b.left += ux * push;
        b.top += uy * push;
        moved = true;
      }
    }
    points.forEach(clampToBand);
    if (!moved) break;
  }

  return new Map(
    points.map((p) => {
      const { angle, radius } = toPolar(p.left, p.top);
      return [p.id, { angle, radius }];
    }),
  );
};

export interface PlacedBlip extends BlipPosition {
  id: string;
  status: ApplicationStatus;
}

export interface BlipGroup extends BlipPosition {
  /** The id for a single blip; "group:" + the first member id (sorted) for a group. */
  key: string;
  status: ApplicationStatus;
  ids: string[];
}

/**
 * Blips of the same status that are still closer than `threshold` (percent of
 * the scope; more when a bubble is involved) after spreading are merged into
 * one group, drawn as a "+N" bubble.
 */
export const groupBlips = (blips: readonly PlacedBlip[], threshold: number): BlipGroup[] => {
  let groups = [...blips]
    .sort((a, b) => a.angle - b.angle)
    .map((blip) => ({ status: blip.status, ids: [blip.id], ...polarToPercent(blip.angle, blip.radius) }));

  // A bubble is about twice a dot's size, so it needs more room around it.
  const needed = (a: { ids: string[] }, b: { ids: string[] }) =>
    threshold * (1 + (a.ids.length > 1 ? 0.35 : 0) + (b.ids.length > 1 ? 0.35 : 0));

  // Merge the most crowded same-status pair until every pair has its room;
  // a merged group sits at the middle of its members.
  for (;;) {
    let best: [number, number] | null = null;
    let bestRatio = 1;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        if (groups[i].status !== groups[j].status) continue;
        const d = Math.hypot(groups[i].left - groups[j].left, groups[i].top - groups[j].top);
        const ratio = d / needed(groups[i], groups[j]);
        if (ratio < bestRatio) {
          bestRatio = ratio;
          best = [i, j];
        }
      }
    }
    if (!best) break;
    const [a, b] = [groups[best[0]], groups[best[1]]];
    const na = a.ids.length;
    const nb = b.ids.length;
    const merged = {
      status: a.status,
      ids: [...a.ids, ...b.ids],
      left: (a.left * na + b.left * nb) / (na + nb),
      top: (a.top * na + b.top * nb) / (na + nb),
    };
    groups = groups.filter((_, k) => k !== best![0] && k !== best![1]).concat(merged);
  }

  return groups.map(({ left, top, ids, status }) => {
    const sortedIds = [...ids].sort();
    const key = sortedIds.length === 1 ? sortedIds[0] : `group:${sortedIds[0]}`;
    return { key, status, ids: sortedIds, ...toPolar(left, top) };
  });
};
