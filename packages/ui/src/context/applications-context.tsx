import { createContext, useContext } from "react";
import { type Application } from "@apply-radar/shared";

export interface ApplicationsContextType {
  applications: Application[];
  total: number;
  search: string;
  setSearch: (search: string) => void;
  setFilterStatus: (status: string) => void;
  /** These resolve true when saved, false when the save failed. */
  createApplication: (app: Application) => Promise<boolean>;
  deleteApplication: (id: string) => Promise<boolean>;
  archiveApplication: (id: string) => Promise<boolean>;
  updateApplication: (
    id: string,
    updater: (app: Application) => Application
  ) => Promise<boolean>;
  sortBy: "name" | "date" | "status" | "favorite";
  sortOrder: "asc" | "desc";
  setSortBy: (sortBy: "name" | "date" | "status" | "favorite") => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
}

export const ApplicationsContext = createContext<
  ApplicationsContextType | undefined
>(undefined);

export const useApplicationContext = () => {
  const context = useContext(ApplicationsContext);
  if (context === undefined) {
    throw new Error(
      "useApplicationContext must be used within an ApplicationsProvider"
    );
  }
  return context;
};
