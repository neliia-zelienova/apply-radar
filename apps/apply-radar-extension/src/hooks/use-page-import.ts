import { useCallback, useEffect, useState } from "react";
import {
  importFromSnapshot,
  type ApplicationDraft,
  type PageSnapshot,
} from "@apply-radar/shared";
import { api } from "../services/app-radar-api";
import {
  PENDING_IMPORT_KEY,
  PageImportError,
  readActiveTabSnapshot,
  type PendingImport,
} from "../services/page-import";

export type { ApplicationDraft };

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
      // AI only with a Google account (the API needs the sign-in).
      const parsePage = authType === "google" ? api.applications.parsePage : null;
      const { draft, notice } = await importFromSnapshot(snapshot, parsePage);
      setState({ status: "ready", id: crypto.randomUUID(), draft, notice });
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

  // While a page is being read or its form is open, a new context-menu page
  // waits in storage: replacing the form would lose the user's edits without
  // the unsaved-changes prompt. It opens once the form is saved or closed.
  const busy = state.status === "reading" || state.status === "ready";

  // Pages sent from the context menu by the background worker.
  useEffect(() => {
    if (!authType || busy) return; // picked up after sign-in / when the form closes
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
  }, [authType, busy, fill]);

  return {
    state,
    importFromActiveTab,
    reset: useCallback(() => setState({ status: "idle" }), []),
  };
};
