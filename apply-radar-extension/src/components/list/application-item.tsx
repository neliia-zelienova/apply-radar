import { useState } from "react";
import { ApplicationStatus, type ApplicationData } from "../../types/applications";
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from "../ui/tooltip";
import { ItemContextMenu } from "./item-context-menu";
import { Archive, Pencil, Trash2 } from "lucide-react";
import { ApplicationStatusIcon } from "./applications-status-icon";
import { v4 as uuidv4 } from "uuid";

interface ApplicationItemProps {
    app?: ApplicationData;
    createApp?: (app: ApplicationData) => void;
    deleteApp?: (id: string) => void;
    updateApp?: (id: string, updater: (app: ApplicationData) => ApplicationData) => void;
    archiveApp?: (id: string) => void;
}

export const ApplicationItem = ({ app, createApp, deleteApp, updateApp, archiveApp }: ApplicationItemProps) => {

    const [editMode, setEditMode] = useState<boolean>(app === undefined);
    const [name, setName] = useState<string>(app?.name || "");
    const [link, setLink] = useState<string>(app?.link || "");
    const [notes, setNotes] = useState<string>(app?.notes || "");
    // const [appStatus, setAppStatus] = useState<ApplicationStatus>(app?.status || ApplicationStatus.PENDING);

    const menuOptions = [
        {
            label: "Edit",
            icon: <Pencil />,
            action: (itemId: string) => {console.log("Edit", itemId); setEditMode(true)},
        },
        {
            label: "Delete",
            icon: <Trash2 />,
            action: (itemId: string) => { console.log("Delete", itemId); deleteApp && deleteApp(itemId); },
        },
        {
            label: "Archive",
            icon: <Archive />,
            action: (itemId: string) => { console.log("Archive", itemId); archiveApp && archiveApp(itemId); },
        }

    ]

    if (editMode) {
        return (
        <div className="flex flex-col p-4 border-b border-gray-200">
            <input
            type="text"
            placeholder="Application Name"
            defaultValue={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-2 p-2 border border-gray-300 rounded"
            />
            <input
            type="text"
            placeholder="Application Link"
            defaultValue={link}
            onChange={(e) => setLink(e.target.value)}
            className="mb-2 p-2 border border-gray-300 rounded"
            />
            <textarea
            placeholder="Notes"
            defaultValue={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mb-2 p-2 border border-gray-300 rounded"
            />
            <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
                setEditMode(false);
                app ? updateApp && updateApp(app.id, (prevApp) => ({ ...prevApp, name, link, notes })) : createApp && createApp({ id: uuidv4(), name, link, notes, status: ApplicationStatus.PENDING, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ApplicationData);
            }}
            >
            Save
            </button>
        </div>
        );
    }
    return (
        <div className="relative grid grid-cols-6 gap-3 p-3 border border-white/30 bg-white/10 backdrop-blur-sm rounded-md">
            <TooltipProvider>
                {/* <TooltipRoot> */}
                    {/* <TooltipTrigger asChild> */}
                        <a href={app?.link} className="col-span-2 text-lg font-semibold line-clamp-2 hover:underline transition-all transition-100 ease-linear">{app?.name}</a>
                    {/* </TooltipTrigger> */}
                    {/* <TooltipContent align="center">Go to Application Link</TooltipContent> */}
                {/* </TooltipRoot> */}
                <TooltipRoot>
                    <TooltipTrigger asChild>
                        <ApplicationStatusIcon status={app?.status}/>
                        {/* <button className={`mx-auto text-sm h-6 w-6 text-gray-500 cursor-pointer status-${app?.status?.toLowerCase()}`}/> */}
                    </TooltipTrigger>
                    <TooltipContent align="center">Current status: {app?.status}. Click to change</TooltipContent>
                </TooltipRoot>
                <p className="col-span-2 mt-2 text-sm text-gray-600">{app?.notes}</p>
            </TooltipProvider>
            <ItemContextMenu options={menuOptions} itemId={app?.id ?? ''} />
        </div>
    );
};
