import { useRef } from "react";
import { useApplicationContext } from "../../context/applications-context";
import { ApplicationItem } from "../list/application-item";
import { ListHeader } from "../list/list-header";

export const Content = () => {
  const {
    updateApplication,
    archiveApplication,
    deleteApplication,
    applications,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    search,
    setSearch,
  } = useApplicationContext();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <main className="-mt-6 p-4 overflow-hidden">
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
        <ListHeader
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          searchValue={search}
          updateSearchValue={setSearch}
        />
        <div
          ref={scrollAreaRef}
          className="flex flex-col gap-3 overflow-y-auto"
          style={{
            maxHeight: `calc(100vh - ${
              scrollAreaRef.current?.offsetTop ?? 0
            }px - 2rem)`,
          }}
        >
          {applications.length > 0 ? (
            applications.map((app) => (
              <ApplicationItem
                key={app.id}
                app={app}
                updateApp={updateApplication}
                archiveApp={archiveApplication}
                deleteApp={deleteApplication}
              />
            ))
          ) : (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
              {search.length > 0
                ? `No applications found for "${search}"`
                : "No applications added. Start by adding a new application!"}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
