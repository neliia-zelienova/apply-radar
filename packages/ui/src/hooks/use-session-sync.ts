import { useEffect, useRef } from "react";

/**
 * Re-checks the shared sign-in session (the API's refresh cookie, shared by the
 * extension and the web app in the same browser) when the window regains focus,
 * becomes visible, and every `intervalMs` while visible — so signing in or out
 * in one app shows up in the other.
 */
export const useSessionSync = (check: () => void, intervalMs = 30_000) => {
  const checkRef = useRef(check);
  checkRef.current = check;

  useEffect(() => {
    const run = () => {
      if (document.visibilityState === "visible") checkRef.current();
    };
    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", run);
    const timer = window.setInterval(run, intervalMs);
    return () => {
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", run);
      window.clearInterval(timer);
    };
  }, [intervalMs]);
};
