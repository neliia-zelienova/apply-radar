import { createContext, useContext } from "react";
import { type Application } from "@apply-radar/shared";

interface ApplicationsContextType {
  applications: Application[];
  total: number;
  search: string;
  setSearch: (search: string) => void;
  setFilterStatus: (status: string) => void;
  createApplication: (app: Application) => void;
  deleteApplication: (id: string) => void;
  archiveApplication: (id: string) => void;
  updateApplication: (
    id: string,
    updater: (app: Application) => Application
  ) => void;
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
