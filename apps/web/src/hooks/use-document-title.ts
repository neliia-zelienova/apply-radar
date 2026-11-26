import { useEffect } from "react";

const APP_NAME = "Apply Radar";

/**
 * Sets the tab title, e.g. "Dashboard · Apply Radar"; just the app name without
 * one, and as-is when it already names the app ("About Apply Radar").
 */
export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = !title
      ? APP_NAME
      : title.includes(APP_NAME)
        ? title
        : `${title} · ${APP_NAME}`;
  }, [title]);
};
