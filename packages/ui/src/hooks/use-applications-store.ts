import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  /** Resolves true when saved; on failure sets `error` and resolves false. */
  createApplication: (app: Application) => Promise<boolean>;
  updateApplication: (
    id: string,
    updater: (app: Application) => Application,
  ) => Promise<boolean>;
  archiveApplication: (id: string) => Promise<boolean>;
  deleteApplication: (id: string) => Promise<boolean>;
}

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Applications state on top of a repository (local storage or the API).
 * Updates and deletes are optimistic and roll back if the repository fails.
 * Pass `repository: null` while it isn't known yet (e.g. before sign-in).
 *
 * When the repository changes (sign-out, another account), the list is
 * cleared and results of requests made with the old one are ignored.
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

  // The repository requests belong to; results for any other one are dropped.
  const repositoryRef = useRef(repository);
  // Only the newest load may write the list.
  const loadIdRef = useRef(0);
  // Per application: id of the newest update, so an older response or
  // rollback can't overwrite a newer edit.
  const updateIdsRef = useRef(new Map<string, number>());
  const nextUpdateIdRef = useRef(0);

  // Reset during render (React's "previous value" pattern) so the old
  // account's list is never shown with the new one.
  const [prevRepository, setPrevRepository] = useState(repository);
  if (prevRepository !== repository) {
    setPrevRepository(repository);
    setAll([]);
    setError(null);
    setIsLoading(repository !== null);
  }
  useLayoutEffect(() => {
    if (repositoryRef.current === repository) return;
    repositoryRef.current = repository;
    updateIdsRef.current = new Map();
  }, [repository]);
  const isCurrent = (repo: ApplicationsRepository | null) => repositoryRef.current === repo;

  const reload = useCallback(async () => {
    const loadId = ++loadIdRef.current;
    const isLatest = () => isCurrent(repository) && loadIdRef.current === loadId;
    if (!repository) {
      setAll([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await repository.list();
      if (!isLatest()) return;
      setAll(list);
      setError(null);
    } catch (e) {
      if (isLatest()) setError(`Couldn't load applications: ${messageOf(e)}`);
    } finally {
      if (isLatest()) setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createApplication = useCallback(
    async (app: Application) => {
      if (!repository) return false;
      setError(null);
      try {
        const saved = await repository.create(app);
        if (!isCurrent(repository)) return false;
        setAll((prev) => [...prev.filter((a) => a.id !== saved.id), saved]);
        return true;
      } catch (e) {
        if (isCurrent(repository)) setError(`Couldn't add "${app.name}": ${messageOf(e)}`);
        return false;
      }
    },
    [repository],
  );

  const updateApplication = useCallback(
    async (id: string, updater: (app: Application) => Application) => {
      const current = allRef.current.find((a) => a.id === id);
      if (!repository || !current) return false;
      const next = updater(current);
      const updateId = ++nextUpdateIdRef.current;
      const updateIds = updateIdsRef.current;
      updateIds.set(id, updateId);
      const isNewest = () => isCurrent(repository) && updateIds.get(id) === updateId;

      setError(null);
      setAll((prev) => prev.map((a) => (a.id === id ? next : a)));
      try {
        const saved = await repository.update(next, current);
        if (isNewest()) setAll((prev) => prev.map((a) => (a.id === id ? saved : a)));
        return true;
      } catch (e) {
        if (isNewest()) {
          setAll((prev) => prev.map((a) => (a.id === id ? current : a)));
        }
        if (isCurrent(repository)) {
          setError(`Couldn't save "${current.name}": ${messageOf(e)}`);
        }
        return false;
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
      if (!repository || !current) return false;
      setError(null);
      setAll((prev) => prev.filter((a) => a.id !== id));
      try {
        await repository.remove(id);
        return true;
      } catch (e) {
        if (isCurrent(repository)) {
          setAll((prev) => [...prev, current]);
          setError(`Couldn't delete "${current.name}": ${messageOf(e)}`);
        }
        return false;
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
