import { useState } from "react";
import { SortingOption } from "./sorting-option";

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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
  const [focused, setFocused] = useState(false);

  const handleSortChange = (
    field: "date" | "companyName" | "status" | "favorite",
    order: "asc" | "desc"
  ) => {
    onSortByChange(field);
    onSortOrderChange(order);
  };

  return (
    <div className="flex flex-col" style={{ fontFamily: "Roboto, sans-serif" }}>
      {/* Search bar — pill shaped */}
      <div style={{ padding: "14px 12px 10px" }}>
        <div
          className="flex items-center gap-2"
          style={{
            padding: "9px 14px",
            borderRadius: "9999px",
            background: "rgba(128,128,128,0.04)",
            border: `1.5px solid ${
              focused
                ? "rgba(20,184,166,0.6)"
                : "var(--border-subtle)"
            }`,
            boxShadow: focused
              ? "0 0 0 3px rgba(20,184,166,0.12)"
              : "inset 0 1px 2px rgba(0,0,0,0.06)",
            transition: "all 0.18s ease",
          }}
        >
          <div
            style={{
              color: focused ? "rgba(20,184,166,0.8)" : undefined,
              flexShrink: 0,
              transition: "color 0.18s",
            }}
            className={focused ? "" : "text-gray-400 dark:text-white/25"}
          >
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search applications…"
            className="border-0 focus:ring-0 focus:outline-0 w-full p-0 bg-transparent placeholder-gray-400 dark:placeholder-white/20 text-gray-800 dark:text-white/80"
            style={{ fontSize: "12px", fontFamily: "Roboto, sans-serif" }}
            value={searchValue}
            onChange={(e) => updateSearchValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 140px 80px 36px 72px",
          gap: "8px",
          padding: "0 10px 8px 15px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <SortingOption
          name="Application"
          className="text-[10px] flex justify-start"
          order={sortBy === "companyName" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") =>
            handleSortChange("companyName", order)
          }
        />
        <SortingOption
          name="Status"
          className="text-[10px] flex justify-start"
          order={sortBy === "status" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") =>
            handleSortChange("status", order)
          }
        />
        <SortingOption
          name="Added"
          className="text-[10px] flex justify-center"
          order={sortBy === "date" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") => handleSortChange("date", order)}
        />
        <SortingOption
          name="Fav"
          className="text-[10px] flex justify-center"
          order={sortBy === "favorite" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") =>
            handleSortChange("favorite", order)
          }
        />
        <h2 className="text-[10px] flex justify-center items-center text-slate-400 dark:text-white/25 font-semibold tracking-wider">
          ACT
        </h2>
      </div>
    </div>
  );
};
