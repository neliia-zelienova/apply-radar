import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router";
import { RadarBackground, RadarEffectsContext, ThemeContext } from "@apply-radar/ui";
import { ConfigError } from "./components/config-error";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { missingConfig } from "./config";
import { useRadarEffectsPreference } from "./hooks/use-radar-effects-preference";
import { useSession } from "./hooks/use-session";
import { useTheme } from "./hooks/use-theme";
import { HomePage } from "./pages/home/home-page";
import { NotFoundPage } from "./pages/not-found-page";
import { SessionContext } from "./session-context";

// Loaded on demand: visitors of the home page don't download the dashboard
// (or the Markdown renderer).
const DashboardPage = lazy(() =>
  import("./pages/dashboard-page").then((m) => ({ default: m.DashboardPage })),
);
const ContentPage = lazy(() =>
  import("./pages/content-page").then((m) => ({ default: m.ContentPage })),
);

/** Public pages: header with page links, the page, footer. */
const SiteLayout = () => (
  // Clip sideways: demo labels near the scope edge must not widen the page on phones.
  <div className="flex min-h-screen flex-col overflow-x-clip">
    <SiteHeader />
    <Suspense fallback={<div className="flex-1" />}>
      <Outlet />
    </Suspense>
    <SiteFooter />
  </div>
);

const Shell = ({ radarEffects }: { radarEffects: boolean }) => {
  // One session for every page: the header shows "Dashboard" or "Sign in",
  // and only /dashboard waits for it.
  const sessionState = useSession();
  const { pathname } = useLocation();
  const onDashboard =
    pathname === "/dashboard" && sessionState.session.status === "signed-in";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <SessionContext.Provider value={sessionState}>
      {/* Net + sweep everywhere; the "detections" easter egg only on the dashboard. */}
      {radarEffects && <RadarBackground detections={onDashboard} labels={false} />}
      <div className="relative z-[1]">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={null}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path="about"
              element={<ContentPage key="about" slug="about" fallbackTitle="About" />}
            />
            <Route
              path="extension"
              element={<ContentPage key="extension" slug="extension" fallbackTitle="Extension" />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </div>
    </SessionContext.Provider>
  );
};

export default function App() {
  const theme = useTheme();
  const radarEffects = useRadarEffectsPreference();

  return (
    <ThemeContext.Provider value={theme}>
      <RadarEffectsContext.Provider value={radarEffects}>
        {missingConfig.length > 0 ? (
          <ConfigError missing={missingConfig} />
        ) : (
          <BrowserRouter>
            <Shell radarEffects={radarEffects.enabled} />
          </BrowserRouter>
        )}
      </RadarEffectsContext.Provider>
    </ThemeContext.Provider>
  );
}
