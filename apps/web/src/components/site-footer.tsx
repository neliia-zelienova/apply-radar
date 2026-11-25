import { Link } from "react-router";
import { RadarLogo } from "@apply-radar/ui";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/extension", label: "Extension" },
  { to: "/about", label: "About" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export const SiteFooter = () => (
  <footer
    data-radar-avoid
    className="border-t border-black/5 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-[#07091a]/70"
  >
    <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-[18px] py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
        <RadarLogo size={24} />
        <span>Apply Radar · Every application. Always on radar.</span>
      </div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
        {LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="text-slate-600 underline-offset-4 hover:text-teal-700 hover:underline dark:text-slate-400 dark:hover:text-teal-300"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);
