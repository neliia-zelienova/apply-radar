import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ApplicationStatus, type ApplicationData } from "../types/applications";
import { v4 as uuidv4 } from "uuid";

interface ApplicationsContextType {
    applications: ApplicationData[];
    addNewApplication: (app: ApplicationData) => void;
    updateApplication: (id: string, updater: (app: ApplicationData) => ApplicationData) => void;
    archiveApplication: (id: string) => void;
    showNewAppForm: boolean;
    setShowNewAppForm: () => void;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

interface ApplicationsProviderProps {
    children: ReactNode;
}

export const ApplicationsProvider = ({ children }: ApplicationsProviderProps) => {
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [showNewAppForm, setShowNewAppForm] = useState<boolean>(false);

    const addNewApplication = (app: ApplicationData) => {
        setApplications((prevApps) => [...prevApps, app]);
    };

    const updateApplication = (id: string, updater: (app: ApplicationData) => ApplicationData) => {
        setApplications((prevApps) =>
            prevApps.map((app) => (app.id === id ? updater({...app, updatedAt: new Date().toISOString()}) : app))
        );
    };

    const archiveApplication = (id: string) => {
        setApplications((prevApps) =>
            prevApps.map((app) => (app.id === id ? { ...app, archived: true } : app))
        );
    };

    useEffect(() => {
        // TODO: Fetch applications from storage or API
        setApplications([
            {name: "Test App pending", id: uuidv4(), status: ApplicationStatus.PENDING, link: "https://example.com", notes: "This is a test application.", createdAt: "", updatedAt: ""},
            {name: "Test App interview", id: uuidv4(), status: ApplicationStatus.INTERVIEW, link: "https://example.com", notes: "This is a test application.", createdAt: "", updatedAt: ""},
            {name: "Test App rejected", id: uuidv4(), status: ApplicationStatus.REJECTED, link: "https://example.com", notes: "This is a test application.", createdAt: "", updatedAt: ""},
            {name: "Test App offered", id: uuidv4(), status: ApplicationStatus.OFFERED, link: "https://example.com", notes: "This is a test application.", createdAt: "", updatedAt: ""},
        ]);
    }, []);

    return (
        <ApplicationsContext.Provider
            value={{
                applications,
                addNewApplication,
                updateApplication,
                archiveApplication,
                showNewAppForm,
                setShowNewAppForm: () => setShowNewAppForm(true),
            }}
        >
            {children}
        </ApplicationsContext.Provider>
    );
};

export const useApplicationContext = () => {
    const context = useContext(ApplicationsContext);
    if (context === undefined) {
        throw new Error("useApplicationContext must be used within an ApplicationsProvider");
    }
    return context;
};
