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
        return "radar-no-target m-auto";
      case ApplicationStatus.INTERVIEW:
        return "radar-weak-lock m-auto";
      case ApplicationStatus.OFFERED:
        return "radar-strong-lock m-auto";
      case ApplicationStatus.REJECTED:
        return "radar-lost m-auto";
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
