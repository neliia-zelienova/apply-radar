import { Link } from "react-router";
import { buttonClasses } from "@apply-radar/ui";
import { useDocumentTitle } from "../hooks/use-document-title";

export const NotFoundPage = () => {
  useDocumentTitle("Page not found");
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section
        data-radar-avoid
        className="w-full max-w-md rounded-3xl border border-black/5 bg-white/95 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-[#0f1829]/95 dark:shadow-black/40"
      >
        {/* An empty scope: nothing on radar here. */}
        <div aria-hidden className="relative mx-auto mb-6 h-24 w-24 rounded-full border border-teal-500/30">
          <div className="absolute inset-4 rounded-full border border-teal-500/25" />
          <div className="absolute inset-8 rounded-full border border-teal-500/20" />
          <div className="scope-sweep absolute inset-0 rounded-full" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
          404 · Signal lost
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
          Nothing on radar here
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          This page doesn't exist or has moved.
        </p>
        <Link to="/" className={buttonClasses({ variant: "primary", className: "mt-6" })}>
          Back to the home page
        </Link>
      </section>
    </main>
  );
};
