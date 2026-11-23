/**
 * Application model for the client apps (extension, future web app), aligned with the API.
 * The API itself still uses its own Prisma/class-validator types and doesn't import this yet.
 *
 * Field names and status values follow the API (`apps/api`), so data can move
 * between client storage and the backend without renaming. Dates are ISO strings,
 * which is how they travel over JSON.
 */

/** Same values as the Prisma `ApplicationStatus` enum in the API. */
export const ApplicationStatus = {
  PENDING: "PENDING",
  INTERVIEW: "INTERVIEW",
  OFFERED: "OFFERED",
  REJECTED: "REJECTED",
} as const;

export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const APPLICATION_STATUSES: readonly ApplicationStatus[] =
  Object.values(ApplicationStatus);

export const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  typeof value === "string" &&
  (APPLICATION_STATUSES as readonly string[]).includes(value);

export interface Interview {
  id: string;
  /** ISO date-time of the interview. */
  scheduledAt: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;

  // Client-only for now (the API doesn't store these yet).
  /** e.g. Screening, Technical, Onsite */
  name?: string;
  /** Zoom/Meet/Maps/office link */
  locationLink?: string;
}

export interface Application {
  id: string;
  /** Company name. */
  name: string;
  description?: string;
  /** Job posting / application link. */
  url: string;
  notes?: string;
  status: ApplicationStatus;
  archived: boolean;
  /** When the user applied (editable), ISO string. */
  createdAt: string;
  updatedAt: string;
  /** Returned by the API list endpoint. */
  interviewCount?: number;
  interviews?: Interview[];

  // Client-only for now (the API doesn't store these yet).
  /** Job title, e.g. "Front-end Engineer". */
  position?: string;
  favorite?: boolean;
}
