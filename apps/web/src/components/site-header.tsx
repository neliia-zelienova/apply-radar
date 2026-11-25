import { LayoutDashboard, LogIn } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router";
import { AppHeader, buttonClasses } from "@apply-radar/ui";
import { useSessionContext } from "../session-context";
import { BrandLink } from "./brand-link";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/extension", label: "Extension" },
  { to: "/about", label: "About" },
] as const;

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "rounded-full px-3.5 py-1.5 text-sm font-semibold bg-teal-500/15 text-teal-800 dark:bg-teal-400/15 dark:text-teal-200"
    : "rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-teal-500/10 hover:text-teal-800 dark:text-slate-300 dark:hover:bg-teal-400/10 dark:hover:text-teal-200";

const Nav = ({ className }: { className: string }) => (
  <nav aria-label="Main" className={className}>
    {NAV.map(({ to, label }) => (
      <NavLink key={to} to={to} end className={navClass}>
        {label}
      </NavLink>
    ))}
  </nav>
);

/**
 * "Dashboard" when signed in, "Sign in" otherwise. Nothing while the session is
 * checked, or on /dashboard itself (the sign-in card is right there).
 */
const SessionLink = () => {
  const { session } = useSessionContext();
  const { pathname } = useLocation();
  if (session.status === "loading" || pathname === "/dashboard") return null;
  const signedIn = session.status === "signed-in";
  return (
    <Link to="/dashboard" className={buttonClasses({ variant: "primary", size: "sm" })}>
      {signedIn ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
      {signedIn ? "Dashboard" : "Sign in"}
    </Link>
  );
};

/**
 * Header of the public pages (and the sign-in page): the dashboard's radar
 * header with page links. On phones the links get their own row.
 */
export const SiteHeader = () => (
  <AppHeader
    animated={false}
    paddingBottom={14}
    contentClassName="mx-auto w-full max-w-6xl"
    wrapBrand={(brand) => <BrandLink>{brand}</BrandLink>}
    right={
      <div className="flex items-center gap-2">
        <Nav className="hidden items-center gap-1 md:flex" />
        <ThemeToggle />
        <span className="hidden md:inline-flex">
          <SessionLink />
        </span>
      </div>
    }
  >
    <div className="flex items-center justify-between gap-2 md:hidden">
      <Nav className="-mx-1 flex items-center gap-0.5 overflow-x-auto" />
      <SessionLink />
    </div>
  </AppHeader>
);
