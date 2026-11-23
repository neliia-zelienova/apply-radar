import { Triangle } from "lucide-react";
import cn from "classnames";
import { useCallback } from "react";

export const SortingOption = ({
  name,
  order,
  className,
  onClick,
}: {
  name: string;
  order?: "asc" | "desc";
  className?: string;
  onClick: (order: "asc" | "desc") => void;
}) => {
  const handleSortChange = useCallback(() => {
    onClick(order === "asc" ? "desc" : "asc");
  }, [order, onClick]);

  return (
    <div className={cn(className, "flex")}>
      <button
        onClick={handleSortChange}
        className="flex flex-row items-center justify-between gap-1 cursor-pointer"
      >
        <span className="text-slate-400 dark:text-white/30 font-semibold tracking-wider">
          {name.toUpperCase()}
        </span>
        {order && (
          <Triangle
            className={`h-3 w-3 text-teal-500 transition-transform ${
              order === "desc" ? "rotate-180" : ""
            }`}
          />
        )}
      </button>
    </div>
  );
};
