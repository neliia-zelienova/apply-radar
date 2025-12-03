import { SortingOption } from "./sorting-option";

export const ListHeader = ({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: {
  sortBy: "date" | "name" | "status" | "favorite";
  sortOrder: "asc" | "desc";
  onSortByChange: (field: "date" | "name" | "status" | "favorite") => void;
  onSortOrderChange: (order: "asc" | "desc") => void;
}) => {
  const handleSortChange = (
    field: "date" | "name" | "status" | "favorite",
    order: "asc" | "desc"
  ) => {
    console.log(`Sorting by ${field} in ${order} order`);
    onSortByChange(field);
    onSortOrderChange(order);
  };

  return (
    <div className="font-roboto p-3 flex flex-col gap-1">
      <div className="relative grid grid-cols-9 items-center justify-center gap-3">
        <SortingOption
          name="Application name"
          className="col-span-3 text-sm flex justify-center"
          order={sortBy === "name" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") => handleSortChange("name", order)}
        />

        <SortingOption
          name="Status"
          className="col-span-1 text-sm flex justify-center"
          order={sortBy === "status" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") => handleSortChange("status", order)}
        />

        <SortingOption
          name="Added at"
          className="col-span-2 text-sm flex justify-center"
          order={sortBy === "date" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") => handleSortChange("date", order)}
        />
        <h2 className="col-span-1 text-sm flex justify-center">Link</h2>
        <SortingOption
          name="Favorite"
          className="col-span-1 text-sm flex justify-center"
          order={sortBy === "favorite" ? sortOrder : undefined}
          onClick={(order: "asc" | "desc") =>
            handleSortChange("favorite", order)
          }
        />
      </div>
    </div>
  );
};
