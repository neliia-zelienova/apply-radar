import { useEffect, useState } from "react";
import { ApiError, type ContentPage as Page } from "@apply-radar/shared";
import { BannerAction, StatusBanner } from "@apply-radar/ui";
import type { ReactNode } from "react";
import { api } from "../api";
import { MarkdownContent } from "../components/markdown";
import { useDocumentTitle } from "../hooks/use-document-title";
import { NotFoundPage } from "./not-found-page";

type State =
  | { status: "loading" }
  | { status: "ready"; page: Page }
  | { status: "missing" }
  | { status: "error"; message: string };

/**
 * A page whose text lives in the DB (`pages` table, Markdown), so it can be
 * changed without a deploy. Another such page is one route plus one row.
 */
export const ContentPage = ({
  slug,
  fallbackTitle,
  aside,
}: {
  slug: string;
  /** Tab title until the page loads. */
  fallbackTitle: string;
  /** Shown under the text, e.g. a call to action. */
  aside?: ReactNode;
}) => {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    api.pages
      .get(slug)
      .then((page) => !cancelled && setState({ status: "ready", page }))
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) setState({ status: "missing" });
        else
          setState({
            status: "error",
            message:
              error instanceof ApiError && error.status === 0
                ? "Can't reach the server. Check your connection and try again."
                : "Couldn't load this page. Please try again.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  useDocumentTitle(state.status === "ready" ? state.page.title : fallbackTitle);

  if (state.status === "missing") return <NotFoundPage />;

  return (
    <main className="flex-1 px-4 py-10 sm:py-14">
      <article
        data-radar-avoid
        aria-busy={state.status === "loading"}
        className="mx-auto w-full max-w-3xl rounded-3xl border border-black/5 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-10 dark:border-white/10 dark:bg-[#0f1829]/95 dark:shadow-black/40"
      >
        {state.status === "loading" && (
          <div className="flex animate-pulse flex-col gap-3" aria-label="Loading">
            <div className="h-8 w-2/3 rounded-full bg-black/[0.06] dark:bg-white/10" />
            <div className="mt-4 h-4 w-full rounded-full bg-black/[0.05] dark:bg-white/[0.07]" />
            <div className="h-4 w-11/12 rounded-full bg-black/[0.05] dark:bg-white/[0.07]" />
            <div className="h-4 w-4/5 rounded-full bg-black/[0.05] dark:bg-white/[0.07]" />
          </div>
        )}

        {state.status === "error" && (
          <StatusBanner
            tone="error"
            actions={<BannerAction onClick={() => setAttempt((n) => n + 1)}>Try again</BannerAction>}
          >
            {state.message}
          </StatusBanner>
        )}

        {state.status === "ready" && (
          <>
            <h1 className="text-left text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
              {state.page.title}
            </h1>
            <div className="mt-6">
              <MarkdownContent>{state.page.body}</MarkdownContent>
            </div>
          </>
        )}
      </article>
      {state.status === "ready" && aside && (
        <div className="mx-auto mt-6 w-full max-w-3xl">{aside}</div>
      )}
    </main>
  );
};
