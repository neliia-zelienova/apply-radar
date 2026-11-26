import { ApplicationStatus } from "@apply-radar/shared";

/** Ring band per status (fraction of the scope's radius): the center is an offer. */
export const STATUS_BAND: Record<ApplicationStatus, [number, number]> = {
  [ApplicationStatus.OFFERED]: [0.08, 0.26],
  [ApplicationStatus.INTERVIEW]: [0.38, 0.54],
  [ApplicationStatus.PENDING]: [0.66, 0.84],
  [ApplicationStatus.REJECTED]: [0.92, 0.97],
};

/** The next stage, closer to the center (none after an offer or a rejection). */
export const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  [ApplicationStatus.PENDING]: ApplicationStatus.INTERVIEW,
  [ApplicationStatus.INTERVIEW]: ApplicationStatus.OFFERED,
};
