import { createApiClient } from "@apply-radar/shared";
import { config } from "./config";

/** Fired when the session can't be refreshed; `useSession` shows the sign-in page. */
export const SESSION_EXPIRED_EVENT = "apply-radar:session-expired";
export const sessionEvents = new EventTarget();

// The access token is kept in memory only (not localStorage). After a reload the
// session is restored from the HttpOnly refresh cookie via `api.refresh()`.
let accessToken: string | null = null;

export const api = createApiClient({
  baseUrl: config.apiUrl,
  tokens: {
    get: () => accessToken,
    set: (token) => {
      accessToken = token;
    },
  },
  onSessionExpired: () =>
    sessionEvents.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)),
});

