import { useEffect, useState } from "react";
import { getExtensionStorage, setExtensionStorage } from "../utils/extensionStorage";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("light");

  const applyTheme = (t: Theme) => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = async () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    await setExtensionStorage("theme", next);
  };

  useEffect(() => {
    (async () => {
      const stored = await getExtensionStorage<Theme>("theme");
      const resolved: Theme = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      setTheme(resolved);
      applyTheme(resolved);
    })();
  }, []);

  return { theme, toggleTheme };
};
