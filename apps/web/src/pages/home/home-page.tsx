import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Cloud,
  HardDrive,
  LayoutDashboard,
  MousePointerClick,
  Puzzle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { buttonClasses } from "@apply-radar/ui";
import { useDocumentTitle } from "../../hooks/use-document-title";
import { useSessionContext } from "../../session-context";
import { HowItWorks } from "./how-it-works";
import { RadarScope } from "./radar-scope";

const FEATURES: { icon: LucideIcon; title: string; text: string; badge?: string }[] = [
  {
    icon: MousePointerClick,
    title: "Save in one click",
    text: "Add the job you're looking at from the popup, the side panel or a right-click. No copy-paste.",
  },
  {
    icon: CalendarClock,
    title: "Interviews in one place",
    text: "Date, type and the meeting link sit next to the application, so you're never hunting through emails.",
  },
  {
    icon: Star,
    title: "Notes and favorites",
    text: "Write down what matters for each role and star the ones you're most excited about.",
  },
  {
    icon: Search,
    title: "Find anything fast",
    text: "Search, filter by status and sort. Archive what's done to keep the list short.",
  },
  {
    icon: LayoutDashboard,
    title: "Extension + web dashboard",
    text: "Sign in with Google and the same applications show up in every browser and on the web.",
  },
  {
    icon: Sparkles,
    title: "AI fill from job pages",
    text: "A short summary of the role is written into your notes when you add a job.",
    badge: "Google accounts",
  },
];

const MODES = {
  device: {
    icon: HardDrive,
    label: "No account",
    title: "Start in seconds",
    points: [
      "Install the extension and start saving jobs",
      "Applications stay in this browser only",
      "Sign in later: they're copied to your account",
    ],
  },
  google: {
    icon: Cloud,
    label: "With Google",
    title: "Everywhere you search",
    points: [
      "Synced across all your browsers",
      "The web dashboard and AI fill from job pages",
      "Backed up to your account",
    ],
  },
} as const;

/** A section title with a small "blip" eyebrow. */
const SectionTitle = ({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) => (
  <div data-radar-avoid className="mx-auto max-w-2xl text-center">
    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]" />
      {eyebrow}
    </div>
    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
      {title}
    </h2>
    {text && <p className="mt-3 text-gray-600 dark:text-slate-400">{text}</p>}
  </div>
);

/** "Open dashboard" when signed in, "Sign in" otherwise. */
const DashboardLink = ({ size }: { size: "md" | "lg" }) => {
  const { session } = useSessionContext();
  const signedIn = session.status === "signed-in";
  return (
    <Link to="/dashboard" className={buttonClasses({ variant: "secondary", size })}>
      <LayoutDashboard className="h-4 w-4" />
      {signedIn ? "Open your dashboard" : "Sign in to the dashboard"}
    </Link>
  );
};

const PrivacyModes = () => {
  const [mode, setMode] = useState<keyof typeof MODES>("device");
  const current = MODES[mode];
  const Icon = current.icon;

  return (
    <div className="rounded-3xl border border-black/5 bg-white/95 p-5 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-[#0f1829]/95 dark:shadow-black/40">
      <div role="radiogroup" aria-label="How to use Apply Radar" className="flex rounded-full bg-black/[0.05] p-1 dark:bg-white/[0.06]">
        {(Object.keys(MODES) as (keyof typeof MODES)[]).map((key) => {
          const ModeIcon = MODES[key].icon;
          const selected = key === mode;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(key)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 ${
                selected
                  ? "bg-white text-teal-800 shadow-sm dark:bg-teal-500/20 dark:text-teal-100"
                  : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <ModeIcon className="h-4 w-4" />
              {MODES[key].label}
            </button>
          );
        })}
      </div>
      <div key={mode} className="scope-card mt-5 text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/12 text-teal-700 dark:text-teal-300">
            <Icon className="h-5 w-5" />
          </span>
          <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{current.title}</div>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5 text-sm text-gray-600 dark:text-slate-300">
          {current.points.map((point) => (
            <li key={point} className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/** Public landing page: what Apply Radar is for, with interactive demos. */
export const HomePage = () => {
  useDocumentTitle(undefined);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-[18px] pb-16 pt-10 sm:pt-16 lg:grid-cols-2 lg:gap-14">
        <div data-radar-avoid className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            Job application tracker for Chrome
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-slate-50">
            Every application.{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent dark:from-teal-300 dark:to-emerald-300">
              Always on radar.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600 lg:mx-0 dark:text-slate-300">
            Save jobs from any page in one click, see every application from applied to
            offer, and keep interview links where you can find them.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/extension" className={buttonClasses({ variant: "primary", size: "lg" })}>
              <Puzzle className="h-5 w-5" />
              Get the extension
            </Link>
            <DashboardLink size="lg" />
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-500 lg:justify-start dark:text-slate-400">
            {["No account needed to start", "Your name and email aren't stored", "Delete your data any time"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="flex flex-col items-center">
          <RadarScope />
          <p data-radar-avoid className="mt-3 text-center text-xs text-gray-500 dark:text-slate-400">
            The closer to the center, the closer to an offer.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-[18px] py-16">
        <SectionTitle
          eyebrow="How it works"
          title="From job post to offer, without the spreadsheet"
          text="Apply Radar lives in your browser, right where you find jobs."
        />
        <div className="mt-10">
          <HowItWorks />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-[18px] py-16">
        <SectionTitle
          eyebrow="Features"
          title="Everything your job search needs to stay on track"
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text, badge }) => (
            <div
              key={title}
              data-radar-avoid
              className="feature-card group relative overflow-hidden rounded-3xl border border-black/5 bg-white/90 p-6 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-900/5 dark:border-white/10 dark:bg-[#0f1829]/90 dark:hover:border-teal-400/30"
            >
              {/* A ping in the corner on hover */}
              <span aria-hidden className="feature-card__ping absolute right-5 top-5 h-2 w-2 rounded-full bg-teal-500" />
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/12 text-teal-700 dark:text-teal-300">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
                {badge && (
                  <span className="rounded-full bg-teal-500/12 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:text-teal-200">
                    {badge}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-6xl px-[18px] py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div data-radar-avoid className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]" />
              Your data
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
              Your search, your call
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              Use it on one device without an account, or sign in to have it everywhere.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-left text-sm text-gray-600 dark:text-slate-300">
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                We don't store your name or email, only an ID from Google that links you to
                your applications.
              </li>
              <li className="flex gap-3">
                <HardDrive className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                Without an account, your applications stay in your browser.
              </li>
              <li className="flex gap-3">
                <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                "Delete my data" removes all of your applications and interviews for good.
              </li>
            </ul>
          </div>
          <div data-radar-avoid>
            <PrivacyModes />
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-6xl px-[18px] pb-20 pt-8">
        <div
          data-radar-avoid
          className="cta-band relative overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-12"
        >
          <div aria-hidden className="cta-band__rings absolute inset-0" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-50">
              Put your job search on radar
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-slate-300">
              Install the extension, save your first job and watch it move toward the center.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/extension" className={buttonClasses({ variant: "primary", size: "lg" })}>
                Get the extension
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/about" className={buttonClasses({ variant: "ghost", size: "lg" })}>
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
