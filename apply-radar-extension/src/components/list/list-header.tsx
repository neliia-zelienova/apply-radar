import { Search } from "lucide-react";
import { SortingOption } from "./sorting-option";

export const ListHeader = ({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  searchValue,
  updateSearchValue,
}: {
  sortBy: "date" | "companyName" | "status" | "favorite";
  sortOrder: "asc" | "desc";
  onSortByChange: (
    field: "date" | "companyName" | "status" | "favorite"
  ) => void;
  onSortOrderChange: (order: "asc" | "desc") => void;
  searchValue: string;
  updateSearchValue: (value: string) => void;
}) => {
  const handleSortChange = (
    field: "date" | "companyName" | "status" | "favorite",
    order: "asc" | "desc"
  ) => {
    onSortByChange(field);
    onSortOrderChange(order);
  };

  return (
    <div className="font-roboto flex flex-col gap-1">
      <div className="flex flex-row gap-1 items-center rounded-md border border-gray-300 relative mb-4 focus-within:ring-2 focus-within:border-teal-500 focus-within:ring-teal-500/20 px-2 py-1.5 bg-slate-50 dark:bg-neutral-800 focus-within:bg-white dark:focus-within:bg-neutral-700 transition-colors ease-linear duration-150">
        {/* Search applications input */}
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search applications..."
          className="border-0 rounded-none focus:ring-0 focus:outline-0 w-full p-0 rounded-md text-sm bg-transparent placeholder-gray-400 text-gray-900 dark:text-gray-100"
          value={searchValue}
          onChange={(e) => updateSearchValue(e.target.value)}
        />
      </div>
      <div className="-mx-4 p-4 border-b bg-slate-100/50 dark:bg-neutral-700 border-t border-t-gray-200 dark:border-t-gray-600 border-b-gray-100 dark:border-b-gray-500 py-2 relative grid grid-cols-13 items-center justify-center gap-3">
        <SortingOption
          name="Application"
          className="col-span-3 text-sm flex justify-center text-slate-800"
          order={sortBy === "companyName" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") =>
            handleSortChange("companyName", order)
          }
        />

        <SortingOption
          name="Status"
          className="col-span-3 text-sm flex justify-center"
          order={sortBy === "status" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") => handleSortChange("status", order)}
        />

        <SortingOption
          name="Added at"
          className="col-span-3 text-sm flex justify-center"
          order={sortBy === "date" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") => handleSortChange("date", order)}
        />
        <SortingOption
          name="Favorite"
          className="col-span-2 text-sm flex justify-center"
          order={sortBy === "favorite" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") =>
            handleSortChange("favorite", order)
          }
        />
        <h2 className="col-span-2 text-sm flex justify-center text-slate-500 dark:text-gray-100 font-semibold">
          ACTIONS
        </h2>
      </div>
    </div>
  );
};
