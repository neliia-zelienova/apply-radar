import { ApplicationStatus, getStatusLabel } from "@apply-radar/shared";
import { STATUS_ICON } from "./status-style";

/** The extension's animated status icon, without its tooltip (for demos). */
export const StatusIcon = ({ status }: { status: ApplicationStatus }) => (
  <div
    role="img"
    aria-label={getStatusLabel(status)}
    className={`${STATUS_ICON[status]} shrink-0`}
  >
    {status !== ApplicationStatus.REJECTED && <div className="radar-ring" />}
  </div>
);
