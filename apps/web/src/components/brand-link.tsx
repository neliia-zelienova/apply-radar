import type { ReactNode } from "react";
import { Link } from "react-router";

/** Header logo + name as a link to the home page (for AppHeader `wrapBrand`). */
export const BrandLink = ({ children }: { children: ReactNode }) => (
  <Link
    to="/"
    aria-label="Apply Radar home"
    className="-m-1 rounded-2xl p-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30"
  >
    {children}
  </Link>
);
