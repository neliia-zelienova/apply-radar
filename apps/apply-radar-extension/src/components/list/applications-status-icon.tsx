import { ApplicationStatus } from "../../types/applications";
import { TooltipContent, TooltipRoot, TooltipTrigger } from "../ui/tooltip";

export const ApplicationStatusIcon = ({
  status,
}: {
  status?: ApplicationStatus;
}) => {
  const buttonClassName = (status?: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "radar-no-target flex-shrink-0";
      case ApplicationStatus.INTERVIEW:
        return "radar-weak-lock flex-shrink-0";
      case ApplicationStatus.OFFERED:
        return "radar-strong-lock flex-shrink-0";
      case ApplicationStatus.REJECTED:
        return "radar-lost flex-shrink-0";
      default:
        return "";
    }
  };

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <div className={buttonClassName(status)}>
          {status !== ApplicationStatus.REJECTED ? (
            <div className="radar-ring"></div>
          ) : null}
        </div>
      </TooltipTrigger>
      <TooltipContent align="center">
        Current status: {status}. Click to change
      </TooltipContent>
    </TooltipRoot>
  );
};
