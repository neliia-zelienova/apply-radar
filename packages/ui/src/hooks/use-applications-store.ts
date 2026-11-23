import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  filterAndSortApplications,
  type Application,
  type ApplicationQuery,
  type ApplicationsRepository,
} from "@apply-radar/shared";

export interface ApplicationsStore {
  /** Filtered + sorted for display. */
  applications: Application[];
  /** Everything loaded (unfiltered), e.g. for stats. */
  allApplications: Application[];
  total: number;
  isLoading: boolean;
  /** Last failed action, shown to the user; cleared on the next action. */
  error: string | null;
  clearError: () => void;
  reload: () => Promise<void>;
  createApplication: (app: Application) => Promise<void>;
  updateApplication: (
    id: string,
    updater: (app: Application) => Application,
  ) => Promise<void>;
  archiveApplication: (id: string) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
}

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Applications state on top of a repository (local storage or the API).
 * Updates and deletes are optimistic and roll back if the repository fails.
 * Pass `repository: null` while it isn't known yet (e.g. before sign-in).
 */
export const useApplicationsStore = ({
  repository,
  ...query
}: ApplicationQuery & {
  repository: ApplicationsRepository | null;
}): ApplicationsStore => {
  const [all, setAll] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(repository !== null);
  const [error, setError] = useState<string | null>(null);
  const allRef = useRef(all);
  allRef.current = all;

  const reload = useCallback(async () => {
    if (!repository) {
      setAll([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      setAll(await repository.list());
      setError(null);
    } catch (e) {
      setError(`Couldn't load applications: ${messageOf(e)}`);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createApplication = useCallback(
    async (app: Application) => {
      if (!repository) return;
      setError(null);
      try {
        const saved = await repository.create(app);
        setAll((prev) => [...prev.filter((a) => a.id !== saved.id), saved]);
      } catch (e) {
        setError(`Couldn't add "${app.name}": ${messageOf(e)}`);
      }
    },
    [repository],
  );

  const updateApplication = useCallback(
    async (id: string, updater: (app: Application) => Application) => {
      const current = allRef.current.find((a) => a.id === id);
      if (!repository || !current) return;
      const next = updater(current);
      setError(null);
      setAll((prev) => prev.map((a) => (a.id === id ? next : a)));
      try {
        const saved = await repository.update(next);
        setAll((prev) => prev.map((a) => (a.id === id ? saved : a)));
      } catch (e) {
        setAll((prev) => prev.map((a) => (a.id === id ? current : a)));
        setError(`Couldn't save "${current.name}": ${messageOf(e)}`);
      }
    },
    [repository],
  );

  const archiveApplication = useCallback(
    (id: string) => updateApplication(id, (app) => ({ ...app, archived: true })),
    [updateApplication],
  );

  const deleteApplication = useCallback(
    async (id: string) => {
      const current = allRef.current.find((a) => a.id === id);
      if (!repository || !current) return;
      setError(null);
      setAll((prev) => prev.filter((a) => a.id !== id));
      try {
        await repository.remove(id);
      } catch (e) {
        setAll((prev) => [...prev, current]);
        setError(`Couldn't delete "${current.name}": ${messageOf(e)}`);
      }
    },
    [repository],
  );

  const { search, filterStatus, sortBy, sortOrder } = query;
  const applications = useMemo(
    () => filterAndSortApplications(all, { search, filterStatus, sortBy, sortOrder }),
    [all, search, filterStatus, sortBy, sortOrder],
  );

  return {
    applications,
    allApplications: all,
    total: applications.length,
    isLoading,
    error,
    clearError: useCallback(() => setError(null), []),
    reload,
    createApplication,
    updateApplication,
    archiveApplication,
    deleteApplication,
  };
};
