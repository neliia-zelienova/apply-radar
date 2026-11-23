import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  applicationDraftFrom,
  draftFromSnapshot,
  jobLinkFrom,
  type Application,
  type JobPostingDraft,
  type PageSnapshot,
} from "@apply-radar/shared";
import { api } from "../services/app-radar-api";
import {
  PENDING_IMPORT_KEY,
  PageImportError,
  readActiveTabSnapshot,
  type PendingImport,
} from "../services/page-import";

export type ApplicationDraft = Pick<Application, "name" | "position" | "url" | "notes">;

export type PageImportState =
  | { status: "idle" }
  | { status: "reading" }
  | { status: "ready"; id: string; draft: ApplicationDraft; notice: string }
  | { status: "error"; message: string };

const messageOf = (error: unknown) =>
  error instanceof PageImportError
    ? error.message
    : "Couldn't read this page. Try again, or add the application by hand.";

/**
 * "Add from this page": reads the job posting in the current tab, fills the
 * "Add application" form and lets the user review it. Nothing is saved here.
 *
 * Signed in with Google, the API's AI (when configured) adds a short summary
 * and fills gaps; otherwise the page's own job data (schema.org) and title are used.
 * Also picks up pages sent from the context menu (via chrome.storage.session).
 */
export const usePageImport = ({ authType }: { authType: "google" | "local" | null }) => {
  const [state, setState] = useState<PageImportState>({ status: "idle" });

  const fill = useCallback(
    async (snapshot: PageSnapshot) => {
      setState({ status: "reading" });
      let ai: JobPostingDraft | null = null;
      let notice = "Filled in from the page. Check the details before saving.";

      const text = snapshot.text || snapshot.meta.description || snapshot.title;
      if (authType === "google" && text) {
        try {
          ai = await api.applications.parsePage({
            url: snapshot.url,
            title: snapshot.title,
            text,
          });
          notice = ai
            ? "Filled in from the page with AI. Check the details before saving."
            : "This page doesn't look like a single job posting. Filled in what could be found.";
        } catch (error) {
          notice =
            error instanceof ApiError && error.status === 503
              ? "Filled in from the page's job data (AI summaries aren't set up). Check the details before saving."
              : "AI couldn't read this page, so only the page's job data was used. Check the details before saving.";
        }
      }

      const draft = draftFromSnapshot(snapshot, ai);
      setState({
        status: "ready",
        id: crypto.randomUUID(),
        draft: applicationDraftFrom(draft, jobLinkFrom(snapshot)),
        notice,
      });
    },
    [authType],
  );

  /** Button click: read the active tab (asks for site access if needed). */
  const importFromActiveTab = useCallback(async () => {
    setState({ status: "reading" });
    try {
      await fill(await readActiveTabSnapshot());
    } catch (error) {
      setState({ status: "error", message: messageOf(error) });
    }
  }, [fill]);

  // Pages sent from the context menu by the background worker.
  useEffect(() => {
    if (!authType) return; // picked up after sign-in
    const take = async () => {
      const stored = await chrome.storage.session.get(PENDING_IMPORT_KEY);
      const pending = stored[PENDING_IMPORT_KEY] as PendingImport | undefined;
      if (!pending) return;
      await chrome.storage.session.remove(PENDING_IMPORT_KEY);
      if (pending.snapshot) await fill(pending.snapshot);
      else setState({ status: "error", message: pending.error ?? messageOf(null) });
    };
    void take();
    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === "session" && changes[PENDING_IMPORT_KEY]?.newValue) void take();
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [authType, fill]);

  return {
    state,
    importFromActiveTab,
    reset: useCallback(() => setState({ status: "idle" }), []),
  };
};
