import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ApplicationStatus,
  type ApplicationData,
} from "../../types/applications";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "../ui/alert-dialog";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "../ui/select";
import { getStatusLabel } from "../../utils/status";

export const ApplicationForm = ({
  triggerComponent,
  externalOpen,
  app,
  onSave,
  onCancel,
}: {
  externalOpen?: boolean;
  triggerComponent?: React.ReactNode;
  app?: ApplicationData;
  onSave: (app: ApplicationData) => void;
  onCancel?: () => void;
}) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>(
    app?.companyName || ""
  );
  const [position, setPosition] = useState<string>(app?.position || "");
  const [link, setLink] = useState<string>(app?.link || "");
  const [notes, setNotes] = useState<string>(app?.notes || "");
  const [status, setStatus] = useState<ApplicationStatus | undefined>(
    app?.status
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
        notes.trim().length > 0
      );
    }
    return (
      companyName !== app?.companyName ||
      position !== app?.position ||
      link !== app?.link ||
      notes !== app?.notes ||
      status !== app?.status
    );
  }, [companyName, position, link, notes, app, status]);

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
  const isFormValid = isCompanyNameValid && isPositionValid && isLinkValid;

  const allowedStatuses = useMemo(() => {
    if (status !== undefined) {
      return Object.values(ApplicationStatus).filter((s) => {
        return s !== status;
      });
    }
    return [];
  }, [status]);

  console.log("allowedStatuses", allowedStatuses);

  const resetForm = useCallback(() => {
    setCompanyName(app?.companyName || "");
    setPosition(app?.position || "");
    setLink(app?.link || "");
    setNotes(app?.notes || "");
    setTouched({ companyName: false, position: false, link: false });
  }, [app]);

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
                  : "border-white/20"
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
                  : "border-white/20"
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
                    : "border-white/20"
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
                  <SelectTrigger className="p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors w-full text-left">
                    <span className="w-full text-xs font-medium">
                      {getStatusLabel(status)}
                    </span>
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

          {/* Notes */}
          <label className="flex flex-col gap-1 items-start w-full">
            <span className="text-sm">Notes</span>
            <div className="relative w-full p-2 pb-5.5 min-h-24 rounded-md bg-teal-400/10 dark:bg-black/20 border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500">
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
              disabled={!isFormValid}
              onClick={() => {
                // Mark that we're closing intentionally to skip unsaved-check
                skipUnsavedCheckRef.current = true;
                onSave(
                  app
                    ? {
                        ...app,
                        companyName,
                        position,
                        link,
                        notes,
                        status: status || app.status,
                        updatedAt: new Date().toISOString(),
                      }
                    : {
                        id: uuidv4(),
                        companyName,
                        position,
                        link,
                        notes,
                        status: ApplicationStatus.PENDING,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        favorite: false,
                      }
                );
                // Close the form after saving successfully
                setIsFormOpen(false);
                resetForm();
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <AlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            {/* description */}
            <AlertDialogDescription className="text-sm text-gray-600">
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                variant="secondary"
                onClick={() => {
                  // Discard changes: close alert and form, then call onCancel
                  setShowUnsavedChangesDialog(false);
                  setIsFormOpen(false);
                  resetForm();
                  onCancel?.();
                }}
              >
                Discard Changes
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="primary"
                onClick={() => {
                  // Keep editing: simply close the alert and keep the form open
                  setShowUnsavedChangesDialog(false);
                }}
              >
                Keep Editing
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
