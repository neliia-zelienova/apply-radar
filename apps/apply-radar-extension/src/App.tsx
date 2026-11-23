import { useMemo, useState } from "react";
import {
  createRemoteRepository,
  type ApplicationSortField,
} from "@apply-radar/shared";
import {
  ApplicationsContext,
  ApplicationsPanel,
  BannerAction,
  RadarBackground,
  RadarEffectsContext,
  RemindersContext,
  StatusBanner,
  ThemeContext,
  useApplicationsStore,
} from "@apply-radar/ui";
import LoginPage from "./components/login/LoginPage";
import "./App.css";
import { Header } from "./components/header/header";
import { AuthContext } from "./context/auth-context";
import { useAuth } from "./hooks/use-auth";
import { useTheme } from "./hooks/use-theme";
import { useAccountUpload } from "./hooks/use-account-upload";
import { useRadarEffectsPreference } from "./hooks/use-radar-effects-preference";
import { api } from "./services/app-radar-api";
import { chromeReminders } from "./services/reminders";
import { localRepository } from "./utils/local-repository";

function App() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState<ApplicationSortField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { theme, toggleTheme } = useTheme();
  const radarEffects = useRadarEffectsPreference();
  const auth = useAuth();

  // Signed in with Google: the account (API) is the source of truth.
  // "Device only": applications stay in chrome.storage.
  const repository = useMemo(
    () =>
      auth.authType === "google" && auth.userId
        ? createRemoteRepository(api)
        : auth.authType === "local"
          ? localRepository
          : null,
    // userId: switching accounts (e.g. in the web app) reloads that account's data.
    [auth.authType, auth.userId],
  );

  const store = useApplicationsStore({
    repository,
    search,
    filterStatus,
    sortBy,
    sortOrder,
  });

  const upload = useAccountUpload({
    enabled: auth.authType === "google",
    userId: auth.userId,
    onUploaded: store.reload,
  });

  const applicationsContext = {
    applications: store.applications,
    total: store.total,
    search,
    setSearch,
    setFilterStatus,
    createApplication: store.createApplication,
    deleteApplication: store.deleteApplication,
    archiveApplication: store.archiveApplication,
    updateApplication: store.updateApplication,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  };

  const uploadBanner = (() => {
    const { state } = upload;
    switch (state.status) {
      case "uploading":
        return (
          <StatusBanner>
            Copying applications from this device to your account… {state.done}{" "}
            of {state.total}
          </StatusBanner>
        );
      case "done":
        return (
          <StatusBanner
            tone="success"
            actions={<BannerAction onClick={upload.dismiss}>Dismiss</BannerAction>}
          >
            Copied {state.uploaded} application{state.uploaded === 1 ? "" : "s"}{" "}
            from this device to your account.
          </StatusBanner>
        );
      case "partial":
        return (
          <StatusBanner
            tone="error"
            actions={
              <>
                <BannerAction onClick={() => void upload.retry()}>Retry</BannerAction>
                <BannerAction onClick={upload.dismiss}>Dismiss</BannerAction>
              </>
            }
          >
            Copied {state.uploaded} of {state.uploaded + state.failed.length}.
            Not copied:{" "}
            {state.failed.map((f) => `${f.name} (${f.error})`).join("; ")}
          </StatusBanner>
        );
      default:
        return null;
    }
  })();

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <RadarEffectsContext.Provider value={radarEffects}>
        <AuthContext.Provider value={auth}>
          <RemindersContext.Provider value={chromeReminders}>
            <ApplicationsContext.Provider value={applicationsContext}>
              {/* Faint radar net behind the popup (no "detections" here: the list fills it). */}
              {radarEffects.enabled && <RadarBackground />}
              <div className="relative z-[1]">
                <Header />
                {auth.authType ? (
                  <>
                    {(uploadBanner || store.error) && (
                      <div className="relative z-10 -mt-3 mb-4 flex flex-col gap-2 px-3">
                        {uploadBanner}
                        {store.error && (
                          <StatusBanner
                            tone="error"
                            actions={
                              <>
                                <BannerAction onClick={() => void store.reload()}>
                                  Reload
                                </BannerAction>
                                <BannerAction onClick={store.clearError}>
                                  Dismiss
                                </BannerAction>
                              </>
                            }
                          >
                            {store.error}
                          </StatusBanner>
                        )}
                      </div>
                    )}
                    <ApplicationsPanel style={{ marginTop: "-18px", padding: "0 12px 12px" }} />
                  </>
                ) : (
                  <LoginPage />
                )}
              </div>
            </ApplicationsContext.Provider>
          </RemindersContext.Provider>
        </AuthContext.Provider>
      </RadarEffectsContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
