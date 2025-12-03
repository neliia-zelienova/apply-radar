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
    if (!order || order === "desc") {
      onClick("asc");
    }
    if (order === "asc") {
      onClick("desc");
    }
  }, [order, onClick]);

  return (
    <div className={cn(className, "flex")}>
      <button
        onClick={handleSortChange}
        className="flex flex-row items-center gap-1 cursor-pointer"
      >
        <span>{name}</span>
        {order === "asc" && (
          <Triangle
            className={cn("h-3 w-3", { "text-blue-500": className === "asc" })}
          />
        )}
        {order === "desc" && (
          <Triangle
            className={cn("h-3 w-3 rotate-180", {
              "text-blue-500": className === "desc",
            })}
          />
        )}
      </button>
    </div>
  );
};
