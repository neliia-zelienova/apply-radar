import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@apply-radar/ui";

/** Light/dark switch for pages without the account menu (which holds it on the dashboard). */
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeContext();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => void toggleTheme()}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      // Same style as the account menu button on the dashboard.
      className="header-icon-button h-10 w-10"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
