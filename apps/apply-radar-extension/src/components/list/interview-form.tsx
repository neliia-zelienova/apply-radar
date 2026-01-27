import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { Interview } from "../../types/applications";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { InputNumber } from "../ui/input-number";
import { Checkbox } from "../ui/checkbox";

interface InterviewFormProps {
  triggerComponent?: React.ReactNode;
  externalOpen?: boolean;
  onSave: (interview: Interview) => void;
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
  const initial = initialInterview
    ? new Date(initialInterview.date)
    : undefined;
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
      0
    );
    const isoDate = nextDay.toISOString().slice(0, 10);
    const hhmm = nextDay.toTimeString().slice(0, 5);
    return { isoDate, hhmm };
  };
  const defaults = initial ? undefined : computeDefaultDateTime();
  const [date, setDate] = useState<string>(
    initial ? initial.toISOString().slice(0, 10) : defaults?.isoDate || ""
  );
  const [time, setTime] = useState<string>(
    initial ? initial.toTimeString().slice(0, 5) : defaults?.hhmm || ""
  );
  const [locationLink, setLocationLink] = useState<string>(
    initialInterview?.locationLink || ""
  );
  const [notes, setNotes] = useState<string>(initialInterview?.notes || "");
  const [name, setName] = useState<string>(initialInterview?.name || "");
  const [notifyEnabled, setNotifyEnabled] = useState<boolean>(
    initialInterview?.notifyEnabled ?? true
  );
  const [notifyValue, setNotifyValue] = useState<number>(1);
  const [notifyUnit, setNotifyUnit] = useState<"minutes" | "hours" | "days">(
    "hours"
  );
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
      value.trim()
    );
  };
  const isLocationValid =
    !locationLink || // empty is allowed
    (!isProbablyUrl(locationLink) && locationLink.trim().length > 0) || // plain address
    isUrlSyntaxValid(locationLink); // valid URL
  const isFormValid =
    isDateValid && isTimeValid && (isLocationValid || name.trim().length > 0);

  // max value for notify depends on difference between interview time and now in selected unit
  const computeMaxForUnit = (unit: "minutes" | "hours" | "days") => {
    if (!isDateValid || !isTimeValid) return 0;
    const interviewMs = new Date(`${date}T${time}:00`).getTime();
    const nowMs = Date.now();
    const diffMs = Math.max(0, interviewMs - nowMs);
    if (unit === "minutes") return Math.floor(diffMs / 60000);
    if (unit === "hours") return Math.floor(diffMs / 3600000);
    return Math.floor(diffMs / 86400000);
  };
  const maxNotifyValue = computeMaxForUnit(notifyUnit);

  const allowedUnits = useMemo(() => {
    const units: ("minutes" | "hours" | "days")[] = [];
    const maxMinutes = computeMaxForUnit("minutes");
    if (maxMinutes >= 1) units.push("minutes");
    const maxHours = computeMaxForUnit("hours");
    if (maxHours >= 1) units.push("hours");
    const maxDays = computeMaxForUnit("days");
    if (maxDays >= 1) units.push("days");
    // ensure current unit is always included
    if (!units.includes(notifyUnit)) units.push(notifyUnit);
    return units;
  }, [date, time, notifyUnit]);

  const handleOpenChange = (value: boolean) => {
    if (value) {
      hasOpenedRef.current = true;
      setOpen(true);
    } else {
      setOpen(false);
      onCancel?.();
    }
  };

  const handleSaveInterview = useCallback(() => {
    const isoDateTime = new Date(`${date}T${time}:00`).toISOString();
    // convert user-selected value/unit to minutes
    const minutesBefore =
      notifyUnit === "minutes"
        ? notifyValue
        : notifyUnit === "hours"
        ? notifyValue * 60
        : notifyValue * 1440;
    const payload: Interview = {
      id: initialInterview?.id || uuidv4(),
      name,
      date: isoDateTime,
      locationLink,
      notes,
      notifyEnabled,
      notifyMinutesBefore: minutesBefore,
    };
    onSave(payload);
    // schedule alarm in background if enabled
    if (notifyEnabled) {
      chrome.runtime.sendMessage({
        type: "scheduleInterviewAlarm",
        interviewId: payload.id,
        dateISO: payload.date,
        notifyMinutesBefore: minutesBefore,
        title: payload.name ? `${payload.name} reminder` : "Interview reminder",
        link: locationLink,
      });
    }
    setOpen(false);
    setDate("");
    setTime("");
    setLocationLink("");
    setNotes("");
  }, [
    date,
    time,
    name,
    locationLink,
    notes,
    notifyEnabled,
    notifyUnit,
    notifyValue,
    onSave,
    initialInterview,
  ]);

  const handleUnitsChanged = (value: string) => {
    const nextUnit = value as any;
    // preserve the total minutes when switching unit
    const totalMinutes =
      notifyUnit === "minutes"
        ? notifyValue
        : notifyUnit === "hours"
        ? notifyValue * 60
        : notifyValue * 1440;
    const converted =
      nextUnit === "minutes"
        ? totalMinutes
        : nextUnit === "hours"
        ? Math.floor(totalMinutes / 60)
        : Math.floor(totalMinutes / 1440);
    setNotifyUnit(nextUnit);
    const newMax = computeMaxForUnit(nextUnit);
    setNotifyValue(Math.max(0, Math.min(converted, newMax)));
  };

  useEffect(() => {
    if (initialInterview && hasOpenedRef.current) {
      // when initialInterview changes while open, update form fields
      const initialDate = new Date(initialInterview.date);
      setDate(initialDate.toISOString().slice(0, 10));
      setTime(initialDate.toTimeString().slice(0, 5));
      setLocationLink(initialInterview.locationLink || "");
      setNotes(initialInterview.notes || "");
      setName(initialInterview.name || "");
      setNotifyEnabled(initialInterview.notifyEnabled ?? true);
      // set notify value/unit based on minutes before
      const minutesBefore = initialInterview.notifyMinutesBefore || 0;
      if (minutesBefore < 60) {
        setNotifyUnit("minutes");
        setNotifyValue(minutesBefore);
      } else if (minutesBefore < 1440) {
        setNotifyUnit("hours");
        setNotifyValue(Math.floor(minutesBefore / 60));
      } else {
        setNotifyUnit("days");
        setNotifyValue(Math.floor(minutesBefore / 1440));
      }
    }
  }, [initialInterview]);

  // external control
  if (externalOpen !== undefined && externalOpen !== open) {
    handleOpenChange(externalOpen);
  }

  useEffect(() => {
    if (!open) {
      const defaults = computeDefaultDateTime();
      setName("");
      setDate(defaults.isoDate);
      setTime(defaults.hhmm);
      setLocationLink("");
      setNotes("");
      setNotifyEnabled(true);
      setNotifyValue(1);
      setNotifyUnit("hours");
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
          <label className="flex flex-col gap-1 items-start w-full">
            <span className="text-sm">Name</span>
            <input
              type="text"
              placeholder="e.g., Screening, Technical, Onsite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 font-roboto"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 w-full">
            <label className="flex flex-col gap-1 items-start w-full">
              <span className="text-sm">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 font-roboto"
              />
            </label>
            <label className="flex flex-col gap-1 items-start w-full">
              <span className="text-sm">Time</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 font-roboto"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 items-start w-full">
            <span className="text-sm">Location or Link </span>
            <input
              type="text"
              placeholder="Zoom/Meet/Maps/Address"
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              className={`w-full p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors font-roboto ${
                isProbablyUrl(locationLink) && !isUrlSyntaxValid(locationLink)
                  ? "border-red-500"
                  : "border-white/20"
              }`}
            />
          </label>
          <label className="flex flex-col gap-1 items-start w-full">
            <span className="text-sm">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-24 p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-roboto"
              placeholder="Interview panel, agenda, reminders..."
            />
          </label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={notifyEnabled}
                onCheckedChange={(checked) => setNotifyEnabled(checked)}
                ariaLabel="Enable notification"
              />
              <span className="text-sm">Enable notification</span>
            </label>
            {notifyEnabled && (
              <div className="flex flex-row gap-3">
                <label className="flex items-center gap-2">
                  <span className="text-sm">Notify</span>
                  <InputNumber
                    value={notifyValue}
                    min={0}
                    max={maxNotifyValue}
                    onChange={(value: number) =>
                      setNotifyValue(
                        Math.max(0, Math.min(value, maxNotifyValue))
                      )
                    }
                    inputClassName="w-16 p-1"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <SelectRoot
                    value={notifyUnit}
                    onValueChange={handleUnitsChanged}
                  >
                    <span className="text-sm">before</span>
                    <SelectTrigger className="p-2 rounded-md bg-teal-400/10 dark:bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors w-full text-left">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </label>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <div className="flex flex-row gap-2 justify-end pt-1">
            <Button variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!isFormValid}
              onClick={handleSaveInterview}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
