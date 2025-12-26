import { useMemo, useState } from "react";
import {
  ApplicationStatus,
  type ApplicationData,
} from "../../types/applications";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "../ui/tooltip";
import { ItemContextMenu } from "./item-context-menu";
import {
  Archive,
  ChevronDown,
  ExternalLink,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { ApplicationStatusIcon } from "./applications-status-icon";
import { ApplicationForm } from "./application-form";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "../ui/select";

interface ApplicationItemProps {
  app: ApplicationData;
  deleteApp?: (id: string) => void;
  updateApp?: (
    id: string,
    updater: (app: ApplicationData) => ApplicationData
  ) => void;
  archiveApp?: (id: string) => void;
}

export const ApplicationItem = ({
  app,
  deleteApp,
  updateApp,
  archiveApp,
}: ApplicationItemProps) => {
  const [editMode, setEditMode] = useState<boolean>(app === undefined);
  const [moreInfo, setMoreInfo] = useState<boolean>(false);

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
    },
  ];

  const toggleFavorite = () => {
    updateApp &&
      updateApp(app.id, (prevApp) => ({
        ...prevApp,
        favorite: !prevApp.favorite,
      }));
  };

  const allowedStatuses = useMemo(() => {
    return Object.values(ApplicationStatus).filter((status) => {
      return status !== app.status;
    });
  }, [app.status]);

  if (editMode) {
    return (
      <ApplicationForm
        app={app}
        onSave={(application) => {
          updateApp &&
            updateApp(app.id, (prevApp) => ({ ...prevApp, ...application }));
          setEditMode(false);
        }}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  return (
    <div className="font-roboto p-3 flex flex-col gap-1 border border-white/30 bg-white/10 backdrop-blur-sm rounded-md shadow-sm transition-scale ease-in-out duration-200 ease-in-out shadow-zinc-400/40 dark:shadow-zinc-100/40">
      <TooltipProvider>
        <div className="relative grid grid-cols-9 items-center content-center gap-3">
          <div className="col-span-3 text-base font-semibold line-clamp-2 transition-all transition-100 ease-linear">
            {app?.name}
          </div>
          <SelectRoot
            onValueChange={(value) => {
              updateApp &&
                updateApp(app.id, (prevApp) => ({
                  ...prevApp,
                  status: value as ApplicationStatus,
                }));
            }}
          >
            <SelectTrigger className="col-span-1 mx-auto">
              <ApplicationStatusIcon status={app?.status} />
            </SelectTrigger>
            <SelectContent>
              {allowedStatuses.map((status) => (
                <SelectItem
                  key={`${app.id}-status-option-${status}`}
                  value={status}
                >
                  {status.slice(0, 1).toUpperCase() +
                    status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
          <div className="col-span-2 text-sm text-gray-500">
            {new Date(app.createdAt).toLocaleDateString()}
          </div>
          <TooltipRoot>
            <TooltipTrigger asChild>
              <a href={app?.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mx-auto h-6 w-6 text-gray-500 cursor-pointer" />
              </a>
            </TooltipTrigger>
            <TooltipContent align="center">
              Open application link
            </TooltipContent>
          </TooltipRoot>
          <TooltipRoot>
            <TooltipTrigger asChild>
              <button
                onClick={toggleFavorite}
                className="col-span-1 mx-auto cursor-pointer rounded-md p-2 hover:bg-teal-300/20 h-fit"
                aria-label={
                  app?.favorite
                    ? "Unfavorite this application"
                    : "Favorite this application"
                }
              >
                <Star
                  className={`mx-auto h-6 w-6 ${
                    app?.favorite
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-400 hover:text-yellow-300 hover:scale-110 transition-all duration-150 ease-in-out"
                  }`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent align="center">
              {app?.favorite ? "Unfavorite" : "Favorite"} this application
            </TooltipContent>
          </TooltipRoot>
          <ItemContextMenu options={menuOptions} itemId={app?.id ?? ""} />
        </div>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <button
              className={`flex flex-row items-center gap-1 m-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ${
                moreInfo ? "rotate-180" : "rotate-0"
              } origin-center transition-transform duration-200 ease-in-out cursor-pointer`}
              onClick={() => setMoreInfo((prev) => !prev)}
              aria-label={
                moreInfo
                  ? "Hide additional information"
                  : "Show additional information"
              }
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent align="center">Show more info</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
      {moreInfo && (
        <div className="mt-2 p-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {app.notes || "No additional notes."}
        </div>
      )}
    </div>
  );
};
