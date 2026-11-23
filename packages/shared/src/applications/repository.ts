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
  update(app: Application): Promise<Application>;
  remove(id: string): Promise<void>;
}

/** Repository backed by the Apply Radar API. */
export const createRemoteRepository = (
  api: Pick<ApiClient, "applications">,
): ApplicationsRepository => ({
  list: () => api.applications.list(),
  create: (app) => api.applications.create(app),
  update: (app) => api.applications.update(app.id, app),
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
