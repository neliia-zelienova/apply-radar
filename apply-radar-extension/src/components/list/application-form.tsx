import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ApplicationStatus,
  type ApplicationData,
} from "../../types/applications";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import {
  Dialog,
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
} from "../ui/alert-dialog";

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
      notes !== app?.notes
    );
  }, [companyName, position, link, notes, app]);

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

  const resetForm = () => {
    setCompanyName(app?.companyName || "");
    setPosition(app?.position || "");
    setLink(app?.link || "");
    setNotes(app?.notes || "");
    setTouched({ companyName: false, position: false, link: false });
  };

  const attemptCloseForm = useCallback(() => {
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
  }, [isChanged, onCancel, resetForm]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        hasOpenedRef.current = true;
        setIsFormOpen(true);
        return;
      }
      // Only treat false as a close attempt if the dialog has been opened before
      if (hasOpenedRef.current) {
        attemptCloseForm();
      } else {
        // Initial closed state; ensure it's closed without triggering alerts
        setIsFormOpen(false);
        resetForm();
      }
    },
    [attemptCloseForm]
  );

  useEffect(() => {
    if (externalOpen !== undefined) {
      if (externalOpen) {
        hasOpenedRef.current = true;
        setIsFormOpen(true);
      } else {
        attemptCloseForm();
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
          <DialogTitle>
            <h3 className="text-lg font-semibold">
              {app ? "Edit application" : "Add new application"}
            </h3>
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
                setTouched((t) => ({ ...t, name: true }));
                setCompanyName(e.target.value);
              }}
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
                setTouched((t) => ({ ...t, position: true }));
                setPosition(e.target.value);
              }}
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
            {app && (
              <label className="flex flex-col gap-1 items-start w-full">
                <span className="text-sm">Status</span>
                <select
                  aria-label="Application Status"
                  value={app?.status || ApplicationStatus.PENDING}
                  disabled
                  className="w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors cursor-not-allowed"
                >
                  <option value={ApplicationStatus.PENDING}>Pending</option>
                  <option value={ApplicationStatus.INTERVIEW}>
                    Interviewing
                  </option>
                  <option value={ApplicationStatus.OFFERED}>Offer</option>
                  <option value={ApplicationStatus.REJECTED}>Rejected</option>
                </select>
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
            <Button
              aria-label="Cancel"
              variant="secondary"
              size="md"
              onClick={attemptCloseForm}
            >
              Cancel
            </Button>
            <Button
              aria-label="Save"
              variant="primary"
              size="md"
              disabled={!isFormValid}
              onClick={() => {
                onSave(
                  app
                    ? {
                        ...app,
                        companyName,
                        position,
                        link,
                        notes,
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
            <p className="text-sm text-gray-600">
              You have unsaved changes. Are you sure you want to discard them?
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
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
            </AlertDialogAction>
            <AlertDialogCancel asChild>
              <Button
                variant="primary"
                onClick={() => {
                  // Keep editing: simply close the alert and keep the form open
                  setShowUnsavedChangesDialog(false);
                }}
              >
                Keep Editing
              </Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
