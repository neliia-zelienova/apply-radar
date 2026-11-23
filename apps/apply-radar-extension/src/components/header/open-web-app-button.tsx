import { LayoutDashboard } from "lucide-react";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "@apply-radar/ui";
import { openWebApp } from "../../services/web-app";

const idle = {
  background: "rgba(255,255,255,0.06)",
  color: "rgba(148,163,184,0.8)",
};
const hover = { background: "rgba(20,184,166,0.15)", color: "#5eead4" };

/** Header icon that opens (or focuses) the web dashboard in a browser tab. */
export const OpenWebAppButton = () => (
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Open web dashboard"
          onClick={() => void openWebApp()}
          className="cursor-pointer flex items-center justify-center"
          style={{
            ...idle,
            width: "36px",
            height: "36px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "9999px",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, hover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, idle)}
        >
          <LayoutDashboard className="h-[17px] w-[17px]" style={{ strokeWidth: 1.8 }} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Open web dashboard</TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
);
