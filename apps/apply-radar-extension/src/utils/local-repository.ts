import type { Application, ApplicationsRepository } from "@apply-radar/shared";
import { getFromStorage, setInStorage } from "./storage";
import { migrateStoredApplications } from "./migrate-applications";

const STORAGE_KEY = "applications";
/** Raw copy of the data as it was before the first migration to the shared model. */
const BACKUP_KEY = "applications_backup_before_shared_model";

/** Reads applications saved on this device, migrating (and persisting) old-format records. */
export const readLocalApplications = async (): Promise<Application[]> => {
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

const writeLocalApplications = (applications: Application[]) =>
  setInStorage(STORAGE_KEY, applications);

/** "Device only" mode: applications live in chrome.storage.local. */
export const localRepository: ApplicationsRepository = {
  list: readLocalApplications,
  async create(app) {
    const apps = await readLocalApplications();
    await writeLocalApplications([...apps, app]);
    return app;
  },
  async update(app) {
    const apps = await readLocalApplications();
    await writeLocalApplications(apps.map((a) => (a.id === app.id ? app : a)));
    return app;
  },
  async remove(id) {
    const apps = await readLocalApplications();
    await writeLocalApplications(apps.filter((a) => a.id !== id));
  },
};
