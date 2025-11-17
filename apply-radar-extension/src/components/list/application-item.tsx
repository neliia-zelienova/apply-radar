import { useState } from "react";
import { ApplicationStatus, type ApplicationData } from "../../types/applications";
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from "../ui/tooltip";
import { ItemContextMenu } from "./item-context-menu";
import { Archive, Pencil, Trash2 } from "lucide-react";
import { ApplicationStatusIcon } from "./applications-status-icon";
import { v4 as uuidv4 } from "uuid";
import { ApplicationForm } from "./application-form";

interface ApplicationItemProps {
    app: ApplicationData;
    deleteApp?: (id: string) => void;
    updateApp?: (id: string, updater: (app: ApplicationData) => ApplicationData) => void;
    archiveApp?: (id: string) => void;
}

export const ApplicationItem = ({ app, deleteApp, updateApp, archiveApp }: ApplicationItemProps) => {

    const [editMode, setEditMode] = useState<boolean>(app === undefined);

    const menuOptions = [
        {
            label: "Edit",
            icon: <Pencil />,
            action: () => setEditMode(true),
        },
        {
            label: "Delete",
            icon: <Trash2 />,
            action: (itemId: string) => deleteApp && deleteApp(itemId),
        },
        {
            label: "Archive",
            icon: <Archive />,
            action: (itemId: string) => archiveApp && archiveApp(itemId),
        }

    ]

    if (editMode) {
        return <ApplicationForm app={app} onSave={(application) => {
                updateApp && updateApp(app.id, (prevApp) => ({ ...prevApp, ...application }));
                setEditMode(false);
        }}
        onCancel={() => setEditMode(false)} />;
    }

    return (
        <div className="relative grid grid-cols-6 gap-3 p-3 border border-white/30 bg-white/10 backdrop-blur-sm rounded-md shadow-sm hover:scale-[1.02] transition-scale ease-in-out duration-200 ease-in-out shadow-zinc-400/40 dark:shadow-zinc-100/40">
            <TooltipProvider>
                <a href={app?.link} className="col-span-2 text-lg font-semibold line-clamp-2 hover:underline transition-all transition-100 ease-linear">{app?.name}</a>
                <TooltipRoot>
                    <TooltipTrigger asChild>
                        <ApplicationStatusIcon status={app?.status} onClick={() => {}} />
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
