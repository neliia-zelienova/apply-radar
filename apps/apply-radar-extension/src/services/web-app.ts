/** Where the web dashboard runs. Defaults to the local dev server. */
export const WEB_APP_URL = (
  (import.meta.env.VITE_WEB_APP_URL as string | undefined)?.trim() ||
  "http://localhost:5173"
).replace(/\/+$/, "");

/**
 * Opens the web dashboard: focuses an already open tab of it if there is one,
 * otherwise opens a new tab. The web app shares the sign-in with the extension.
 */
export const openWebApp = async () => {
  if (typeof chrome === "undefined" || !chrome.tabs) {
    window.open(WEB_APP_URL, "_blank", "noopener");
    return;
  }
  try {
    const [existing] = await chrome.tabs.query({ url: `${WEB_APP_URL}/*` });
    if (existing?.id !== undefined) {
      await chrome.tabs.update(existing.id, { active: true });
      if (existing.windowId !== undefined) {
        await chrome.windows.update(existing.windowId, { focused: true });
      }
      return;
    }
  } catch {
    // Invalid match pattern or no access: just open a new tab.
  }
  await chrome.tabs.create({ url: WEB_APP_URL });
};

/** True when `url` is a page of the web dashboard (same origin, not just a prefix). */
export const isWebAppUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    return new URL(url).origin === new URL(WEB_APP_URL).origin;
  } catch {
    return false;
  }
};
