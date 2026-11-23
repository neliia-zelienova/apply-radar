import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "apply-radar-theme";

const readStored = (): Theme | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null; // storage blocked (private mode etc.)
  }
};

const initialTheme = (): Theme =>
  readStored() ??
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

/** Light/dark theme for the web app, remembered in localStorage. */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // not persisted; fine
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
};
