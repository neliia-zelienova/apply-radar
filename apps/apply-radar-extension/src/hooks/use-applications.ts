import { useEffect, useMemo, useState } from "react";
import { type Application } from "@apply-radar/shared";
import { getFromStorage, setInStorage } from "../utils/storage";
import { migrateStoredApplications } from "../utils/migrate-applications";

const STORAGE_KEY = "applications";
/** Raw copy of the data as it was before the first migration to the shared model. */
const BACKUP_KEY = "applications_backup_before_shared_model";

/** Reads stored applications, migrating (and persisting) old-format records on the way. */
const readApplications = async (): Promise<Application[]> => {
  const raw = await getFromStorage<unknown>(STORAGE_KEY);
  const { applications, changed } = migrateStoredApplications(raw);
  if (changed) {
    // Keep only the first backup, so a later migration never overwrites the original data.
    if ((await getFromStorage<unknown>(BACKUP_KEY)) === null) {
      await setInStorage(BACKUP_KEY, raw);
    }
    await setInStorage(STORAGE_KEY, applications);
  }
  return applications;
};

export const useApplications = ({
  search,
  filterStatus,
  sortBy,
  sortOrder,
}: {
  search: string;
  filterStatus: string;
  sortBy: "name" | "date" | "status" | "favorite";
  sortOrder: "asc" | "desc";
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch = app.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus =
          filterStatus === "All" || app.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return sortOrder === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          case "status":
            return sortOrder === "asc"
              ? a.status.localeCompare(b.status)
              : b.status.localeCompare(a.status);
          case "favorite":
            return sortOrder === "asc"
              ? Number(a.favorite) - Number(b.favorite)
              : Number(b.favorite) - Number(a.favorite);
          case "date":
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
          default:
            return 0;
        }
      });
  }, [applications, search, filterStatus, sortBy, sortOrder]);

  const createApplication = async (app: Application) => {
    const storedApplications = await readApplications();
    const apps = storedApplications || [];
    const updatedApps = [...apps, app];
    try {
      await setInStorage(STORAGE_KEY, updatedApps);
      setApplications(updatedApps);
    } catch (error) {
      console.error("Error saving application:", error);
    }
  };

  const deleteApplication = async (id: string) => {
    const storedApplications = await readApplications();
    if (storedApplications) {
      try {
        const updatedApps = storedApplications.filter(
          (app: Application) => app.id !== id
        );
        await setInStorage(STORAGE_KEY, updatedApps);
        setApplications(updatedApps);
      } catch (error) {
        console.error("Error deleting application:", error);
      }
    }
  };

  const archiveApplication = async (id: string) => {
    const storedApplications = await readApplications();
    if (storedApplications) {
      const updatedApps = storedApplications.map((app: Application) =>
        app.id === id ? { ...app, archived: true } : app
      );
      try {
        await setInStorage(STORAGE_KEY, updatedApps);
        setApplications(updatedApps);
      } catch (error) {
        console.error("Error archiving application:", error);
      }
    }
  };

  const updateApplication = async (
    id: string,
    updater: (app: Application) => Application
  ) => {
    const storedApplications = await readApplications();
    if (storedApplications) {
      try {
        const updatedApps = storedApplications.map((app: Application) =>
          app.id === id ? updater(app) : app
        );
        await setInStorage(STORAGE_KEY, updatedApps);
        setApplications(updatedApps);
      } catch (error) {
        console.error("Error updating application:", error);
      }
    }
  };

  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      try {
        const storedApplications = await readApplications();
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
    updateApplication,
  };
};
