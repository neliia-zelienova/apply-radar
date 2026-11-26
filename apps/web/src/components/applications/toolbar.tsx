import type { ReactNode } from "react";
import { Archive, Search } from "lucide-react";
import { APPLICATION_STATUSES, getStatusLabel, type ApplicationStatus } from "@apply-radar/shared";
import { BLIP_DOT, STATUS_PILL } from "../radar/status-style";

/** Search, status chips (counts that double as filters) and view-specific controls, above the list and the radar. */
export const ApplicationsToolbar = ({
  search,
  onSearch,
  counts,
  hidden,
  onToggleStatus,
  archived,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  counts: Record<ApplicationStatus, number>;
  hidden: ReadonlySet<ApplicationStatus>;
  onToggleStatus: (status: ApplicationStatus) => void;
  /** List only: the "Archived" chip. */
  archived?: { count: number; shown: boolean; onToggle: () => void };
  /** Right side, e.g. the sort menu. */
  children?: ReactNode;
}) => (
  <div data-radar-avoid className="flex flex-col gap-3 lg:flex-row lg:items-center">
    <label className="relative w-full lg:max-w-xs">
      <span className="sr-only">Search applications</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search applications…"
        className="h-10 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 dark:text-slate-100 dark:placeholder-slate-500"
      />
    </label>

    <div className="flex flex-1 flex-wrap items-center gap-2" role="group" aria-label="Show statuses">
      {APPLICATION_STATUSES.map((status) => {
        const off = hidden.has(status);
        return (
          <button
            key={status}
            type="button"
            aria-pressed={!off}
            onClick={() => onToggleStatus(status)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-opacity ${STATUS_PILL[status]} ${off ? "opacity-40 line-through" : ""}`}
          >
            <span className={`h-2 w-2 rounded-full ${BLIP_DOT[status]}`} />
            {getStatusLabel(status)}
            <span className="tabular-nums opacity-80">{counts[status]}</span>
          </button>
        );
      })}
      {archived && archived.count > 0 && (
        <button
          type="button"
          aria-pressed={archived.shown}
          onClick={archived.onToggle}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
            archived.shown
              ? "bg-slate-500/15 text-slate-800 ring-slate-500/30 dark:text-slate-200"
              : "text-slate-500 ring-black/10 hover:bg-black/[0.04] dark:text-slate-400 dark:ring-white/15 dark:hover:bg-white/[0.06]"
          }`}
        >
          <Archive className="h-3 w-3" />
          Archived
          <span className="tabular-nums opacity-80">{archived.count}</span>
        </button>
      )}
    </div>

    {children}
  </div>
);
