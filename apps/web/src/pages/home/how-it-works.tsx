import { useEffect, useState, type ReactNode } from "react";
import { CalendarClock, Crosshair, ListChecks, MousePointerClick, Sparkles } from "lucide-react";
import { ApplicationStatus, getStatusLabel } from "@apply-radar/shared";
import { RadarLogo, useRadarEffects } from "@apply-radar/ui";
import { StatusIcon } from "../../components/radar/status-icon";
import { STATUS_PILL } from "../../components/radar/status-style";

const STEP_MS = 6000;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Mock browser window around a demo. */
const Window = ({ url, children }: { url: string; children: ReactNode }) => (
  <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-[#0b1426] dark:shadow-black/40">
    <div className="flex items-center gap-2 border-b border-black/5 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
      <span className="ml-2 truncate rounded-full bg-black/[0.05] px-3 py-0.5 text-[11px] text-slate-500 dark:bg-white/10 dark:text-slate-400">
        {url}
      </span>
    </div>
    <div className="relative p-4 sm:p-5">{children}</div>
  </div>
);

const Line = ({ width }: { width: string }) => (
  <div className="h-2.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" style={{ width }} />
);

const SpotDemo = () => (
  <Window url="careers.example.com/jobs/senior-frontend-engineer">
    {/* Tall enough for the right-click menu below it on phones. */}
    <div className="min-h-[200px] text-left">
      <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
        Senior Front-end Engineer
      </div>
      <div className="mt-1 text-sm text-gray-500 dark:text-slate-400">
        Northwind Labs · Remote · Full-time
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Line width="92%" />
        <Line width="84%" />
        <Line width="88%" />
        <Line width="60%" />
      </div>
    </div>
    {/* Right-click menu with the extension's item */}
    <div className="demo-pop absolute right-4 top-20 w-60 sm:top-14 rounded-xl border border-black/10 bg-white p-1 text-left text-sm shadow-xl dark:border-white/10 dark:bg-[#0f1829] sm:right-8">
      <div className="rounded-lg px-3 py-1.5 text-gray-400 dark:text-slate-500">Back</div>
      <div className="rounded-lg px-3 py-1.5 text-gray-400 dark:text-slate-500">Reload</div>
      <div className="my-1 h-px bg-black/5 dark:bg-white/10" />
      <div className="flex items-center gap-2 rounded-lg bg-teal-500/12 px-2.5 py-1.5 font-medium text-teal-900 dark:text-teal-100">
        <RadarLogo size={18} />
        Add this job to Apply Radar
      </div>
    </div>
  </Window>
);

const FIELDS = [
  ["Company", "Northwind Labs"],
  ["Position", "Senior Front-end Engineer"],
  ["Link", "careers.example.com/jobs/senior-frontend…"],
] as const;

const SaveDemo = () => (
  <Window url="Apply Radar · Add from this page">
    <div className="flex flex-col gap-3 text-left">
      {FIELDS.map(([label, value], i) => (
        <div key={label} className="demo-fill" style={{ animationDelay: `${i * 220}ms` }}>
          <div className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</div>
          <div className="mt-1 truncate rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-sm text-gray-900 dark:border-white/12 dark:bg-white/[0.05] dark:text-slate-100">
            {value}
          </div>
        </div>
      ))}
      <div className="demo-fill flex items-center gap-2" style={{ animationDelay: "660ms" }}>
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Status</span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_PILL[ApplicationStatus.PENDING]}`}
        >
          {getStatusLabel(ApplicationStatus.PENDING)}
        </span>
      </div>
      <div
        className="demo-fill rounded-xl border border-teal-500/25 bg-teal-500/[0.07] px-3 py-2 text-xs text-teal-900 dark:text-teal-100"
        style={{ animationDelay: "880ms" }}
      >
        <div className="flex items-center gap-1.5 font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          AI summary <span className="font-normal opacity-75">(Google accounts)</span>
        </div>
        <p className="mt-1 opacity-90">
          Remote role on the web platform team. React, TypeScript, design systems.
        </p>
      </div>
    </div>
  </Window>
);

const ROWS = [
  { company: "Northwind Labs", position: "Senior Front-end Engineer", status: ApplicationStatus.INTERVIEW, extra: "Technical · Thu, 14:00" },
  { company: "Copperleaf", position: "Full-stack Developer", status: ApplicationStatus.OFFERED, extra: "Offer · reply by Friday" },
  { company: "Bluefin Health", position: "Product Designer", status: ApplicationStatus.PENDING, extra: "Applied 2 days ago" },
  { company: "Harbor & Co", position: "QA Engineer", status: ApplicationStatus.REJECTED, extra: "Closed" },
];

const TrackDemo = () => (
  <Window url="Apply Radar · Dashboard">
    <div className="flex flex-col gap-2 text-left">
      {ROWS.map((row, i) => (
        <div
          key={row.company}
          className="demo-fill flex items-center gap-3 rounded-xl border border-black/5 bg-black/[0.02] px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]"
          style={{ animationDelay: `${i * 160}ms` }}
        >
          <StatusIcon status={row.status} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
              {row.company}
            </div>
            <div className="truncate text-xs text-gray-500 dark:text-slate-400">{row.position}</div>
          </div>
          <span className="hidden items-center gap-1 text-xs text-gray-500 sm:flex dark:text-slate-400">
            {row.status === ApplicationStatus.INTERVIEW && <CalendarClock className="h-3.5 w-3.5" />}
            {row.extra}
          </span>
        </div>
      ))}
    </div>
  </Window>
);

const STEPS = [
  {
    icon: Crosshair,
    title: "Spot a job",
    text: "On any job posting, open Apply Radar or right-click the page.",
    demo: SpotDemo,
  },
  {
    icon: MousePointerClick,
    title: "Save it in one click",
    text: "Company, position and link are filled in for you. Check them and save.",
    demo: SaveDemo,
  },
  {
    icon: ListChecks,
    title: "Track every stage",
    text: "Applied, interview, offer: see where everything stands, in the extension or the web dashboard.",
    demo: TrackDemo,
  },
] as const;

/** Three steps with a mock of each; they advance by themselves until you pick one. */
export const HowItWorks = () => {
  const { enabled: effects } = useRadarEffects();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || !effects || prefersReducedMotion()) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % STEPS.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [active, auto, effects]);

  const Demo = STEPS[active].demo;

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div role="tablist" aria-label="How it works" className="flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === active;
          return (
            <button
              key={step.title}
              type="button"
              role="tab"
              id={`how-step-${i}`}
              aria-selected={isActive}
              aria-controls="how-panel"
              onClick={() => {
                setActive(i);
                setAuto(false);
              }}
              className={`relative cursor-pointer overflow-hidden rounded-2xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 ${
                isActive
                  ? "border-teal-500/40 bg-white shadow-lg shadow-teal-900/5 dark:border-teal-400/30 dark:bg-[#0f1829]"
                  : "border-black/5 bg-white/60 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-teal-600 text-white"
                      : "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                    Step {i + 1}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-slate-100">{step.title}</div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">{step.text}</p>
                </div>
              </div>
              {/* Time left on this step while it advances by itself */}
              {isActive && auto && effects && (
                <span
                  key={active}
                  aria-hidden
                  className="demo-progress absolute bottom-0 left-0 h-0.5 bg-teal-500"
                  style={{ animationDuration: `${STEP_MS}ms` }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        id="how-panel"
        role="tabpanel"
        aria-labelledby={`how-step-${active}`}
        data-radar-avoid
      >
        {/* Remount so each step's entrance animation plays again */}
        <Demo key={active} />
      </div>
    </div>
  );
};
