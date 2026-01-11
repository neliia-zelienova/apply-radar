import { ApplicationStatus } from "../types/applications";

export const getStatusLabel = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return "Applied";
    case ApplicationStatus.INTERVIEW:
      return "Interview";
    case ApplicationStatus.OFFERED:
      return "Offer";
    case ApplicationStatus.REJECTED:
      return "Rejected";
    default:
      return "Unknown";
  }
};
