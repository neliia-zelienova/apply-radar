import { useEffect, useState } from "react";
import { isWebAppUrl } from "../services/web-app";

/**
 * Whether the active tab shows the web dashboard (there's nothing to import
 * there). The side panel stays open while the user switches tabs, so this
 * follows tab and window changes. Starts as false: the buttons stay visible
 * until the tab is known to be the dashboard.
 */
export const useIsOnWebApp = (): boolean => {
  const [onWebApp, setOnWebApp] = useState(false);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.tabs?.query) return;
    let cancelled = false;
    const check = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (!cancelled) setOnWebApp(isWebAppUrl(tab?.url));
      } catch {
        // No tab info: keep showing the buttons.
      }
    };
    const onUpdated = (_tabId: number, change: chrome.tabs.OnUpdatedInfo) => {
      if (change.url) void check();
    };
    const onActivated = () => void check();
    const onFocusChanged = (windowId: number) => {
      if (windowId !== chrome.windows.WINDOW_ID_NONE) void check();
    };

    void check();
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.windows?.onFocusChanged.addListener(onFocusChanged);
    return () => {
      cancelled = true;
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.windows?.onFocusChanged.removeListener(onFocusChanged);
    };
  }, []);

  return onWebApp;
};
