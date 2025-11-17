import { useState } from "react";
import { ApplicationStatus, type ApplicationData } from "../../types/applications";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "../ui/button";

export const ApplicationForm = ({ app, onSave, onCancel }: { app?: ApplicationData; onSave: (app: ApplicationData) => void; onCancel: () => void }) => {
    const [name, setName] = useState<string>(app?.name || "");
    const [link, setLink] = useState<string>(app?.link || "");
    const [notes, setNotes] = useState<string>(app?.notes || "");

    return (
        <div className="flex flex-col p-4 border border-white/30 bg-white/10 backdrop-blur-sm rounded-md shadow-sm duration-200 ease-in-out shadow-zinc-400 dark:shadow-zinc-100">
            <input
                type="text"
                aria-label="Application Name"
                placeholder="Application Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-2 p-2 border border-gray-300 rounded"
            />
            <input
                type="text"
                aria-label="Application Link"
                placeholder="Application Link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="mb-2 p-2 border border-gray-300 rounded"
            />
            <textarea
                aria-label="Application Notes"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mb-2 p-2 border border-gray-300 rounded"
            />
            <div className="flex flex-row gap-2 justify-end">
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
                    onClick={() => {
                        onSave(app ? { ...app, name, link, notes, updatedAt: new Date().toISOString() } : { id: uuidv4(), name, link, notes, status: ApplicationStatus.PENDING, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
                    }}
                >
                    Save
                </Button>
            </div>
        </div>
        );
}