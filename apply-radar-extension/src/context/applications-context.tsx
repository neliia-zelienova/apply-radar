import { createContext, useContext } from "react";
import { type ApplicationData } from "../types/applications";

interface ApplicationsContextType {
    applications: ApplicationData[];
    total: number;
    setSearch: (search: string) => void;
    setFilterStatus: (status: string) => void;
    newAppFormVisible: boolean;
    showNewAppForm: () => void;
    hideNewAppForm: () => void;
    createApplication: (app: ApplicationData) => void;
    deleteApplication: (id: string) => void;
    archiveApplication: (id: string) => void;
    updateApplication: (id: string, updater: (app: ApplicationData) => ApplicationData) => void;
}

export const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export const useApplicationContext = () => {
    const context = useContext(ApplicationsContext);
    if (context === undefined) {
        throw new Error("useApplicationContext must be used within an ApplicationsProvider");
    }
    return context;
};
