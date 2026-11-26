import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../button";
import { Field, Input, Textarea } from "../field";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../dialog";
import { type Interview } from "@apply-radar/shared";
import type { SaveResult } from "./save-result";

interface InterviewFormProps {
  triggerComponent?: React.ReactNode;
  externalOpen?: boolean;
  /** May be async; resolving `false` keeps the form open with the draft. */
  onSave: (interview: Interview) => SaveResult;
  onCancel?: () => void;
  initialInterview?: Interview;
}

export const InterviewForm = ({
  triggerComponent,
  externalOpen,
  onSave,
  onCancel,
  initialInterview,
}: InterviewFormProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const initial = initialInterview
    ? new Date(initialInterview.scheduledAt)
    : undefined;
  // Helper: format Date as local YYYY-MM-DD (avoid UTC shift from toISOString)
  const formatLocalDate = (d: Date) => d.toLocaleDateString("en-CA");
  // Default: next day at 09:00 if creating new interview
  const computeDefaultDateTime = () => {
    const now = new Date();
    const nextDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      9,
      0,
      0,
      0,
    );
    const isoDate = formatLocalDate(nextDay);
    const hhmm = nextDay.toTimeString().slice(0, 5);
    return { isoDate, hhmm };
  };
  const defaults = initial ? undefined : computeDefaultDateTime();
  const [date, setDate] = useState<string>(
    initial ? formatLocalDate(initial) : defaults?.isoDate || "",
  );
  const [time, setTime] = useState<string>(
    initial ? initial.toTimeString().slice(0, 5) : defaults?.hhmm || "",
  );
  const [locationLink, setLocationLink] = useState<string>(
    initialInterview?.locationLink || "",
  );
  const [notes, setNotes] = useState<string>(initialInterview?.notes || "");
  const [name, setName] = useState<string>(initialInterview?.name || "");
  const hasOpenedRef = useRef<boolean>(false);

  const isDateValid = useMemo(() => !!date, [date]);
  const isTimeValid = useMemo(() => !!time, [time]);
  // Allow plain addresses OR URLs. If it looks like a URL, validate; otherwise treat as a free-form address.
  const isProbablyUrl = (value: string) => {
    const v = value.trim();
    if (!v) return false;
    // Heuristics: starts with protocol, has typical domain TLD, or contains dots and slashes
    return /^(https?:\/\/)/.test(v) || /\.[a-z]{2,}$/i.test(v) || /\//.test(v);
  };
  const isUrlSyntaxValid = (value: string) => {
    return /^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+[\w\-._~:\/?#\[\]@!$&'()*+,;=]*$/.test(
      value.trim(),
    );
  };
  const isLocationValid =
    !locationLink || // empty is allowed
    (!isProbablyUrl(locationLink) && locationLink.trim().length > 0) || // plain address
    isUrlSyntaxValid(locationLink); // valid URL
  const isFormValid = isDateValid && isTimeValid && isLocationValid;

  const handleOpenChange = (value: boolean) => {
    if (value) {
      hasOpenedRef.current = true;
      setOpen(true);
    } else {
      setOpen(false);
      onCancel?.();
    }
  };

  const handleSaveInterview = useCallback(async () => {
    const payload: Interview = {
      id: initialInterview?.id || uuidv4(),
      name,
      scheduledAt: new Date(`${date}T${time}:00`).toISOString(),
      locationLink,
      notes,
    };
    setIsSaving(true);
    setSaveFailed(false);
    const saved = await onSave(payload);
    setIsSaving(false);
    if (saved === false) {
      // Keep the draft so the user can retry.
      setSaveFailed(true);
      return;
    }
    setOpen(false);
  }, [date, time, name, locationLink, notes, onSave, initialInterview]);

  useEffect(() => {
    if (initialInterview && hasOpenedRef.current) {
      // when initialInterview changes while open, update form fields
      const initialDate = new Date(initialInterview.scheduledAt);
      setDate(formatLocalDate(initialDate));
      setTime(initialDate.toTimeString().slice(0, 5));
      setLocationLink(initialInterview.locationLink || "");
      setNotes(initialInterview.notes || "");
      setName(initialInterview.name || "");
    }
  }, [initialInterview]);

  // external control: sync open state when externalOpen changes
  useEffect(() => {
    if (externalOpen !== undefined && externalOpen !== open) {
      handleOpenChange(externalOpen);
    }
    // Only respond to externalOpen changes; open is included to avoid stale comparison
  }, [externalOpen, open]);

  useEffect(() => {
    if (!open) {
      const defaults = computeDefaultDateTime();
      setName("");
      setDate(defaults.isoDate);
      setTime(defaults.hhmm);
      setLocationLink("");
      setNotes("");
      setSaveFailed(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {triggerComponent && (
        <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {initialInterview ? "Edit interview" : "Add interview"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 w-full">
          <Field label="Name">
            <Input
              type="text"
              placeholder="e.g., Screening, Technical, Onsite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-roboto"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Field label="Date">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="font-roboto"
              />
            </Field>
            <Field label="Time">
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="font-roboto"
              />
            </Field>
          </div>
          <Field label="Location or Link">
            <Input
              type="text"
              placeholder="Zoom/Meet/Maps/Address"
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              invalid={isProbablyUrl(locationLink) && !isUrlSyntaxValid(locationLink)}
              className="font-roboto"
            />
          </Field>
          <Field label="Notes">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="font-roboto"
              placeholder="Interview panel, agenda, reminders..."
            />
          </Field>
        </div>
        {saveFailed && (
          <p role="alert" className="text-left text-sm text-red-600 dark:text-red-400">
            Couldn't save. Your changes are still here, so you can try again.
          </p>
        )}
        <DialogFooter>
          <div className="flex flex-row gap-2 justify-end pt-1">
            <Button variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!isFormValid || isSaving}
              onClick={() => void handleSaveInterview()}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
