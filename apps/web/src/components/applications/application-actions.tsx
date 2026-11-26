import { useState, type ReactNode } from "react";
import { ArrowUpRight, ExternalLink, Pencil, RotateCcw, Star, X } from "lucide-react";
import { ApplicationStatus, getStatusLabel, type Application } from "@apply-radar/shared";
import { ApplicationForm, Button, buttonClasses } from "@apply-radar/ui";
import { NEXT_STATUS } from "../radar/bands";
import type { UpdateApplication } from "./interviews";

/**
 * The edit form, open while mounted (mount it only while editing, so it always
 * starts from the current values).
 */
export const EditApplicationDialog = ({
  app,
  onUpdate,
  onClose,
}: {
  app: Application;
  onUpdate: UpdateApplication;
  onClose: () => void;
}) => (
  <ApplicationForm
    app={app}
    externalOpen
    onSave={async (application) => {
      // Interviews are saved on their own; don't overwrite them with the form's copy.
      const { interviews: _formCopy, ...fields } = application;
      void _formCopy;
      const saved = await onUpdate(app.id, (prev) => ({ ...prev, ...fields }));
      if (!saved) return false;
      onClose();
    }}
    onCancel={onClose}
  />
);

/**
 * The actions on one application, the same in the radar card and the list:
 * move a stage, reject / reopen, edit, job posting, favorite.
 * `onStatusChange` runs after a status change is sent (e.g. to offer adding an interview).
 */
export const ApplicationActions = ({
  app,
  onUpdate,
  onStatusChange,
  children,
}: {
  app: Application;
  onUpdate: UpdateApplication;
  onStatusChange?: (status: ApplicationStatus) => void;
  /** Extra buttons, after Edit. */
  children?: ReactNode;
}) => {
  const [editing, setEditing] = useState(false);
  const next = NEXT_STATUS[app.status];
  const setStatus = (status: ApplicationStatus) => {
    void onUpdate(app.id, (prev) => ({ ...prev, status }));
    onStatusChange?.(status);
  };

  return (
    <div className="flex flex-wrap gap-2">
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
      {children}
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

      {editing && (
        <EditApplicationDialog app={app} onUpdate={onUpdate} onClose={() => setEditing(false)} />
      )}
    </div>
  );
};
