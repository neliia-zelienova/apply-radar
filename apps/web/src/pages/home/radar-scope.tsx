import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarClock, RotateCcw, X } from "lucide-react";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  getStatusLabel,
} from "@apply-radar/shared";
import { Button } from "@apply-radar/ui";
import { DEMO_APPLICATIONS, type DemoApplication } from "./demo-data";
import { NEXT_STATUS, STATUS_BAND } from "../../components/radar/bands";
import { Scope, type ScopeBlip } from "../../components/radar/scope";
import { BLIP_DOT, STATUS_PILL } from "../../components/radar/status-style";
import { StatusIcon } from "../../components/radar/status-icon";

/** A demo application as a blip: its own angle, and a spot inside its ring band. */
const toBlip = (app: DemoApplication): ScopeBlip => {
  const [inner, outer] = STATUS_BAND[app.status];
  return {
    id: app.id,
    label: app.company,
    ariaLabel: `${app.company}, ${app.position}: ${getStatusLabel(app.status)}`,
    status: app.status,
    angle: app.angle,
    radius: inner + (outer - inner) * app.jitter,
  };
};

const daysLabel = (days: number) => (days === 1 ? "1 day ago" : `${days} days ago`);

/**
 * Hero demo: made-up applications as blips. The closer to the center, the
 * closer to an offer. Click a blip to see it, move it a stage closer or mark it
 * rejected; the chips below count and filter by status.
 */
export const RadarScope = () => {
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
      <Scope
        className="max-w-[440px]"
        ariaLabel="Demo radar of job applications"
        blips={apps.filter((app) => !hidden.has(app.status)).map(toBlip)}
        selectedId={selected?.id ?? null}
        onSelect={setSelectedId}
        badge={
          <span className="rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-md shadow-teal-900/20">
            Demo · click a blip
          </span>
        }
      />

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
