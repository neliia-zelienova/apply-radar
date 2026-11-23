import { capturePageSnapshot, type PageSnapshot } from "@apply-radar/shared";

/**
 * Reading a job posting from the page the user is looking at, in their own
 * browser: no request goes to the site, so there is nothing to block.
 *
 * Access to the page comes from `activeTab` (granted when the user clicks the
 * toolbar icon or the context menu item), or, from the side panel, from a
 * one-time permission for that site that the user approves.
 */

/** Context menu → side panel hand-off (chrome.storage.session). */
export const PENDING_IMPORT_KEY = "pendingPageImport";

export interface PendingImport {
  id: string;
  snapshot?: PageSnapshot;
  error?: string;
}

export class PageImportError extends Error {}

const isReadableUrl = (url: string | undefined): url is string =>
  !!url && /^https?:\/\//i.test(url) && !/^https:\/\/chromewebstore\.google\.com\//i.test(url);

const UNREADABLE =
  "This page can't be read. Open the job posting in a normal web page and try again.";

/** Runs the snapshot function in the tab. Throws if the extension has no access. */
export const readTabSnapshot = async (tabId: number): Promise<PageSnapshot> => {
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func: capturePageSnapshot,
  });
  const snapshot = injection?.result as PageSnapshot | undefined;
  if (!snapshot) throw new PageImportError("Couldn't read this page.");
  return snapshot;
};

/**
 * Snapshot of the active tab. If the extension has no access yet (side panel),
 * asks the user to allow this one site, then tries again. Call from a click.
 */
export const readActiveTabSnapshot = async (): Promise<PageSnapshot> => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id || !isReadableUrl(tab.url)) throw new PageImportError(UNREADABLE);

  try {
    return await readTabSnapshot(tab.id);
  } catch {
    const origin = `${new URL(tab.url).origin}/*`;
    const granted = await chrome.permissions
      .request({ origins: [origin] })
      .catch(() => false);
    if (!granted) {
      throw new PageImportError(
        "Apply Radar needs your permission to read this page. Try again and choose Allow.",
      );
    }
    try {
      return await readTabSnapshot(tab.id);
    } catch {
      throw new PageImportError(UNREADABLE);
    }
  }
};

/** Used by the background worker for the context menu item. */
export const readTabForImport = async (tab: chrome.tabs.Tab): Promise<PendingImport> => {
  const id = crypto.randomUUID();
  if (!tab.id || !isReadableUrl(tab.url)) return { id, error: UNREADABLE };
  try {
    return { id, snapshot: await readTabSnapshot(tab.id) };
  } catch {
    return { id, error: UNREADABLE };
  }
};
