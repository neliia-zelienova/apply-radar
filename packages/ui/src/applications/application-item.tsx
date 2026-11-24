import { useMemo, useState } from "react";
import {
  ApplicationStatus,
  type Application,
  getStatusLabel,
  formatDaysAgo,
  getDaysSince,
} from "@apply-radar/shared";
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from "../tooltip";
import { ApplicationStatusIcon } from "../application-status-icon";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger } from "../select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../alert-dialog";
import { Button } from "../button";
import { ItemContextMenu } from "./item-context-menu";
import {
  Archive,
  ChevronDown,
  ExternalLink,
  MessagesSquare,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { ApplicationForm } from "./application-form";
import { InterviewForm } from "./interview-form";
import { InterviewCard } from "./interview-card";
import { useThemeContext } from "../context/theme-context";

interface ApplicationItemProps {
  app: Application;
  deleteApp?: (id: string) => void;
  /** Resolves false when the save failed (the edit forms then stay open). */
  updateApp?: (
    id: string,
    updater: (app: Application) => Application,
  ) => Promise<boolean> | void;
  archiveApp?: (id: string) => void;
}

const STATUS_COLORS: Record<
  ApplicationStatus,
  {
    border: string;
    bgLight: string;
    bgDark: string;
    ring: string;
    textLight: string;
    textDark: string;
  }
> = {
  [ApplicationStatus.PENDING]: {
    border: "#ca8a04",
    bgLight: "rgba(250,204,21,0.08)",
    bgDark: "rgba(202,138,4,0.18)",
    ring: "rgba(250,204,21,0.3)",
    textLight: "#854d0e",
    textDark: "#fde047",
  },
  [ApplicationStatus.INTERVIEW]: {
    border: "#0d9488",
    bgLight: "rgba(0,255,180,0.08)",
    bgDark: "rgba(13,148,136,0.18)",
    ring: "rgba(0,255,180,0.3)",
    textLight: "#134e4a",
    textDark: "#5eead4",
  },
  [ApplicationStatus.OFFERED]: {
    border: "#10b981",
    bgLight: "rgba(16,185,129,0.08)",
    bgDark: "rgba(16,185,129,0.18)",
    ring: "rgba(16,185,129,0.3)",
    textLight: "#064e3b",
    textDark: "#6ee7b7",
  },
  [ApplicationStatus.REJECTED]: {
    border: "#dc2626",
    bgLight: "rgba(255,60,60,0.08)",
    bgDark: "rgba(220,38,38,0.18)",
    ring: "rgba(255,60,60,0.3)",
    textLight: "#7f1d1d",
    textDark: "#fca5a5",
  },
};

/** A pending application with no answer for this many days gets the "stale" pill. */
const STALE_PENDING_AFTER_DAYS = 7;

/** Amber — a warmer step from the pending yellow, still far from rejected red. Status pill only. */
const STALE_PENDING_COLORS: (typeof STATUS_COLORS)[ApplicationStatus] = {
  border: "#d97706",
  bgLight: "rgba(245,158,11,0.10)",
  bgDark: "rgba(217,119,6,0.20)",
  ring: "rgba(245,158,11,0.3)",
  textLight: "#92400e",
  textDark: "#fbbf24",
};

const formatFullDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const ApplicationItem = ({
  app,
  deleteApp,
  updateApp,
  archiveApp,
}: ApplicationItemProps) => {
  const [editMode, setEditMode] = useState<boolean>(app === undefined);
  const [moreInfo, setMoreInfo] = useState<boolean>(false);
  const [hovered, setHovered] = useState(false);

  const [interviewFormOpen, setInterviewFormOpen] = useState<boolean>(false);
  const [interviewIdToEdit, setInterviewIdToEdit] = useState<string | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    interviewId?: string;
  }>({ open: false });

  const { theme } = useThemeContext();
  const dark = theme === "dark";

  const colors =
    STATUS_COLORS[app.status] ?? STATUS_COLORS[ApplicationStatus.PENDING];

  const daysSinceApplied = getDaysSince(app.createdAt);
  const isStalePending =
    app.status === ApplicationStatus.PENDING &&
    daysSinceApplied >= STALE_PENDING_AFTER_DAYS;
  // The card keeps its status colors; only the status pill turns orange.
  const pillColors = isStalePending ? STALE_PENDING_COLORS : colors;

  const isInterviewing = app.status === ApplicationStatus.INTERVIEW;
  // Past interviews stay visible after the status moves on (e.g. rejected or offered).
  const showInterviews = isInterviewing || (app.interviews?.length ?? 0) > 0;

  const menuOptions = [
    {
      label: "Edit",
      icon: <Pencil />,
      action: () => setEditMode(true),
    },
    ...(isInterviewing
      ? [
          {
            label: "Add interview",
            icon: <MessagesSquare />,
            action: () => setInterviewFormOpen(true),
          },
        ]
      : []),
    {
      label: "Archive",
      icon: <Archive />,
      action: (itemId: string) => archiveApp && archiveApp(itemId),
      muted: true,
    },
    {
      label: "Delete",
      icon: <Trash2 />,
      action: (itemId: string) => deleteApp && deleteApp(itemId),
      danger: true,
    },
  ];

  const handleStatusChange = (value: string) => {
    if (value === ApplicationStatus.INTERVIEW) {
      setInterviewFormOpen(true);
    }
    updateApp &&
      updateApp(app.id, (prevApp) => ({
        ...prevApp,
        status: value as ApplicationStatus,
      }));
  };

  const handleEditInterview = (id: string) => {
    setInterviewIdToEdit(id);
    setInterviewFormOpen(true);
  };

  const handleDeleteInterview = (id: string) => {
    setDeleteConfirm({
      open: true,
      interviewId: id,
    });
  };

  const toggleFavorite = () => {
    updateApp &&
      updateApp(app.id, (prevApp) => ({
        ...prevApp,
        favorite: !prevApp.favorite,
      }));
  };

  const allowedStatuses = useMemo(() => {
    return Object.values(ApplicationStatus).filter((status) => {
      return status !== app.status;
    });
  }, [app.status]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "8px",
        border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
        borderLeft: `3px solid ${hovered ? colors.border : colors.border + "88"}`,
        background: hovered
          ? dark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.02)"
          : "transparent",
        transition: "all 0.18s ease",
        overflow: "hidden",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <TooltipProvider>
        {/* Main row */}
        {/* Columns from .app-grid (styles.css): one line, or two when the list is narrow */}
        <div
          className="app-grid"
          style={{
            alignItems: "center",
            padding: "10px 10px 10px 12px",
          }}
        >
          {/* Company + Position */}
          <div style={{ minWidth: 0 }} className="app-cell-name flex flex-col items-start">
            <div
              className="text-gray-900 dark:text-white/90"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={app.name}
            >
              {app.name}
            </div>
            <div
              className="text-gray-400 dark:text-slate-500"
              style={{
                fontSize: "11px",
                marginTop: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={app?.position}
            >
              {app?.position}
            </div>
          </div>

          {/* Status pill — wrapped in div so the button isn't a direct grid item (prevents 140px stretch) */}
          <div className="app-cell-status" style={{ justifySelf: "start" }}>
            <SelectRoot onValueChange={handleStatusChange}>
              <SelectTrigger
                title={
                  isStalePending
                    ? `No response for ${daysSinceApplied} days — consider following up`
                    : undefined
                }
                style={{
                  ...(isStalePending && {
                    // Recolors the radar icon inside the pill (it reads these CSS variables).
                    "--radar-pending": "rgba(245,158,11,0.2)",
                    "--glow-pending": "rgba(245,158,11,0.3)",
                    "--radar-pending-sweep": "rgba(245,158,11,0.5)",
                  }),
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px 4px 6px",
                  borderRadius: "9999px",
                  border: `1px solid ${pillColors.border}55`,
                  background: dark ? pillColors.bgDark : pillColors.bgLight,
                  color: dark ? pillColors.textDark : pillColors.textLight,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 0 0 3px ${pillColors.ring}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <ApplicationStatusIcon status={app?.status} />
                <span>{getStatusLabel(app?.status)}</span>
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((status) => (
                  <SelectItem
                    key={`${app.id}-status-option-${status}`}
                    value={status}
                  >
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          {/* Date */}
          <div
            className="app-cell-date text-gray-400 dark:text-slate-600"
            style={{
              fontSize: "11px",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
            title={`Applied ${formatFullDate(app.createdAt)}`}
          >
            {formatDaysAgo(app.createdAt)}
          </div>

          {/* Favorite */}
          <TooltipRoot>
            <TooltipTrigger asChild>
              <button
                onClick={toggleFavorite}
                className="app-cell-fav"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                aria-label={
                  app?.favorite
                    ? "Unfavorite this application"
                    : "Favorite this application"
                }
              >
                <Star
                  className={`h-4 w-4 ${
                    app?.favorite
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 dark:text-white/25 hover:text-amber-300 transition-colors"
                  }`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent align="center">
              {app?.favorite ? "Unfavorite" : "Favorite"} this application
            </TooltipContent>
          </TooltipRoot>

          {/* Actions: expand + link + context menu */}
          <div className="app-cell-actions" style={{ alignItems: "center", gap: "2px" }}>
            <TooltipRoot>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setMoreInfo((e) => !e)}
                  className="app-cell-expand text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/40 transition-colors"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={moreInfo ? "Hide more info" : "Show more info"}
                >
                  <ChevronDown
                    className="h-3.5 w-3.5"
                    style={{
                      transform: moreInfo ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent align="center">
                {moreInfo ? "Hide more info" : "Show more info"}
              </TooltipContent>
            </TooltipRoot>

            <TooltipRoot>
              <TooltipTrigger asChild>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-cell-link text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/40 transition-colors"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                    borderRadius: "6px",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent align="center">
                Open application link
              </TooltipContent>
            </TooltipRoot>

            <ItemContextMenu options={menuOptions} itemId={app?.id ?? ""} label={`Actions for ${app.name}`} className="app-cell-more" />
          </div>
        </div>

        {/* Expanded notes */}
        {moreInfo && (
          <div
            style={{
              padding: "10px 14px 12px",
              borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              background: dark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.02)",
            }}
          >
            {showInterviews && (
              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#14b8a6",
                    }}
                  >
                    Interviews{" "}
                    {app.interviews?.length ? `(${app.interviews.length})` : ""}
                  </span>
                  {isInterviewing && (
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "11px",
                        color: "#14b8a6",
                        fontWeight: 600,
                        padding: 0,
                        fontFamily: "Roboto, sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.textDecoration =
                          "underline";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.textDecoration =
                          "none";
                      }}
                      onClick={() => setInterviewFormOpen(true)}
                    >
                      + Add interview
                    </button>
                  )}
                </div>
                {app.interviews && app.interviews.length > 0 ? (
                  <ul
                    className="flex flex-col gap-2"
                    style={{ padding: 0, margin: 0 }}
                  >
                    {[...app.interviews]
                      .sort(
                        (a, b) =>
                          new Date(a.scheduledAt).getTime() -
                          new Date(b.scheduledAt).getTime(),
                      )
                      .map((iv) => (
                        <InterviewCard
                          key={iv.id}
                          interview={iv}
                          handleEdit={handleEditInterview}
                          handleDelete={handleDeleteInterview}
                        />
                      ))}
                  </ul>
                ) : (
                  <div
                    style={{
                      fontSize: "12px",
                      color: dark ? "#334155" : "#94a3b8",
                      fontStyle: "italic",
                    }}
                  >
                    No interviews scheduled yet.
                  </div>
                )}
              </div>
            )}

            <div>
              <div
                className="text-gray-400 dark:text-slate-600"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Notes
              </div>
              <div
                className="text-gray-600 dark:text-slate-400"
                style={{ fontSize: "12px", lineHeight: 1.6 }}
              >
                {app.notes || "No notes added yet."}
              </div>
            </div>
          </div>
        )}
      </TooltipProvider>

      {/* Interview form */}
      <InterviewForm
        externalOpen={interviewFormOpen}
        initialInterview={
          interviewIdToEdit
            ? (app.interviews || []).find((i) => i.id === interviewIdToEdit)
            : undefined
        }
        onSave={async (interview) => {
          if (!updateApp) return false;
          const saved = await updateApp(app.id, (prevApp) => {
              const list = prevApp.interviews || [];
              const exists = list.findIndex((i) => i.id === interview.id);
              const newList =
                exists >= 0
                  ? list.map((i) => (i.id === interview.id ? interview : i))
                  : [...list, interview];
              return {
                ...prevApp,
                interviews: newList,
              };
            });
          if (saved === false) return false;
          setInterviewFormOpen(false);
          setInterviewIdToEdit(null);
        }}
        onCancel={() => {
          setInterviewFormOpen(false);
          setInterviewIdToEdit(null);
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((d) => ({ ...d, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader icon={<Trash2 size={18} />} tone="danger">
            <AlertDialogTitle>Delete interview?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (deleteConfirm.interviewId) {
                    updateApp &&
                      updateApp(app.id, (prevApp) => ({
                        ...prevApp,
                        interviews: (prevApp.interviews || []).filter(
                          (i) => i.id !== deleteConfirm.interviewId,
                        ),
                      }));
                  }
                  setDeleteConfirm({ open: false });
                }}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ApplicationForm
        app={app}
        externalOpen={editMode}
        onSave={async (application) => {
          if (!updateApp) return false;
          // Interviews are edited separately; don't overwrite them with the form's copy.
          const { interviews: _formCopy, ...fields } = application;
          void _formCopy;
          const saved = await updateApp(app.id, (prevApp) => ({ ...prevApp, ...fields }));
          if (saved === false) return false;
          setEditMode(false);
        }}
        onCancel={() => setEditMode(false)}
      />
    </div>
  );
};
