import {
  ApplicationStatus,
  isApplicationStatus,
  type Application,
  type Interview,
} from "@apply-radar/shared";

/**
 * Converts applications saved by older extension versions to the shared,
 * API-aligned model (`@apply-radar/shared`):
 *   companyName -> name, link -> url, "pending" -> "PENDING",
 *   interview.date -> interview.scheduledAt, archived defaults to false.
 * Unknown fields are kept. Records already in the new shape are returned untouched.
 */

type StoredRecord = Record<string, unknown>;

const LEGACY_STATUS: Record<string, ApplicationStatus> = {
  pending: ApplicationStatus.PENDING,
  interview: ApplicationStatus.INTERVIEW,
  offered: ApplicationStatus.OFFERED,
  rejected: ApplicationStatus.REJECTED,
};

const isRecord = (value: unknown): value is StoredRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toStatus = (value: unknown): ApplicationStatus => {
  if (isApplicationStatus(value)) return value;
  if (typeof value === "string") {
    const legacy = LEGACY_STATUS[value.toLowerCase()];
    if (legacy) return legacy;
  }
  return ApplicationStatus.PENDING;
};

const isCurrentInterview = (value: unknown): boolean =>
  isRecord(value) && typeof value.scheduledAt === "string" && !("date" in value);

/** True when the record already matches the current model (nothing to migrate). */
const isCurrentApplication = (value: unknown): value is Application =>
  isRecord(value) &&
  typeof value.name === "string" &&
  typeof value.url === "string" &&
  isApplicationStatus(value.status) &&
  typeof value.archived === "boolean" &&
  !("companyName" in value) &&
  !("link" in value) &&
  (value.interviews === undefined ||
    (Array.isArray(value.interviews) &&
      value.interviews.every(isCurrentInterview)));

const migrateInterview = (raw: StoredRecord): Interview => {
  const { date, ...rest } = raw;
  return {
    ...rest,
    id: String(rest.id ?? ""),
    scheduledAt: String(rest.scheduledAt ?? date ?? ""),
  } as Interview;
};

export const migrateApplication = (raw: StoredRecord): Application => {
  const { companyName, link, ...rest } = raw;
  const now = new Date().toISOString();
  const createdAt = typeof rest.createdAt === "string" ? rest.createdAt : now;
  return {
    ...rest, // keeps position, favorite, notes and anything we don't know about
    id: String(rest.id ?? ""),
    name: String(rest.name ?? companyName ?? ""),
    url: String(rest.url ?? link ?? ""),
    status: toStatus(rest.status),
    archived: rest.archived === true,
    createdAt,
    updatedAt: typeof rest.updatedAt === "string" ? rest.updatedAt : createdAt,
    ...(Array.isArray(rest.interviews) && {
      interviews: rest.interviews.filter(isRecord).map(migrateInterview),
    }),
  } as Application;
};

/**
 * Normalizes whatever is stored under the applications key.
 * `changed` is true when at least one record had to be converted (caller should persist).
 */
export const migrateStoredApplications = (
  raw: unknown,
): { applications: Application[]; changed: boolean } => {
  if (!Array.isArray(raw)) return { applications: [], changed: false };
  let changed = false;
  const applications = raw.filter(isRecord).map((item) => {
    if (isCurrentApplication(item)) return item;
    changed = true;
    return migrateApplication(item);
  });
  if (applications.length !== raw.length) changed = true;
  return { applications, changed };
};
