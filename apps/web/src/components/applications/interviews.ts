import type { Application, Interview } from "@apply-radar/shared";

/** Saves through the store: optimistic, rolls back and resolves false on failure. */
export type UpdateApplication = (
  id: string,
  updater: (app: Application) => Application,
) => Promise<boolean>;

/** The soonest interview still ahead, if any. */
export const nextInterview = (app: Application, now: number): Interview | undefined =>
  (app.interviews ?? [])
    .filter((i) => new Date(i.scheduledAt).getTime() > now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];

/** "Fri, 27 Nov, 14:00" in the viewer's locale. */
export const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** "12 Nov 2026", for tooltips. */
export const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/** An application with no answer for this many days is due a follow-up (same as the stats). */
export const STALE_AFTER_DAYS = 7;
