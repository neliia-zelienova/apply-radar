import { useMemo } from "react";
import {
  ApplicationStatus,
  getDaysSince,
  type Application,
} from "@apply-radar/shared";

/** Same threshold as the amber "no response" pill in the list. */
const STALE_AFTER_DAYS = 7;

const Stat = ({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent: string;
}) => (
  <div
    className="rounded-xl border border-black/5 bg-white px-4 py-3 text-left shadow-sm dark:border-white/10 dark:bg-[#0f1829]"
    title={hint}
  >
    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
      {label}
    </div>
    <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: accent }}>
      {value}
    </div>
  </div>
);

/** Headline numbers for non-archived applications. */
export const StatsRow = ({ applications }: { applications: Application[] }) => {
  const stats = useMemo(() => {
    const active = applications.filter((a) => !a.archived);
    const count = (status: ApplicationStatus) =>
      active.filter((a) => a.status === status).length;
    return {
      total: active.length,
      pending: count(ApplicationStatus.PENDING),
      stale: active.filter(
        (a) =>
          a.status === ApplicationStatus.PENDING &&
          getDaysSince(a.createdAt) >= STALE_AFTER_DAYS,
      ).length,
      interviews: count(ApplicationStatus.INTERVIEW),
      offers: count(ApplicationStatus.OFFERED),
      rejected: count(ApplicationStatus.REJECTED),
    };
  }, [applications]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label="Total" value={stats.total} accent="#0d9488" />
      <Stat label="Waiting" value={stats.pending} accent="#ca8a04" hint="Applied, no answer yet" />
      <Stat
        label={`No reply ${STALE_AFTER_DAYS}d+`}
        value={stats.stale}
        accent="#d97706"
        hint={`Applied ${STALE_AFTER_DAYS}+ days ago with no answer — consider following up`}
      />
      <Stat label="Interviews" value={stats.interviews} accent="#0d9488" />
      <Stat label="Offers" value={stats.offers} accent="#10b981" />
      <Stat label="Rejected" value={stats.rejected} accent="#dc2626" />
    </div>
  );
};
