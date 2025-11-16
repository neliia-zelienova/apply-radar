import { useEffect, useMemo, useState } from "react";
import type { ApplicationData } from "../types/applications";

export const useApplications = ({ search, filterStatus }: { search: string, filterStatus: string }) => {
    const [applications, setApplications] = useState<ApplicationData[]>([]);

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = filterStatus === "All" || app.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [applications, search, filterStatus]);

    const createApplication = (app: ApplicationData) => {
        setApplications((prevState) => ([...prevState, app]));
        const storedApplications = localStorage.getItem("applications");
        const apps = storedApplications ? JSON.parse(storedApplications) : [];
        apps.push(app);
        localStorage.setItem("applications", JSON.stringify(apps)); 
    }

    const deleteApplication = (id: string) => {
        setApplications((prevState) => prevState.filter(app => app.id !== id));
        const storedApplications = localStorage.getItem("applications");
        if (storedApplications) {
            const apps = JSON.parse(storedApplications);
            const updatedApps = apps.filter((app: ApplicationData) => app.id !== id);
            localStorage.setItem("applications", JSON.stringify(updatedApps));
        }
    }

    const archiveApplication = (id: string) => {
        setApplications((prevState) => 
            prevState.map(app => 
                app.id === id ? { ...app, archived: true } : app
            )
        );
        const storedApplications = localStorage.getItem("applications");
        if (storedApplications) {
            const apps = JSON.parse(storedApplications);
            const updatedApps = apps.map((app: ApplicationData) => 
                app.id === id ? { ...app, archived: true } : app
            );
            localStorage.setItem("applications", JSON.stringify(updatedApps));
        }
    }

    const updateApplication = (id: string, updater: (app: ApplicationData) => ApplicationData) => {
        setApplications((prevState) => 
            prevState.map(app => 
                app.id === id ? updater(app) : app
            )
        );
        const storedApplications = localStorage.getItem("applications");
        if (storedApplications) {
            const apps = JSON.parse(storedApplications);
            const updatedApps = apps.map((app: ApplicationData) => 
                app.id === id ? updater(app) : app
            );
            localStorage.setItem("applications", JSON.stringify(updatedApps));
        }
    }

    useEffect(() => {
        const storedApplications = localStorage.getItem("applications");
        if (storedApplications) {
            setApplications(JSON.parse(storedApplications));
        }
    }, []);

    return { 
        applications: filteredApplications, 
        total: filteredApplications.length,
        createApplication,
        deleteApplication,
        archiveApplication,
        updateApplication
    };
};