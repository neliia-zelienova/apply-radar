import * as React from "react";
import { DropdownMenuRoot, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { useThemeContext } from "../context/theme-context";

interface ItemContextMenuProps {
  itemId: string;
  /** Accessible name of the trigger, e.g. "Actions for Acme". */
  label?: string;
  /** Extra classes for the trigger button (e.g. its grid area). */
  className?: string;
  options: Array<{
    label: string;
    icon: React.ReactNode;
    action: (itemId: string) => void;
    danger?: boolean;
    muted?: boolean;
  }>;
}

export const ItemContextMenu = ({ itemId, options, label = "Actions", className = "" }: ItemContextMenuProps) => {
  const { theme } = useThemeContext();
  const dark = theme === "dark";

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button aria-label={label} className={`${className} mx-auto cursor-pointer rounded-full p-2 hover:bg-teal-300/20 h-fit`}>
          <EllipsisVertical className="h-4 w-4 text-gray-900 dark:text-teal-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        // The trigger sits at the far right of the row; centering the menu on it
        // pushed half of it past the popup edge (under the scrollbar).
        align="end"
        sideOffset={4}
        collisionPadding={8}
        className="flex flex-col bg-white dark:bg-[#0f1829] gap-0.5 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-1">
        {options.map((option) => (
          <DropdownMenuItem
            key={`context-menu-item-${option.label}`}
            className="grid grid-cols-[auto_1fr] items-center gap-2 border-none outline-none p-2 rounded-lg cursor-pointer transition-colors"
            style={{
              color: option.danger
                ? "#ef4444"
                : option.muted
                  ? dark
                    ? "#475569"
                    : "#94a3b8"
                  : dark
                    ? "#e2e8f0"
                    : "#1e293b",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = option.danger
                ? "rgba(239,68,68,0.08)"
                : dark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            onSelect={() => option.action(itemId)}
          >
            {React.isValidElement(option.icon)
              ? React.cloneElement(
                  option.icon as React.ReactElement<{ className?: string; "aria-hidden"?: boolean }>,
                  {
                    className: `h-4 w-4 ${
                      option.danger
                        ? "text-red-400"
                        : option.muted
                          ? "text-gray-400 dark:text-slate-600"
                          : "text-gray-500 dark:text-gray-200"
                    }`,
                    "aria-hidden": true,
                  }
                )
              : option.icon}
            {option.label && (
              <span className="text-sm font-medium">{option.label}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
