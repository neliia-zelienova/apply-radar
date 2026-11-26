import { useState, type ReactNode } from "react";
import {
  Archive,
  ArchiveRestore,
  BellRing,
  CalendarClock,
  CalendarPlus,
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  MapPin,
  Pencil,
  PartyPopper,
  Star,
  Trash2,
} from "lucide-react";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  formatDaysAgo,
  getDaysSince,
  getStatusLabel,
  type Application,
  type ApplicationSortField,
  type Interview,
} from "@apply-radar/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "@apply-radar/ui";
import { BLIP_DOT, STATUS_PILL } from "../radar/status-style";
import { ApplicationActions, EditApplicationDialog } from "./application-actions";
import {
  formatFullDate,
  formatWhen,
  nextInterview,
  STALE_AFTER_DAYS,
  type UpdateApplication,
} from "./interviews";
import { useInterviewEditor } from "./use-interview-editor";

/* ---------- Sort menu (in the toolbar) ---------- */

const SORTS = [
  { value: "date:desc", label: "Newest first" },
  { value: "date:asc", label: "Oldest first" },
  { value: "name:asc", label: "Company A–Z" },
  { value: "status:asc", label: "By status" },
  { value: "favorite:desc", label: "Favorites first" },
] as const;

export const SortMenu = ({
  sortBy,
  sortOrder,
  onChange,
}: {
  sortBy: ApplicationSortField;
  sortOrder: "asc" | "desc";
  onChange: (sortBy: ApplicationSortField, sortOrder: "asc" | "desc") => void;
}) => {
  const value = `${sortBy}:${sortOrder}`;
  const current = SORTS.find((s) => s.value === value);
  return (
    <SelectRoot
      value={value}
      onValueChange={(next) => {
        const [by, order] = next.split(":") as [ApplicationSortField, "asc" | "desc"];
        onChange(by, order);
      }}
    >
      <SelectTrigger
        aria-label="Sort applications"
        className="h-10 shrink-0 cursor-pointer gap-2 self-start rounded-full lg:self-auto border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 text-sm font-medium text-gray-700 shadow-sm hover:border-teal-500/40 focus-visible:ring-4 focus-visible:ring-teal-500/20 dark:text-slate-200"
      >
        <span className="text-gray-400 dark:text-slate-500">Sort:</span>
        {current?.label ?? "Custom"}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </SelectTrigger>
      <SelectContent align="end">
        {SORTS.map((s) => (
          <SelectItem key={s.value} value={s.value} className="text-sm">
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

/* ---------- Pieces of a row ---------- */

const Chip = ({
  tone,
  icon,
  title,
  children,
}: {
  tone: "teal" | "amber" | "emerald" | "muted";
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
}) => {
  const tones = {
    teal: "bg-teal-500/10 text-teal-800 dark:text-teal-200",
    amber: "bg-amber-500/12 text-amber-800 dark:text-amber-200",
    emerald: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
    muted: "text-gray-500 dark:text-slate-400",
  };
  return (
    <span
      title={title}
      className={`inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full py-1 text-xs font-medium ${tone === "muted" ? "" : "px-2.5"} ${tones[tone]}`}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
};

/** What's next for this application: an interview, a follow-up, an offer… */
const NextStep = ({ app, now }: { app: Application; now: number }) => {
  if (app.archived) {
    return <Chip tone="muted" icon={<Archive className="h-3.5 w-3.5 shrink-0" />}>Archived</Chip>;
  }
  const interview = nextInterview(app, now);
  if (interview) {
    return (
      <Chip tone="teal" icon={<CalendarClock className="h-3.5 w-3.5 shrink-0" />}>
        {interview.name || "Interview"} · {formatWhen(interview.scheduledAt)}
      </Chip>
    );
  }
  const days = getDaysSince(app.createdAt);
  switch (app.status) {
    case ApplicationStatus.PENDING:
      return days >= STALE_AFTER_DAYS ? (
        <Chip
          tone="amber"
          icon={<BellRing className="h-3.5 w-3.5 shrink-0" />}
          title="No answer yet — consider following up"
        >
          No reply for {days} days
        </Chip>
      ) : (
        <Chip tone="muted">Waiting for a reply</Chip>
      );
    case ApplicationStatus.INTERVIEW: {
      const last = [...(app.interviews ?? [])].sort((a, b) =>
        b.scheduledAt.localeCompare(a.scheduledAt),
      )[0];
      return (
        <Chip tone="muted">
          {last ? `Last interview ${formatDaysAgo(last.scheduledAt).toLowerCase()}` : "No interview scheduled"}
        </Chip>
      );
    }
    case ApplicationStatus.OFFERED:
      return (
        <Chip tone="emerald" icon={<PartyPopper className="h-3.5 w-3.5 shrink-0" />}>
          Offer received
        </Chip>
      );
    default:
      return <Chip tone="muted">Closed</Chip>;
  }
};

/** Status pill that opens a menu to change it. */
const StatusSelect = ({
  app,
  onChange,
}: {
  app: Application;
  onChange: (status: ApplicationStatus) => void;
}) => (
  <SelectRoot value={app.status} onValueChange={(value) => onChange(value as ApplicationStatus)}>
    <SelectTrigger
      aria-label={`Status of ${app.name}: ${getStatusLabel(app.status)}. Change`}
      className={`h-8 cursor-pointer rounded-full pl-2.5 pr-2 text-xs font-semibold ring-1 transition-shadow hover:shadow-[0_0_0_3px_rgba(20,184,166,0.15)] focus-visible:ring-2 ${STATUS_PILL[app.status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${BLIP_DOT[app.status]}`} />
      {getStatusLabel(app.status)}
      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
    </SelectTrigger>
    <SelectContent>
      {APPLICATION_STATUSES.map((status) => (
        <SelectItem key={status} value={status} className="text-sm">
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${BLIP_DOT[status]}`} />
            {getStatusLabel(status)}
          </span>
        </SelectItem>
      ))}
    </SelectContent>
  </SelectRoot>
);

const iconButton =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/[0.05] hover:text-gray-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/25 dark:text-slate-500 dark:hover:bg-white/[0.08] dark:hover:text-slate-200";

const isUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const InterviewItem = ({
  interview,
  past,
  onEdit,
  onDelete,
}: {
  interview: Interview;
  past: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <li
    className={`flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 ${past ? "opacity-70" : "bg-teal-500/[0.05]"}`}
  >
    <CalendarClock className={`mt-0.5 h-4 w-4 shrink-0 ${past ? "text-gray-400" : "text-teal-600 dark:text-teal-300"}`} />
    <div className="min-w-0 flex-1 text-sm">
      <div className="font-semibold text-gray-900 dark:text-slate-100">
        {interview.name || "Interview"}
        {past && <span className="ml-2 text-xs font-normal text-gray-400">Past</span>}
      </div>
      <div className="text-gray-500 dark:text-slate-400">{formatWhen(interview.scheduledAt)}</div>
      {interview.locationLink &&
        (isUrl(interview.locationLink) ? (
          <a
            href={interview.locationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
          >
            <ExternalLink className="h-3 w-3" />
            Join / location
          </a>
        ) : (
          <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
            <MapPin className="h-3 w-3" />
            {interview.locationLink}
          </div>
        ))}
      {interview.notes && (
        <p className="mt-1 whitespace-pre-line text-xs text-gray-600 dark:text-slate-300">{interview.notes}</p>
      )}
    </div>
    <div className="flex shrink-0">
      <button type="button" onClick={onEdit} className={iconButton} aria-label="Edit interview">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className={`${iconButton} hover:text-red-600 dark:hover:text-red-400`}
        aria-label="Delete interview"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  </li>
);

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">
    {children}
  </div>
);

/* ---------- Row ---------- */

const Row = ({
  app,
  now,
  onUpdate,
  onArchive,
  onDelete,
}: {
  app: Application;
  now: number;
  onUpdate: UpdateApplication;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const interviews = useInterviewEditor(app, onUpdate);
  const panelId = `app-panel-${app.id}`;

  // Choosing Interview also offers to add the interview, like the extension.
  const changeStatus = (status: ApplicationStatus) => {
    if (status === app.status) return;
    void onUpdate(app.id, (prev) => ({ ...prev, status }));
    if (status === ApplicationStatus.INTERVIEW) interviews.addInterview();
  };

  const sortedInterviews = [...(app.interviews ?? [])].sort((a, b) =>
    b.scheduledAt.localeCompare(a.scheduledAt),
  );

  return (
    <li
      className={`group rounded-2xl border transition-[border-color,box-shadow] ${
        open
          ? "border-teal-500/30 shadow-lg shadow-teal-900/5 dark:border-teal-400/25"
          : "border-[var(--border-subtle)] hover:border-teal-500/25 hover:shadow-md hover:shadow-slate-900/5"
      } ${app.archived ? "opacity-70" : ""}`}
      style={{ background: "var(--surface-card)" }}
    >
      {/* Phones: name | status | menu, then the next step on its own line. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-1.5 px-3 py-3 sm:px-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_8.5rem_6.5rem_8rem] md:gap-x-3">
        {/* Name: toggles the details */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/25"
        >
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${BLIP_DOT[app.status]}`} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-semibold text-gray-900 dark:text-slate-100">
                {app.name}
              </span>
              {app.favorite && (
                <Star aria-label="Favorite" className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
              )}
            </span>
            {app.position && (
              <span className="block truncate text-sm text-gray-500 dark:text-slate-400">{app.position}</span>
            )}
          </span>
        </button>

        {/* Next step (phone: second line, with the date) */}
        <div className="col-span-3 col-start-1 row-start-2 flex min-w-0 items-center gap-2 pl-[22px] md:col-span-1 md:col-start-auto md:row-start-auto md:pl-0">
          <NextStep app={app} now={now} />
          <span className="shrink-0 text-xs text-gray-400 md:hidden dark:text-slate-500">
            · {formatDaysAgo(app.createdAt)}
          </span>
        </div>

        <div className="col-start-2 row-start-1 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-start">
          <StatusSelect app={app} onChange={changeStatus} />
        </div>

        <div
          className="hidden text-sm tabular-nums text-gray-500 md:block dark:text-slate-400"
          title={`Applied ${formatFullDate(app.createdAt)}`}
        >
          {formatDaysAgo(app.createdAt)}
        </div>

        <div className="col-start-3 row-start-1 flex items-center justify-end md:col-start-auto md:row-start-auto">
          <button
            type="button"
            onClick={() => void onUpdate(app.id, (prev) => ({ ...prev, favorite: !prev.favorite }))}
            aria-pressed={!!app.favorite}
            aria-label={app.favorite ? "Unfavorite this application" : "Favorite this application"}
            // Phones: favorite from the details (the name already shows the star).
            className={`${iconButton} max-md:hidden ${app.favorite ? "" : "md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"}`}
          >
            <Star className={`h-4 w-4 ${app.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
          {app.url && (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open the job posting for ${app.name}`}
              title="Open the job posting"
              className={`${iconButton} max-md:hidden`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label={`Actions for ${app.name}`} className={iconButton}>
                <EllipsisVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              collisionPadding={8}
              className="flex min-w-44 flex-col gap-0.5 rounded-xl border border-black/10 bg-white p-1 text-sm shadow-lg dark:border-white/10 dark:bg-[#0f1829]"
            >
              {[
                { label: "Edit", icon: Pencil, action: () => setEditing(true) },
                { label: "Add interview", icon: CalendarPlus, action: interviews.addInterview },
                app.archived
                  ? { label: "Unarchive", icon: ArchiveRestore, action: () => onArchive(app.id, false) }
                  : { label: "Archive", icon: Archive, action: () => onArchive(app.id, true) },
                { label: "Delete", icon: Trash2, action: () => setConfirmDelete(true), danger: true },
              ].map(({ label, icon: Icon, action, danger }) => (
                <DropdownMenuItem
                  key={label}
                  onSelect={action}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 outline-none data-[highlighted]:bg-black/[0.05] dark:data-[highlighted]:bg-white/[0.07] ${
                    danger ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4 opacity-70" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Hide details" : "Show details"}
            // Phones: the name opens the details.
            className={`${iconButton} max-md:hidden`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div id={panelId} className="scope-card border-t border-[var(--border-subtle)] px-3 pb-4 pt-4 sm:px-4">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center justify-between">
                <SectionLabel>Interviews{sortedInterviews.length ? ` (${sortedInterviews.length})` : ""}</SectionLabel>
                <button
                  type="button"
                  onClick={interviews.addInterview}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Add interview
                </button>
              </div>
              {sortedInterviews.length ? (
                <ul className="flex flex-col gap-2">
                  {sortedInterviews.map((interview) => (
                    <InterviewItem
                      key={interview.id}
                      interview={interview}
                      past={new Date(interview.scheduledAt).getTime() <= now}
                      onEdit={() => interviews.editInterview(interview.id)}
                      onDelete={() => interviews.deleteInterview(interview.id)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400">No interviews yet.</p>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <SectionLabel>Notes</SectionLabel>
              <p className="whitespace-pre-line break-words text-sm text-gray-700 dark:text-slate-300">
                {app.notes || <span className="text-gray-500 dark:text-slate-400">No notes yet.</span>}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Applied {formatFullDate(app.createdAt)}</p>
            </div>
          </div>
          <div className="mt-4">
            <ApplicationActions
              app={app}
              onUpdate={onUpdate}
              onStatusChange={(status) => status === ApplicationStatus.INTERVIEW && interviews.addInterview()}
            />
          </div>
        </div>
      )}

      {interviews.dialogs}
      {editing && <EditApplicationDialog app={app} onUpdate={onUpdate} onClose={() => setEditing(false)} />}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader icon={<Trash2 size={18} />} tone="danger">
            <AlertDialogTitle>Delete {app.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The application and its interviews are removed for good. To just hide it, archive it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="danger" size="sm" onClick={() => onDelete(app.id)}>
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
};

/* ---------- List ---------- */

/** The dashboard's list: one card per application, details open in place. */
export const DashboardList = ({
  applications,
  onUpdate,
  onArchive,
  onDelete,
  emptyMessage,
}: {
  /** Already searched, filtered and sorted. */
  applications: Application[];
  onUpdate: UpdateApplication;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
  emptyMessage: { title: string; hint: string };
}) => {
  // Taken once per render; good enough for "is this interview still ahead".
  const now = Date.now();

  if (applications.length === 0) {
    return (
      <div
        data-radar-avoid
        className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-teal-600/25 px-6 py-14 text-center dark:border-teal-300/20"
      >
        <div className="scope relative h-16 w-16 rounded-full">
          <div className="scope-sweep absolute inset-0 rounded-full" />
        </div>
        <div className="font-semibold text-gray-900 dark:text-slate-100">{emptyMessage.title}</div>
        <p className="text-sm text-gray-500 dark:text-slate-400">{emptyMessage.hint}</p>
      </div>
    );
  }

  return (
    <div data-radar-avoid className="flex flex-col gap-2">
      <div
        aria-hidden
        className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_8.5rem_6.5rem_8rem] gap-x-3 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid dark:text-slate-500"
      >
        <span className="pl-[22px]">Application</span>
        <span>Next step</span>
        <span>Status</span>
        <span>Applied</span>
        <span />
      </div>
      <ul className="flex flex-col gap-2">
        {applications.map((app) => (
          <Row
            key={app.id}
            app={app}
            now={now}
            onUpdate={onUpdate}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};
