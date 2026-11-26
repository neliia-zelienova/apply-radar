import { LayoutDashboard } from "lucide-react";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "@apply-radar/ui";
import { openWebApp } from "../../services/web-app";

/** Header icon that opens (or focuses) the web dashboard in a browser tab. */
export const OpenWebAppButton = () => (
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Open web dashboard"
          onClick={() => void openWebApp()}
          // Light or dark with the theme (styles.css).
          className="header-icon-button h-9 w-9"
        >
          <LayoutDashboard className="h-[17px] w-[17px]" style={{ strokeWidth: 1.8 }} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Open web dashboard</TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
);
