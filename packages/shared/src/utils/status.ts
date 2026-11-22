import { ApplicationStatus } from "../types/application";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "Applied",
  [ApplicationStatus.INTERVIEW]: "Interview",
  [ApplicationStatus.OFFERED]: "Offer",
  [ApplicationStatus.REJECTED]: "Rejected",
};

/** User-facing label for a status ("Applied", "Interview", ...). */
export const getStatusLabel = (status: ApplicationStatus): string =>
  STATUS_LABELS[status] ?? "Unknown";
