import { createContext, useContext } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const useThemeContext = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside ThemeContext.Provider");
  return ctx;
};
