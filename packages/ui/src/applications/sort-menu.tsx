import type { ReactNode } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarDays,
  Check,
  CircleDot,
  Star,
  Type,
} from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "../dropdown-menu";

type SortField = "date" | "name" | "status" | "favorite";
type SortOrder = "asc" | "desc";

const FIELDS: Array<{ value: SortField; label: string; icon: ReactNode }> = [
  { value: "name", label: "Name", icon: <Type className="h-4 w-4" /> },
  { value: "date", label: "Applied date", icon: <CalendarDays className="h-4 w-4" /> },
  { value: "status", label: "Status", icon: <CircleDot className="h-4 w-4" /> },
  { value: "favorite", label: "Favorite", icon: <Star className="h-4 w-4" /> },
];

const ORDERS: Array<{ value: SortOrder; label: string; icon: ReactNode }> = [
  { value: "asc", label: "Ascending", icon: <ArrowUpNarrowWide className="h-4 w-4" /> },
  { value: "desc", label: "Descending", icon: <ArrowDownWideNarrow className="h-4 w-4" /> },
];

const labelClass =
  "px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500";
const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none " +
  "data-[highlighted]:bg-black/5 dark:text-slate-200 dark:data-[highlighted]:bg-white/5";
const selectedClass = "bg-teal-500/10 dark:bg-teal-400/10";

/**
 * Round button that opens the sort options. Used where the column headers
 * don't fit (narrow list); stays open while picking field and order.
 */
export const SortMenu = ({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  className = "",
}: {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortByChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  className?: string;
}) => {
  const option = (
    key: string,
    label: string,
    icon: ReactNode,
    selected: boolean,
    onSelect: () => void,
  ) => (
    <DropdownMenuItem
      key={key}
      className={`${itemClass} ${selected ? selectedClass : ""}`}
      // Keep the menu open so field and order can be picked in one go.
      onSelect={(event) => {
        event.preventDefault();
        onSelect();
      }}
    >
      <span className="text-gray-500 dark:text-slate-400">{icon}</span>
      <span className="flex-1">{label}</span>
      {selected && <Check aria-hidden className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
    </DropdownMenuItem>
  );

  const current = FIELDS.find((f) => f.value === sortBy)?.label ?? "";
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Sort: ${current}, ${sortOrder === "asc" ? "ascending" : "descending"}`}
          className={`${className} h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 text-gray-600 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5`}
        >
          {sortOrder === "asc" ? (
            <ArrowUpNarrowWide className="h-4 w-4" />
          ) : (
            <ArrowDownWideNarrow className="h-4 w-4" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        collisionPadding={8}
        className="min-w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-[#0f1829]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className={labelClass}>Sort by</DropdownMenuLabel>
          {FIELDS.map((f) =>
            option(f.value, f.label, f.icon, sortBy === f.value, () => onSortByChange(f.value)),
          )}
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel className={labelClass}>Order</DropdownMenuLabel>
          {ORDERS.map((o) =>
            option(o.value, o.label, o.icon, sortOrder === o.value, () => onSortOrderChange(o.value)),
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
