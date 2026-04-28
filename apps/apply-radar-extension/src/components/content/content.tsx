import { useRef } from "react";
import { useApplicationContext } from "../../context/applications-context";
import { ApplicationItem } from "../list/application-item";
import { ListHeader } from "../list/list-header";

const EmptyState = ({ search }: { search: string }) => (
  <div
    style={{
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div style={{ position: "relative", width: "72px", height: "72px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: `${i * 10}px`,
            border: `1.5px solid rgba(20,180,160,${0.35 - i * 0.1})`,
            borderRadius: "50%",
            animation: `pulse-ring ${2 + i * 0.6}s ease-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: "28px",
          background:
            "radial-gradient(circle, rgba(20,180,160,0.6), rgba(20,180,160,0.2))",
          borderRadius: "50%",
          animation: "radar-center-pulse 1.4s ease-in-out infinite alternate",
        }}
      />
    </div>
    <div style={{ textAlign: "center" }}>
      <div
        className="text-gray-400 dark:text-slate-500"
        style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}
      >
        {search ? `No results for "${search}"` : "No applications yet"}
      </div>
      <div
        className="text-gray-300 dark:text-slate-700"
        style={{ fontSize: "12px" }}
      >
        {search
          ? "Try a different search term"
          : "Add your first application to start tracking"}
      </div>
    </div>
  </div>
);

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
    <main
      style={{
        marginTop: "-18px",
        padding: "0 12px 12px",
        position: "relative",
        zIndex: 3,
      }}
    >
      <div
        style={{
          borderRadius: "14px",
          background: "var(--surface-card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
          className="custom-scroll flex flex-col overflow-y-auto"
          style={{
            maxHeight: `calc(100vh - ${
              scrollAreaRef.current?.offsetTop ?? 0
            }px - 1.5rem)`,
            padding: "8px",
          }}
        >
          {applications.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {applications.map((app) => (
                <ApplicationItem
                  key={app.id}
                  app={app}
                  updateApp={updateApplication}
                  archiveApp={archiveApplication}
                  deleteApp={deleteApplication}
                />
              ))}
            </div>
          ) : (
            <EmptyState search={search} />
          )}
        </div>
      </div>
    </main>
  );
};
