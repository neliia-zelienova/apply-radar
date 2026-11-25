import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pencil,
  RotateCcw,
  Search,
  Star,
  X,
} from "lucide-react";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  formatDaysAgo,
  getDaysSince,
  getStatusLabel,
  type Application,
  type Interview,
} from "@apply-radar/shared";
import { ApplicationForm, Button, buttonClasses } from "@apply-radar/ui";
import { NEXT_STATUS } from "./bands";
import { groupBlips, layoutBlips, TIME_TICKS } from "./layout";
import { Scope, type ScopeBlip } from "./scope";
import { BLIP_DOT, GROUP_TEXT, STATUS_PILL } from "./status-style";
import { StatusIcon } from "./status-icon";

type Update = (id: string, updater: (app: Application) => Application) => Promise<boolean>;

/** More blips than this get the smaller hit area. */
const DENSE_AFTER = 24;
/** Spacing the layout aims for between blip centers. */
const BLIP_GAP_PX = 24;
/** Same-status blips closer than this (after spacing) are grouped. Above the small hit area's radius, so a click lands on the blip under it. */
const GROUP_WITHIN_PX = 18;

/** Element width, rounded to 20px so small resizes don't lay the scope out again. */
const useWidth = (ref: RefObject<HTMLElement | null>, fallback: number) => {
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.max(160, Math.round(entry.contentRect.width / 20) * 20);
      setWidth((prev) => (prev === next ? prev : next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
};

const nextInterview = (app: Application, now: number): Interview | undefined =>
  (app.interviews ?? [])
    .filter((i) => new Date(i.scheduledAt).getTime() > now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const surface = {
  background: "var(--surface-card)",
  border: "1px solid var(--border-subtle)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

/** What the selected blip shows, with the same actions as the list. */
const SelectedCard = ({
  app,
  now,
  onUpdate,
  onBack,
  groupSize,
}: {
  app: Application;
  now: number;
  onUpdate: Update;
  /** Set when the app was opened from a "+N" group. */
  onBack?: () => void;
  groupSize?: number;
}) => {
  const [editing, setEditing] = useState(false);
  const interview = nextInterview(app, now);
  const next = NEXT_STATUS[app.status];
  const setStatus = (status: ApplicationStatus) =>
    void onUpdate(app.id, (prev) => ({ ...prev, status }));

  return (
    <div className="scope-card rounded-[14px] p-4 text-left" style={surface}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          All {groupSize} here
        </button>
      )}
      <div className="flex items-start gap-3">
        <StatusIcon status={app.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-semibold text-gray-900 dark:text-slate-100">
              {app.name}
            </span>
            {app.favorite && (
              <Star aria-label="Favorite" className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-400">
            {app.position ? `${app.position} · ` : ""}
            {formatDaysAgo(app.createdAt)}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_PILL[app.status]}`}
        >
          {getStatusLabel(app.status)}
        </span>
      </div>

      {interview && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-teal-500/[0.08] px-3 py-2 text-xs text-teal-900 dark:text-teal-100">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {interview.name ? `${interview.name} · ` : "Interview · "}
            {formatWhen(interview.scheduledAt)}
          </span>
          {interview.locationLink && (
            <a
              href={interview.locationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-semibold hover:underline"
            >
              Join
            </a>
          )}
        </div>
      )}

      {app.notes && (
        <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm text-gray-600 dark:text-slate-300">
          {app.notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {next && (
          <Button size="sm" onClick={() => setStatus(next)}>
            <ArrowUpRight className="h-4 w-4" />
            Move to {getStatusLabel(next)}
          </Button>
        )}
        {app.status === ApplicationStatus.REJECTED ? (
          <Button size="sm" variant="secondary" onClick={() => setStatus(ApplicationStatus.PENDING)}>
            <RotateCcw className="h-3.5 w-3.5" />
            Back to Applied
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setStatus(ApplicationStatus.REJECTED)}>
            <X className="h-3.5 w-3.5" />
            Mark rejected
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        {app.url && (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Job posting
          </a>
        )}
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={!!app.favorite}
          aria-label={app.favorite ? "Unfavorite this application" : "Favorite this application"}
          onClick={() => void onUpdate(app.id, (prev) => ({ ...prev, favorite: !prev.favorite }))}
          className="px-2.5"
        >
          <Star className={`h-4 w-4 ${app.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
        </Button>
      </div>

      <ApplicationForm
        app={app}
        externalOpen={editing}
        onSave={async (application) => {
          // Interviews are edited in the list; don't overwrite them with the form's copy.
          const { interviews: _formCopy, ...fields } = application;
          void _formCopy;
          const saved = await onUpdate(app.id, (prev) => ({ ...prev, ...fields }));
          if (!saved) return false;
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    </div>
  );
};

/** A "+N" bubble opened: the applications in it, to pick one. */
const GroupCard = ({
  apps,
  status,
  onPick,
}: {
  apps: Application[];
  status: ApplicationStatus;
  onPick: (id: string) => void;
}) => (
  <div className="scope-card rounded-[14px] p-4 text-left" style={surface}>
    <div className="flex items-center justify-between gap-3">
      <div className="font-semibold text-gray-900 dark:text-slate-100">
        {apps.length} applications here
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_PILL[status]}`}>
        {getStatusLabel(status)}
      </span>
    </div>
    <ul className="custom-scroll mt-3 flex max-h-[360px] flex-col gap-1 overflow-y-auto">
      {[...apps]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((app) => (
          <li key={app.id}>
            <button
              type="button"
              onClick={() => onPick(app.id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-black/[0.04] focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 dark:hover:bg-white/[0.06]"
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${BLIP_DOT[app.status]}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                  {app.name}
                </span>
                <span className="block truncate text-xs text-gray-500 dark:text-slate-400">
                  {app.position ? `${app.position} · ` : ""}
                  {formatDaysAgo(app.createdAt)}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 dark:text-slate-500" />
            </button>
          </li>
        ))}
    </ul>
  </div>
);

/** How to read the radar, shown until a blip is picked. */
const Legend = ({ empty }: { empty: boolean }) => (
  <div className="rounded-[14px] p-5 text-left text-sm text-gray-600 dark:text-slate-300" style={surface}>
    <div className="font-semibold text-gray-900 dark:text-slate-100">
      {empty ? "Nothing on radar yet" : "Reading the radar"}
    </div>
    {empty ? (
      <p className="mt-1">Add an application and it shows up here as a blip.</p>
    ) : (
      <ul className="mt-2 flex flex-col gap-2">
        <li>
          <span className="font-medium text-gray-900 dark:text-slate-100">Closer to the center</span>{" "}
          — further along: applied, interview, offer.
        </li>
        <li>
          <span className="font-medium text-gray-900 dark:text-slate-100">Clockwise</span> — longer
          since you applied. A blip far round the Applied ring is waiting for a follow-up.
        </li>
        <li className="flex items-center gap-2">
          <span className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute h-5 w-5 rounded-full ring-[1.5px] ring-teal-500/70 dark:ring-teal-300/70" />
            <span className={`h-2 w-2 rounded-full ${BLIP_DOT[ApplicationStatus.INTERVIEW]}`} />
          </span>
          A ring means an interview is coming up.
        </li>
        <li className="flex items-center gap-2">
          <span className={`flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold ${BLIP_DOT[ApplicationStatus.PENDING]} ${GROUP_TEXT[ApplicationStatus.PENDING]}`}>
            3
          </span>
          A number is a few applications too close together; click it to list them.
        </li>
        <li className="text-gray-500 dark:text-slate-400">Click a blip to see it and move it along.</li>
      </ul>
    )}
  </div>
);

/**
 * The applications as a radar: stage by distance, time since applying by angle.
 * Archived ones are left out (like the stats). Search is shared with the list.
 */
export const DashboardRadar = ({
  applications,
  onUpdate,
  search,
  setSearch,
}: {
  applications: Application[];
  onUpdate: Update;
  search: string;
  setSearch: (value: string) => void;
}) => {
  // An application id or a group key.
  const scopeRef = useRef<HTMLDivElement>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<ApplicationStatus>>(new Set());
  const scopeWidth = useWidth(scopeRef, 440);
  // Taken once per render of the list; good enough for "is this interview still ahead".
  const now = Date.now();

  const active = useMemo(() => applications.filter((a) => !a.archived), [applications]);

  // Spacing is in pixels, so a phone-sized scope spreads blips further (in percent).
  const minGap = (BLIP_GAP_PX / scopeWidth) * 100;
  // Laid out over every active application, so searching or hiding a status
  // doesn't move the other blips.
  const positions = useMemo(
    () =>
      layoutBlips(
        active.map((a) => ({ id: a.id, status: a.status, daysAgo: getDaysSince(a.createdAt) })),
        minGap,
      ),
    [active, minGap],
  );

  const needle = search.trim().toLowerCase();
  const matching = needle ? active.filter((a) => a.name.toLowerCase().includes(needle)) : active;
  const visible = matching.filter((a) => !hidden.has(a.status));
  const byId = new Map(visible.map((a) => [a.id, a]));

  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<
    ApplicationStatus,
    number
  >;
  for (const app of matching) counts[app.status] += 1;

  // Blips still too close to click apart become one "+N" bubble.
  const groups = groupBlips(
    visible.map((a) => ({
      id: a.id,
      status: a.status,
      ...(positions.get(a.id) ?? { angle: 0, radius: 0.75 }),
    })),
    (GROUP_WITHIN_PX / scopeWidth) * 100,
  );
  const groupOf = new Map(groups.flatMap((g) => g.ids.map((id) => [id, g] as const)));

  const blips: ScopeBlip[] = groups
    .map((group): ScopeBlip => {
      const members = group.ids.map((id) => byId.get(id)!);
      if (members.length === 1) {
        const [app] = members;
        return {
          id: group.key,
          label: app.name,
          ariaLabel: `${app.name}${app.position ? `, ${app.position}` : ""}: ${getStatusLabel(app.status)}, applied ${formatDaysAgo(app.createdAt).toLowerCase()}`,
          status: app.status,
          angle: group.angle,
          radius: group.radius,
          ping: !!nextInterview(app, now),
          large: !!app.favorite,
        };
      }
      return {
        id: group.key,
        label: `${members.length} applications`,
        ariaLabel: `${members.length} applications, ${getStatusLabel(group.status)}: ${members.map((m) => m.name).join(", ")}`,
        status: group.status,
        angle: group.angle,
        radius: group.radius,
        count: members.length,
        ping: members.some((m) => !!nextInterview(m, now)),
      };
    })
    // Tab goes round the dial.
    .sort((a, b) => a.angle - b.angle);

  const selectedApp = selectedKey ? byId.get(selectedKey) : undefined;
  const selectedGroup = selectedApp
    ? groupOf.get(selectedApp.id)
    : groups.find((g) => g.key === selectedKey);
  const openGroup = selectedGroup && selectedGroup.ids.length > 1 ? selectedGroup : undefined;
  // The blip on the scope that shows the selection (an app inside a group lights up the group).
  const scopeSelected = selectedApp ? groupOf.get(selectedApp.id)?.key ?? null : openGroup?.key ?? null;

  const toggleStatus = (status: ApplicationStatus) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <section
        data-radar-avoid
        aria-label="Applications radar"
        className="flex flex-col items-center gap-4 rounded-[14px] p-4 sm:p-6"
        style={surface}
      >
        <label className="relative w-full max-w-sm">
          <span className="sr-only">Search applications</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications…"
            className="h-10 w-full rounded-full border border-[var(--border-subtle)] bg-black/[0.03] pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 dark:bg-white/[0.05] dark:text-slate-100 dark:placeholder-slate-500"
          />
        </label>

        {/* Room around the scope for the time labels on the rim. */}
        <div ref={scopeRef} className="w-full max-w-[560px] px-7 py-6 sm:px-10 sm:py-8">
          <Scope
            ariaLabel="Your applications on the radar"
            blips={blips}
            selectedId={scopeSelected}
            onSelect={(id) => {
              // Clicking the lit group again while one of its apps is open goes back to the list.
              if (id === null && selectedApp && openGroup) setSelectedKey(openGroup.key);
              else setSelectedKey(id);
            }}
            ticks={TIME_TICKS}
            blipSize={scopeWidth < 360 ? "xs" : blips.length > DENSE_AFTER || scopeWidth < 440 ? "sm" : "md"}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Show statuses">
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

        {needle && matching.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-slate-400">No results for “{search.trim()}”.</p>
        )}
      </section>

      <aside data-radar-avoid className="lg:sticky lg:top-6">
        {selectedApp ? (
          // Remount per application so the edit form starts from its values.
          <SelectedCard
            key={selectedApp.id}
            app={selectedApp}
            now={now}
            onUpdate={onUpdate}
            onBack={openGroup ? () => setSelectedKey(openGroup.key) : undefined}
            groupSize={openGroup?.ids.length}
          />
        ) : openGroup ? (
          <GroupCard
            apps={openGroup.ids.map((id) => byId.get(id)!)}
            status={openGroup.status}
            onPick={setSelectedKey}
          />
        ) : (
          <Legend empty={active.length === 0} />
        )}
      </aside>
    </div>
  );
};
