import { useEffect, useMemo, useState } from "react";
import type { ApplicationData } from "../types/applications";
import { getFromStorage, setInStorage } from "../utils/storage";

const STORAGE_KEY = "applications";

export const useApplications = ({ search, filterStatus }: { search: string, filterStatus: string }) => {
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = filterStatus === "All" || app.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [applications, search, filterStatus]);

    const createApplication = async (app: ApplicationData) => {
        const storedApplications = await getFromStorage<ApplicationData[]>(STORAGE_KEY);
        const apps = storedApplications || [];
        const updatedApps = [...apps, app];
        try {
            await setInStorage(STORAGE_KEY, updatedApps);
            setApplications(updatedApps);
        } catch (error) {
            console.error("Error saving application:", error);
        }
    }

    const deleteApplication = async (id: string) => {
        const storedApplications = await getFromStorage<ApplicationData[]>(STORAGE_KEY);
        if (storedApplications) {
            const updatedApps = storedApplications.filter((app: ApplicationData) => app.id !== id);
            await setInStorage(STORAGE_KEY, updatedApps);
            setApplications(updatedApps);
        }
    }

    const archiveApplication = async (id: string) => {
        const storedApplications = await getFromStorage<ApplicationData[]>(STORAGE_KEY);
        if (storedApplications) {
            const updatedApps = storedApplications.map((app: ApplicationData) => 
                app.id === id ? { ...app, archived: true } : app
            );
            try {
                await setInStorage(STORAGE_KEY, updatedApps);
                setApplications(updatedApps);
            } catch (error) {
                console.error("Error archiving application:", error);
            }
        }
    }

    const updateApplication = async (id: string, updater: (app: ApplicationData) => ApplicationData) => {
        const storedApplications = await getFromStorage<ApplicationData[]>(STORAGE_KEY);
        if (storedApplications) {
            const updatedApps = storedApplications.map((app: ApplicationData) => 
                app.id === id ? updater(app) : app
            );
            await setInStorage(STORAGE_KEY, updatedApps);
            setApplications(updatedApps);
        }
    }

    useEffect(() => {
        const loadApplications = async () => {
            setIsLoading(true);
            try {
                const storedApplications = await getFromStorage<ApplicationData[]>(STORAGE_KEY);
                if (storedApplications) {
                    setApplications(storedApplications);
                }
            } catch (error) {
                console.error("Error loading applications:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadApplications();
    }, []);

    return { 
        applications: filteredApplications, 
        total: filteredApplications.length,
        isLoading,
        createApplication,
        deleteApplication,
        archiveApplication,
        updateApplication
    };
};