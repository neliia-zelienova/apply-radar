import Markdown, { type Components } from "react-markdown";
import { Link } from "react-router";

/**
 * Styles for Markdown from the DB. Raw HTML in it is shown as text (react-markdown's
 * default) and unsafe links (javascript: etc.) are dropped, so an edit can't inject
 * scripts.
 */
const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-8 text-2xl font-semibold tracking-tight text-gray-900 first:mt-0 dark:text-slate-100">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 flex items-center gap-2.5 text-lg font-semibold text-gray-900 first:mt-0 dark:text-slate-100">
      {/* A small blip before each section heading. */}
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.15)]" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 font-semibold text-gray-900 dark:text-slate-100">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-3 leading-relaxed text-gray-600 first:mt-0 dark:text-slate-300">{children}</p>
  ),
  ul: ({ children }) => (
    // A teal dot per item (instead of the browser's bullet).
    <ul className="mt-3 flex flex-col gap-2 text-gray-600 dark:text-slate-300 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-1 [&>li]:before:top-[0.6em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-teal-500 [&>li]:before:content-['']">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-gray-600 marker:font-semibold marker:text-teal-600 dark:text-slate-300 dark:marker:text-teal-400">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link to={href} className="font-medium text-teal-700 underline underline-offset-4 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">
        {children}
      </Link>
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-teal-700 underline underline-offset-4 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
      >
        {children}
      </a>
    ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-slate-100">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-black/[0.05] px-1.5 py-0.5 font-mono text-[0.9em] text-teal-800 dark:bg-white/10 dark:text-teal-200">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-4 rounded-2xl border border-teal-500/25 bg-teal-500/[0.07] px-4 py-3 text-teal-900 dark:text-teal-100">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-black/10 dark:border-white/10" />,
};

export const MarkdownContent = ({ children }: { children: string }) => (
  <div className="text-left text-[15px]">
    <Markdown components={components}>{children}</Markdown>
  </div>
);
