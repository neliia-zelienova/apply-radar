import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarClock, RotateCcw, X } from "lucide-react";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  getStatusLabel,
} from "@apply-radar/shared";
import { Button, useRadarEffects } from "@apply-radar/ui";
import { DEMO_APPLICATIONS, NEXT_STATUS, STATUS_BAND, type DemoApplication } from "./demo-data";
import { BLIP_DOT, STATUS_PILL } from "./status-style";
import { StatusIcon } from "./status-icon";

/** One sweep, in seconds (keep in sync with `.scope-sweep` in styles.css). */
const SWEEP_SECONDS = 6;

const RINGS = [
  { inset: "36%", label: "Offer" },
  { inset: "22%", label: "Interview" },
  { inset: "8%", label: "Applied" },
];

/** Blip position (percent of the scope) from its angle and ring band. */
const positionOf = (app: DemoApplication) => {
  const [inner, outer] = STATUS_BAND[app.status];
  const radius = inner + (outer - inner) * app.jitter;
  const rad = (app.angle * Math.PI) / 180;
  return {
    left: `${50 + radius * 50 * Math.sin(rad)}%`,
    top: `${50 - radius * 50 * Math.cos(rad)}%`,
  };
};

const daysLabel = (days: number) => (days === 1 ? "1 day ago" : `${days} days ago`);

/**
 * Hero demo: made-up applications as blips. The closer to the center, the
 * closer to an offer. Click a blip to see it, move it a stage closer or mark it
 * rejected; the chips below count and filter by status.
 */
export const RadarScope = () => {
  const { enabled: effects } = useRadarEffects();
  const [apps, setApps] = useState(DEMO_APPLICATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(DEMO_APPLICATIONS[0].id);
  const [hidden, setHidden] = useState<ReadonlySet<ApplicationStatus>>(new Set());

  const counts = useMemo(() => {
    const result = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<
      ApplicationStatus,
      number
    >;
    for (const app of apps) result[app.status] += 1;
    return result;
  }, [apps]);

  const selected = apps.find((app) => app.id === selectedId && !hidden.has(app.status));

  const setStatus = (id: string, status: ApplicationStatus) =>
    setApps((list) => list.map((app) => (app.id === id ? { ...app, status } : app)));

  const toggleStatus = (status: ApplicationStatus) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  const changed = apps.some((app, i) => app.status !== DEMO_APPLICATIONS[i].status);

  return (
    <div data-radar-avoid className="flex w-full flex-col items-center gap-5">
      <div
        className={`scope relative aspect-square w-full max-w-[440px] rounded-full ${effects ? "" : "scope--still"}`}
        role="group"
        aria-label="Demo radar of job applications"
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

        {apps.map((app) => {
          if (hidden.has(app.status)) return null;
          const isSelected = app.id === selected?.id;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => setSelectedId(isSelected ? null : app.id)}
              aria-pressed={isSelected}
              aria-label={`${app.company}, ${app.position}: ${getStatusLabel(app.status)}`}
              className="scope-blip group absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-[left,top] duration-700 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/40"
              style={positionOf(app)}
            >
              <span
                className={`scope-blip-dot block rounded-full transition-transform duration-200 group-hover:scale-125 ${BLIP_DOT[app.status]} ${isSelected ? "h-4 w-4 scope-blip-dot--selected" : "h-3 w-3"}`}
                // Lights up as the sweep passes its angle.
                style={{ animationDelay: `${(app.angle / 360) * SWEEP_SECONDS - SWEEP_SECONDS}s` }}
              />
              {isSelected && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-teal-500/60 dark:ring-teal-300/60"
                />
              )}
              <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-900/90 dark:text-slate-200">
                {app.company}
              </span>
            </button>
          );
        })}

        <span className="absolute -top-1 right-2 rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-md shadow-teal-900/20">
          Demo · click a blip
        </span>
      </div>

      {/* Counts double as filters */}
      <div className="flex flex-wrap justify-center gap-2" aria-label="Filter the demo by status">
        {APPLICATION_STATUSES.map((status) => {
          const off = hidden.has(status);
          return (
            <button
              key={status}
              type="button"
              aria-pressed={!off}
              onClick={() => toggleStatus(status)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-opacity ${STATUS_PILL[status]} ${off ? "opacity-40 line-through" : ""}`}
            >
              <span className={`h-2 w-2 rounded-full ${BLIP_DOT[status]}`} />
              {getStatusLabel(status)}
              <span className="tabular-nums opacity-80">{counts[status]}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[164px] w-full max-w-[440px]">
        {selected ? (
          <div
            key={selected.id}
            className="scope-card rounded-3xl border border-black/5 bg-white/95 p-4 text-left shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-[#0f1829]/95 dark:shadow-black/40"
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={selected.status} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-gray-900 dark:text-slate-100">
                  {selected.company}
                </div>
                <div className="truncate text-sm text-gray-500 dark:text-slate-400">
                  {selected.position} · {daysLabel(selected.daysAgo)}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_PILL[selected.status]}`}
              >
                {getStatusLabel(selected.status)}
              </span>
            </div>
            {selected.interview && selected.status === ApplicationStatus.INTERVIEW && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-teal-500/[0.08] px-3 py-2 text-xs text-teal-900 dark:text-teal-100">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                {selected.interview}
              </div>
            )}
            <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">{selected.note}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {NEXT_STATUS[selected.status] ? (
                <Button
                  size="sm"
                  onClick={() => setStatus(selected.id, NEXT_STATUS[selected.status]!)}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Move to {getStatusLabel(NEXT_STATUS[selected.status]!)}
                </Button>
              ) : null}
              {selected.status === ApplicationStatus.REJECTED ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStatus(selected.id, ApplicationStatus.PENDING)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Back to Applied
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStatus(selected.id, ApplicationStatus.REJECTED)}
                >
                  <X className="h-3.5 w-3.5" />
                  Mark rejected
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[164px] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-teal-600/25 text-sm text-gray-500 dark:border-teal-300/20 dark:text-slate-400">
            Click a blip to see the application.
            {changed && (
              <button
                type="button"
                onClick={() => setApps(DEMO_APPLICATIONS)}
                className="cursor-pointer text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Reset the demo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
