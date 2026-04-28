import { useMemo, useState } from "react";
import {
  ApplicationStatus,
  type ApplicationData,
} from "../../types/applications";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "../ui/tooltip";
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
import { ApplicationStatusIcon } from "./applications-status-icon";
import { ApplicationForm } from "./application-form";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "../ui/select";
import { getStatusLabel } from "../../utils/status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { InterviewForm } from "./interview-form";
import { InterviewCard } from "./interview-card";
import { useThemeContext } from "../../context/theme-context";

interface ApplicationItemProps {
  app: ApplicationData;
  deleteApp?: (id: string) => void;
  updateApp?: (
    id: string,
    updater: (app: ApplicationData) => ApplicationData,
  ) => void;
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

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

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

  const menuOptions = [
    {
      label: "Edit",
      icon: <Pencil />,
      action: () => setEditMode(true),
    },
    ...(app.status === ApplicationStatus.INTERVIEW
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px 80px 36px 72px",
            gap: "8px",
            alignItems: "center",
            padding: "10px 10px 10px 12px",
          }}
        >
          {/* Company + Position */}
          <div style={{ minWidth: 0 }} className="flex flex-col items-start">
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
              title={app?.companyName}
            >
              {app?.companyName}
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
          <div style={{ justifySelf: "start" }}>
            <SelectRoot onValueChange={handleStatusChange}>
              <SelectTrigger
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px 4px 6px",
                  borderRadius: "9999px",
                  border: `1px solid ${colors.border}55`,
                  background: dark ? colors.bgDark : colors.bgLight,
                  color: dark ? colors.textDark : colors.textLight,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 0 0 3px ${colors.ring}`;
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
            className="text-gray-400 dark:text-slate-600"
            style={{
              fontSize: "11px",
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatDate(app.createdAt)}
          </div>

          {/* Favorite */}
          <TooltipRoot>
            <TooltipTrigger asChild>
              <button
                onClick={toggleFavorite}
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
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <TooltipRoot>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setMoreInfo((e) => !e)}
                  className="text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/40 transition-colors"
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
                  href={app?.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/40 transition-colors"
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

            <ItemContextMenu options={menuOptions} itemId={app?.id ?? ""} />
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
            {app.status === ApplicationStatus.INTERVIEW && (
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
                </div>
                {app.interviews && app.interviews.length > 0 ? (
                  <ul
                    className="flex flex-col gap-2"
                    style={{ padding: 0, margin: 0 }}
                  >
                    {[...app.interviews]
                      .sort(
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime(),
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
        onSave={(interview) => {
          updateApp &&
            updateApp(app.id, (prevApp) => {
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
          <AlertDialogHeader>
            <AlertDialogTitle>Delete interview?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <button
                className="px-3 py-2 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm"
                onClick={() => setDeleteConfirm({ open: false })}
              >
                Cancel
              </button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <button
                className="px-3 py-2 rounded-md bg-red-600 text-white text-sm"
                onClick={() => {
                  if (deleteConfirm.interviewId) {
                    updateApp &&
                      updateApp(app.id, (prevApp) => ({
                        ...prevApp,
                        interviews: (prevApp.interviews || []).filter(
                          (i) => i.id !== deleteConfirm.interviewId,
                        ),
                      }));
                    chrome.runtime.sendMessage({
                      type: "cancelInterviewAlarm",
                      interviewId: deleteConfirm.interviewId,
                    });
                  }
                  setDeleteConfirm({ open: false });
                }}
              >
                Delete
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ApplicationForm
        app={app}
        externalOpen={editMode}
        onSave={(application) => {
          updateApp &&
            updateApp(app.id, (prevApp) => ({ ...prevApp, ...application }));
          setEditMode(false);
        }}
        onCancel={() => setEditMode(false)}
      />
    </div>
  );
};
