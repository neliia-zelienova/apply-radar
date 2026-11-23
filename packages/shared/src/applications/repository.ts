import type { Application, ApplicationStatus } from "../types/application";
import type { ApiClient } from "../api/client";

/**
 * Where an app keeps its applications. The extension has a local
 * (chrome.storage) one for "device only" mode; signed-in users use the API one.
 */
export interface ApplicationsRepository {
  list(): Promise<Application[]>;
  /** Returns the stored application (the API may fill in fields). */
  create(app: Application): Promise<Application>;
  /**
   * Saves `next`. `previous` is the version it was edited from, so a remote
   * repository can send only what changed.
   */
  update(next: Application, previous: Application): Promise<Application>;
  remove(id: string): Promise<void>;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Fields of `next` that differ from `previous`. Interviews are sent only when
 * they were edited: the API treats a sent list as a full replacement, so
 * sending a stale copy along with e.g. a favorite toggle would delete
 * interviews added elsewhere (web app vs extension).
 */
export const changedFields = (
  next: Application,
  previous: Application,
): Partial<Application> =>
  Object.fromEntries(
    (Object.keys(next) as Array<keyof Application>)
      .filter((key) => key !== "id" && !same(next[key], previous[key]))
      .map((key) => [key, next[key]]),
  ) as Partial<Application>;

/** Repository backed by the Apply Radar API. */
export const createRemoteRepository = (
  api: Pick<ApiClient, "applications">,
): ApplicationsRepository => ({
  list: () => api.applications.list(),
  create: (app) => api.applications.create(app),
  update: async (next, previous) => {
    const changes = changedFields(next, previous);
    return Object.keys(changes).length > 0
      ? api.applications.update(next.id, changes)
      : next;
  },
  remove: (id) => api.applications.remove(id),
});

export type ApplicationSortField = "name" | "date" | "status" | "favorite";

export interface ApplicationQuery {
  search: string;
  /** "All" or a status. */
  filterStatus: "All" | ApplicationStatus | string;
  sortBy: ApplicationSortField;
  sortOrder: "asc" | "desc";
}

/** Search (company name), status filter and sort — same rules in every app. */
export const filterAndSortApplications = (
  applications: Application[],
  { search, filterStatus, sortBy, sortOrder }: ApplicationQuery,
): Application[] => {
  const needle = search.trim().toLowerCase();
  const direction = sortOrder === "asc" ? 1 : -1;

  return applications
    .filter(
      (app) =>
        app.name.toLowerCase().includes(needle) &&
        (filterStatus === "All" || app.status === filterStatus),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "status":
          return direction * a.status.localeCompare(b.status);
        case "favorite":
          return direction * (Number(!!a.favorite) - Number(!!b.favorite));
        case "date":
          return (
            direction *
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          );
        default:
          return 0;
      }
    });
};
