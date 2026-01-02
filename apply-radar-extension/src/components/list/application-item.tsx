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

const getStatusContainerClassNames = (status?: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return "bg-yellow-100/20 text-yellow-900 dark:text-yellow-300 border-yellow-500/50 ring-yellow-300/50";
    case ApplicationStatus.INTERVIEW:
      return "bg-teal-100/20 text-teal-900 dark:text-teal-300 border-teal-500/50 ring-teal-300/50";
    case ApplicationStatus.OFFERED:
      return "bg-green-100/20 text-green-900 dark:text-green-300 border-green-500/50 ring-green-300/50";
    case ApplicationStatus.REJECTED:
      return "bg-red-100/20 text-red-900 dark:text-red-300 border-red-500/50 ring-red-300/50";
    default:
      return "";
  }
};

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

  return (
    <div className="font-roboto flex flex-col gap-1 transition-scale ease-in-out duration-200 ease-in-out border-b border-b-gray-200 dark:border-b-gray-700 pb-4">
      <TooltipProvider>
        <div className="relative grid grid-cols-8 items-center content-center gap-3">
          <div className="col-span-2 pl-4 text-base font-semibold line-clamp-2 transition-all duration-100 ease-linear flex flex-col items-start">
            <span className="text-left text-blue-950 dark:text-teal-400 text-lg font-semibold">
              {app?.companyName}
            </span>
            <span className="text-left text-sm text-gray-400">
              {app?.position}
            </span>
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
            <SelectTrigger
              className={`flex gap-1.5 cursor-pointer py-2 px-4 bg-white dark:bg-neutral-600 rounded-3xl col-span-2 mx-auto border-1 ring-2 ring-inset ${getStatusContainerClassNames(
                app?.status
              )}`}
            >
              <ApplicationStatusIcon status={app?.status} />
              <span className="text-xs font-medium">
                {app?.status.slice(0, 1).toUpperCase() +
                  app?.status.slice(1).toLowerCase()}
              </span>
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
          <div className="col-span-2 text-sm text-gray-500 dark:text-gray-100 text-center">
            {new Date(app.createdAt).toLocaleDateString()}
          </div>
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
                      : "text-gray-400 dark:text-gray-100 hover:text-yellow-300 hover:scale-110 transition-all duration-150 ease-in-out"
                  }`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent align="center">
              {app?.favorite ? "Unfavorite" : "Favorite"} this application
            </TooltipContent>
          </TooltipRoot>
          <div className="col-span-1 flex flex-row items-center justify-center gap-2">
            <TooltipRoot>
              <TooltipTrigger asChild>
                <a href={app?.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mx-auto h-6 w-6 text-gray-500 cursor-pointer dark:text-gray-100" />
                </a>
              </TooltipTrigger>
              <TooltipContent align="center">
                Open application link
              </TooltipContent>
            </TooltipRoot>
            <ItemContextMenu options={menuOptions} itemId={app?.id ?? ""} />
          </div>
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
      <ApplicationForm
        app={app}
        externalOpen={editMode}
        onSave={(application) => {
          updateApp &&
            updateApp(app.id, (prevApp) => ({ ...prevApp, ...application }));
          setEditMode(false);
        }}
        onCancel={() => setEditMode(false)}
      />
    </div>
  );
};
