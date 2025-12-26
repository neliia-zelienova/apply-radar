import { useState } from "react";
import {
  ApplicationStatus,
  type ApplicationData,
} from "../../types/applications";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";

export const ApplicationForm = ({
  app,
  onSave,
  onCancel,
}: {
  app?: ApplicationData;
  onSave: (app: ApplicationData) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState<string>(app?.name || "");
  const [link, setLink] = useState<string>(app?.link || "");
  const [notes, setNotes] = useState<string>(app?.notes || "");
  const [touched, setTouched] = useState<{ name: boolean; link: boolean }>({
    name: false,
    link: false,
  });

  // Simple validators
  const isNameValid = name.trim().length > 1;
  const isLinkValid =
    !link ||
    /^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+[\w\-._~:\/?#\[\]@!$&'()*+,;=.]*$/.test(
      link.trim()
    );
  const notesLimit = 500;
  const notesCount = notes.length;
  const isFormValid = isNameValid && isLinkValid;

  return (
    <div className="flex flex-col gap-4 p-5 border border-white/20 bg-white/5 backdrop-blur-sm rounded-xl shadow-sm duration-200 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {app ? "Edit application" : "Add new application"}
          </h3>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-3 w-full">
        {/* Name */}
        <label className="flex flex-col items-start w-full gap-1">
          <span className="text-sm">Name</span>
          <input
            type="text"
            aria-label="Application Name"
            placeholder="e.g. QA Engineer at Google"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            className={`w-full p-2 rounded-md bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
              !isNameValid && touched.name
                ? "border-red-500"
                : "border-white/20"
            }`}
          />
          {!isNameValid && touched.name && (
            <span role="alert" className="text-xs text-red-400">
              Please enter at least 2 characters
            </span>
          )}
        </label>

        {/* Link */}
        <label className="flex flex-col gap-1 items-start w-full">
          <span className="text-sm">Link (optional)</span>
          <input
            type="url"
            aria-label="Application Link"
            placeholder="https://company.com/careers/job"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, link: true }))}
            className={`w-full p-2 rounded-md bg-black/20 border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
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

        {/* Notes */}
        <label className="flex flex-col gap-1 items-start w-full">
          <span className="text-sm">Notes</span>
          <div className="relative w-full p-2 pb-5.5 min-h-24 rounded-md bg-black/20 border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <textarea
              aria-label="Application Notes"
              placeholder="Add quick notes (e.g. referral, contact, next steps...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, notesLimit))}
              className="h-[100%] resize-none w-full focus:outline-none bg-transparent"
            />
            <div className="absolute bottom-1 right-1 flex items-center justify-between text-xs text-white/60">
              <span>
                {notesCount}/{notesLimit}
              </span>
            </div>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-row gap-2 justify-end pt-1">
        <Button
          aria-label="Cancel"
          variant="secondary"
          size="md"
          onClick={onCancel}
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
                    name,
                    link,
                    notes,
                    updatedAt: new Date().toISOString(),
                  }
                : {
                    id: uuidv4(),
                    name,
                    link,
                    notes,
                    status: ApplicationStatus.PENDING,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    favorite: false,
                  }
            );
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
