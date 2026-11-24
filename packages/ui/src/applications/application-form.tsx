import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import {
  ApplicationStatus,
  type Application,
  getStatusLabel,
  fromDateInputValue,
  toDateInputValue,
} from "@apply-radar/shared";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../dialog";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogDescription } from "../alert-dialog";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger } from "../select";
import type { SaveResult } from "./save-result";

export const ApplicationForm = ({
  triggerComponent,
  externalOpen,
  app,
  draft,
  notice,
  onSave,
  onCancel,
}: {
  externalOpen?: boolean;
  triggerComponent?: React.ReactNode;
  app?: Application;
  /** Initial values when adding (e.g. read from a job posting page). Ignored with `app`. */
  draft?: Partial<Pick<Application, "name" | "position" | "url" | "notes">>;
  /** Shown above the fields, e.g. where the draft came from. */
  notice?: React.ReactNode;
  /**
   * May be async. The form closes when it's done, unless it returns/resolves
   * `false` (save failed): then the form stays open with the draft intact.
   */
  onSave: (app: Application) => SaveResult;
  onCancel?: () => void;
}) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  // Editing starts from the application, adding from the optional draft.
  const source = app ?? draft;
  // Form fields keep their UI names; they map to Application.name / Application.url.
  const [companyName, setCompanyName] = useState<string>(source?.name || "");
  const [position, setPosition] = useState<string>(source?.position || "");
  const [link, setLink] = useState<string>(source?.url || "");
  const [notes, setNotes] = useState<string>(source?.notes || "");
  const [status, setStatus] = useState<ApplicationStatus | undefined>(
    app?.status
  );
  const [appliedDate, setAppliedDate] = useState<string>(
    toDateInputValue(app?.createdAt ?? new Date())
  );
  const [touched, setTouched] = useState<{
    companyName: boolean;
    position: boolean;
    link: boolean;
  }>({
    companyName: false,
    position: false,
    link: false,
  });
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
    useState<boolean>(false);
  const hasOpenedRef = useRef<boolean>(false);
  // When true, bypass the unsaved-changes confirmation on close (e.g., after Save)
  const skipUnsavedCheckRef = useRef<boolean>(false);
  const isChanged = useMemo(() => {
    if (!app) {
      return (
        companyName.trim().length > 0 ||
        position.trim().length > 0 ||
        link.trim().length > 0 ||
        notes.trim().length > 0 ||
        appliedDate !== toDateInputValue(new Date())
      );
    }
    return (
      // position/notes are optional on Application; the form treats "missing" as "".
      companyName !== app.name ||
      position !== (app.position ?? "") ||
      link !== app.url ||
      notes !== (app.notes ?? "") ||
      status !== app?.status ||
      appliedDate !== toDateInputValue(app.createdAt)
    );
  }, [companyName, position, link, notes, app, status, appliedDate]);

  // Simple validators
  const isCompanyNameValid = companyName.trim().length > 1;
  const isPositionValid = position.trim().length > 1;
  const isLinkValid =
    !link ||
    /^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+[\w\-._~:\/?#\[\]@!$&'()*+,;=]*$/.test(
      link.trim()
    );
  const notesLimit = 500;
  const notesCount = notes.length;
  const todayInputValue = toDateInputValue(new Date());
  // `YYYY-MM-DD` strings compare correctly as plain strings.
  const isAppliedDateValid =
    appliedDate.length > 0 && appliedDate <= todayInputValue;
  const isFormValid =
    isCompanyNameValid && isPositionValid && isLinkValid && isAppliedDateValid;

  const allowedStatuses = useMemo(() => {
    if (status !== undefined) {
      return Object.values(ApplicationStatus).filter((s) => {
        return s !== status;
      });
    }
    return [];
  }, [status]);

  const resetForm = useCallback(() => {
    setCompanyName(source?.name || "");
    setPosition(source?.position || "");
    setLink(source?.url || "");
    setNotes(source?.notes || "");
    setAppliedDate(toDateInputValue(app?.createdAt ?? new Date()));
    setTouched({ companyName: false, position: false, link: false });
    setSaveFailed(false);
  }, [app, source]);

  const handleCloseWithUnsavedCheck = useCallback(() => {
    // When attempting to close the form, check for unsaved changes
    if (isChanged) {
      setShowUnsavedChangesDialog(true);
      // Keep the form open while user decides
      setIsFormOpen(true);
    } else {
      setIsFormOpen(false);
      resetForm();
      onCancel?.();
    }
  }, [isChanged, onCancel, resetForm, setIsFormOpen]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        hasOpenedRef.current = true;
        setIsFormOpen(true);
        return;
      }
      // Only treat false as a close attempt if the dialog has been opened before
      if (hasOpenedRef.current) {
        // If we intentionally closed (e.g., Save), bypass the unsaved-check dialog
        if (skipUnsavedCheckRef.current) {
          skipUnsavedCheckRef.current = false;
          setIsFormOpen(false);
          resetForm();
        } else {
          handleCloseWithUnsavedCheck();
        }
      } else {
        // Initial closed state; ensure it's closed without triggering alerts
        setIsFormOpen(false);
        resetForm();
      }
    },
    [handleCloseWithUnsavedCheck, resetForm]
  );

  useEffect(() => {
    if (externalOpen !== undefined) {
      if (externalOpen) {
        hasOpenedRef.current = true;
        setIsFormOpen(true);
      } else {
        // If closing is triggered externally right after a Save, bypass alert
        if (skipUnsavedCheckRef.current) {
          skipUnsavedCheckRef.current = false;
          setIsFormOpen(false);
          resetForm();
        } else {
          handleCloseWithUnsavedCheck();
        }
      }
    }
  }, [externalOpen]);

  return (
    <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
      {triggerComponent && (
        <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      )}
      <DialogContent>
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {app ? "Edit application" : "Add new application"}
          </DialogTitle>
          {/* Remove implicit close to control explicitly */}
        </DialogHeader>
        {notice && (
          <div className="mb-1 rounded-md border border-teal-500/25 bg-teal-500/5 px-3 py-2 text-left text-xs text-gray-600 dark:text-slate-300">
            {notice}
          </div>
        )}
        {/* Fields */}
        <div className="grid grid-cols-1 gap-3 w-full">
          {/* Company Name */}
          <label className="flex flex-col items-start w-full gap-1">
            <span className="text-sm">Company Name</span>
            <input
              type="text"
              aria-label="Company Name"
              placeholder="e.g. Google"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
              }}
              onBlur={() => setTouched((t) => ({ ...t, companyName: true }))}
              className={`w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                !isCompanyNameValid && touched.companyName
                  ? "border-red-500"
                  : "border-black/15 dark:border-white/20"
              }`}
            />
            {!isCompanyNameValid && touched.companyName && (
              <span role="alert" className="text-xs text-red-400">
                Please enter at least 2 characters
              </span>
            )}
          </label>
          {/** Position */}
          <label className="flex flex-col items-start w-full gap-1">
            <span className="text-sm">Position</span>
            <input
              type="text"
              aria-label="Position"
              placeholder="e.g. QA Engineer"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
              }}
              onBlur={() => setTouched((t) => ({ ...t, position: true }))}
              className={`w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                !isPositionValid && touched.position
                  ? "border-red-500"
                  : "border-black/15 dark:border-white/20"
              }`}
            />
            {!isPositionValid && touched.position && (
              <span role="alert" className="text-xs text-red-400">
                Please enter at least 2 characters
              </span>
            )}
          </label>

          <div className="grid grid-cols-3 gap-3 w-full">
            {/* Link */}
            <label
              className={`flex flex-col gap-1 items-start w-full ${
                app ? "col-span-2" : "col-span-3"
              }`}
            >
              <span className="text-sm">Link (optional)</span>
              <input
                type="url"
                aria-label="Application Link"
                placeholder="https://company.com/careers/job"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, link: true }))}
                className={`w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  !isLinkValid && touched.link
                    ? "border-red-500"
                    : "border-black/15 dark:border-white/20"
                }`}
              />
              <div className="flex items-center justify-between">
                {!isLinkValid && touched.link && (
                  <span role="alert" className="text-xs text-red-400">
                    Enter a valid URL (starts with https://) or leave blank.
                  </span>
                )}
                {link && isLinkValid && (
                  <a
                    href={link.startsWith("http") ? link : `https://${link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-400 hover:underline"
                  >
                    Preview link
                  </a>
                )}
              </div>
            </label>
            {app && status && (
              <label className="flex flex-col col-span-1 gap-1 items-start w-full">
                <span className="text-sm">Status</span>
                <SelectRoot
                  onValueChange={(value) => {
                    setStatus(value as ApplicationStatus);
                  }}
                >
                  {/* Same border, text size and height as the inputs next to it. */}
                  <SelectTrigger className="p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border border-black/15 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors w-full text-left cursor-pointer">
                    <span className="w-full truncate">{getStatusLabel(status)}</span>
                    <ChevronDown aria-hidden className="h-4 w-4 shrink-0 opacity-60" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStatuses.map((status) => (
                      <SelectItem
                        key={`app-form-${app.id}-status-option-${status}`}
                        value={status}
                      >
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </label>
            )}
          </div>

          {/* Applied date */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <label className="flex flex-col gap-1 items-start w-full col-span-1">
              <span className="text-sm">Applied on</span>
              <input
                type="date"
                aria-label="Applied on"
                value={appliedDate}
                max={todayInputValue}
                onChange={(e) => setAppliedDate(e.target.value)}
                className={`w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors font-roboto ${
                  isAppliedDateValid ? "border-black/15 dark:border-white/20" : "border-red-500"
                }`}
              />
              {!isAppliedDateValid && (
                <span role="alert" className="text-xs text-red-400">
                  Pick a date that isn't in the future.
                </span>
              )}
            </label>
          </div>

          {/* Notes */}
          <label className="flex flex-col gap-1 items-start w-full">
            <span className="text-sm">Notes</span>
            <div className="relative w-full p-2 pb-5.5 min-h-24 rounded-md bg-teal-400/10 dark:bg-black/20 border border-black/15 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <textarea
                aria-label="Application Notes"
                placeholder="Add quick notes (e.g. referral, contact, next steps...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, notesLimit))}
                className="h-[90%] resize-none w-full focus:outline-none bg-transparent"
              />
              <div className="absolute bottom-1 right-1 flex items-center justify-between text-xs text-gray-500 dark:text-white/60">
                <span>
                  {notesCount}/{notesLimit}
                </span>
              </div>
            </div>
          </label>
        </div>
        {saveFailed && (
          <p role="alert" className="text-left text-sm text-red-600 dark:text-red-400">
            Couldn't save. Your changes are still here, so you can try again.
          </p>
        )}
        <DialogFooter>
          {/* Actions */}
          <div className="flex flex-row gap-2 justify-end pt-1">
            <DialogClose asChild>
              <Button
                aria-label="Cancel"
                variant="secondary"
                size="md"
                onClick={handleCloseWithUnsavedCheck}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              aria-label="Save"
              variant="primary"
              size="md"
              disabled={!isFormValid || isSaving}
              onClick={async () => {
                const nowIso = new Date().toISOString();
                setIsSaving(true);
                setSaveFailed(false);
                const saved = await onSave(
                  app
                    ? {
                        ...app,
                        name: companyName,
                        position,
                        url: link,
                        notes,
                        status: status || app.status,
                        createdAt: fromDateInputValue(appliedDate, app.createdAt),
                        updatedAt: nowIso,
                      }
                    : {
                        id: uuidv4(),
                        name: companyName,
                        position,
                        url: link,
                        notes,
                        status: ApplicationStatus.PENDING,
                        archived: false,
                        // Today keeps the current time; a past day is stored as local midnight.
                        createdAt: fromDateInputValue(appliedDate, nowIso),
                        updatedAt: nowIso,
                        favorite: false,
                      }
                );
                setIsSaving(false);
                if (saved === false) {
                  // Keep the form open with the draft so the user can retry.
                  setSaveFailed(true);
                  return;
                }
                // A parent that controls `externalOpen` closes it next; skip the
                // unsaved-changes check for that close only.
                skipUnsavedCheckRef.current = externalOpen !== undefined;
                setIsFormOpen(false);
                resetForm();
              }}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <AlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader icon={<TriangleAlert size={20} />} tone="warning">
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits to this application haven't been saved and will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setShowUnsavedChangesDialog(false);
                  setIsFormOpen(false);
                  resetForm();
                  onCancel?.();
                }}
              >
                Discard
              </Button>
            </AlertDialogAction>
            {/* Cancel = the safe choice, on the right: it gets focus first and Escape picks it. */}
            <AlertDialogCancel asChild>
              <Button variant="secondary" size="sm">
                Keep editing
              </Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
