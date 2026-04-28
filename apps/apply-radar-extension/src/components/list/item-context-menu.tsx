import * as React from "react";
import {
  DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { useThemeContext } from "../../context/theme-context";

interface ItemContextMenuProps {
  itemId: string;
  options: Array<{
    label: string;
    icon: React.ReactNode;
    action: (itemId: string) => void;
    danger?: boolean;
    muted?: boolean;
  }>;
}

export const ItemContextMenu = ({ itemId, options }: ItemContextMenuProps) => {
  const { theme } = useThemeContext();
  const dark = theme === "dark";

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button className="mx-auto cursor-pointer rounded-md p-2 hover:bg-teal-300/20 h-fit">
          <EllipsisVertical className="h-4 w-4 text-gray-900 dark:text-teal-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col bg-white dark:bg-[#0f1829] gap-0.5 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg p-1">
        {options.map((option) => (
          <DropdownMenuItem
            key={`context-menu-item-${option.label}`}
            className="grid grid-cols-[auto_1fr] items-center gap-2 border-none outline-none p-2 rounded-md cursor-pointer transition-colors"
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
