import { createApiClient } from "@apply-radar/shared";
import {
  getExtensionStorage,
  removeExtensionStorage,
  setExtensionStorage,
} from "../utils/extensionStorage";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
if (!API_URL) {
  throw new Error(
    [
      "Missing VITE_API_URL.",
      "Requests would otherwise go to the extension origin, leading to confusing failures.",
      "Fix:",
      "- add VITE_API_URL to apps/apply-radar-extension/.env (e.g. http://localhost:3010)",
      "- restart the dev server / rebuild the extension",
    ].join("\n"),
  );
}

/** Fired when the session can't be refreshed; `useAuth` signs the user out. */
export const SESSION_EXPIRED_EVENT = "apply-radar:session-expired";
export const sessionEvents = new EventTarget();

/** API client shared with the web app; the access token lives in chrome.storage ("jwt"). */
export const api = createApiClient({
  baseUrl: API_URL,
  tokens: {
    get: () => getExtensionStorage<string>("jwt"),
    set: async (token) => {
      if (token) await setExtensionStorage("jwt", token);
      else await removeExtensionStorage("jwt");
    },
  },
  onSessionExpired: () =>
    sessionEvents.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)),
});
