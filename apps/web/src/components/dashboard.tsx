import { useMemo, useState } from "react";
import { List, Plus, Radar, RefreshCw } from "lucide-react";
import {
  createRemoteRepository,
  type ApplicationSortField,
} from "@apply-radar/shared";
import {
  AppHeader,
  ApplicationForm,
  ApplicationsContext,
  ApplicationsPanel,
  BannerAction,
  Button,
  StatusBanner,
  useApplicationsStore,
  useAvatarSettings,
  type AvatarStore,
} from "@apply-radar/ui";
import { api } from "../api";
import type { Profile } from "../hooks/use-session";
import { AccountMenu } from "./account-menu";
import { AddByLinkButton } from "./add-by-link";
import { BrandLink } from "./brand-link";
import { DashboardRadar } from "./radar/dashboard-radar";
import { StatsRow } from "./stats-row";

type View = "list" | "radar";
const VIEW_KEY = "apply-radar.dashboard-view";
/** Set once the radar has been opened; until then its switch shows a "new" dot. */
const RADAR_SEEN_KEY = "apply-radar.radar-seen";

// Storage can be missing or blocked (private mode); the view then just isn't remembered.
const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

/** List | Radar switch; remembers the choice in this browser. */
const useDashboardView = () => {
  const [view, setViewState] = useState<View>(() =>
    readStorage(VIEW_KEY) === "radar" ? "radar" : "list",
  );
  const [radarSeen, setRadarSeen] = useState(() => readStorage(RADAR_SEEN_KEY) === "1");
  const setView = (next: View) => {
    setViewState(next);
    writeStorage(VIEW_KEY, next);
    if (next === "radar" && !radarSeen) {
      setRadarSeen(true);
      writeStorage(RADAR_SEEN_KEY, "1");
    }
  };
  return { view, setView, radarSeen };
};

const VIEWS = [
  { value: "list", label: "List", icon: List },
  { value: "radar", label: "Radar", icon: Radar },
] as const;

const ViewSwitch = ({
  view,
  onChange,
  radarSeen,
}: {
  view: View;
  onChange: (view: View) => void;
  radarSeen: boolean;
}) => (
  <div
    role="group"
    aria-label="View"
    className="inline-flex h-9 items-center rounded-full bg-black/[0.06] p-1 dark:bg-white/10"
  >
    {VIEWS.map(({ value, label, icon: Icon }) => {
      const active = view === value;
      return (
        <button
          key={value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(value)}
          className={`relative inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 ${
            active
              ? "bg-white text-gray-900 shadow-sm dark:bg-[#0f1829] dark:text-slate-100"
              : "text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
          {value === "radar" && !radarSeen && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-[#0b1426]">
              <span className="sr-only">New</span>
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/** Signed-in view: same applications as the extension, read/written via the API. */
export const Dashboard = ({
  profile,
  onSignOut,
  onDeleteAccount,
}: {
  profile: Profile;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<void>;
}) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState<ApplicationSortField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { view, setView, radarSeen } = useDashboardView();

  const repository = useMemo(() => createRemoteRepository(api), []);
  const avatarStore = useMemo<AvatarStore>(
    () => ({ load: api.users.getAvatar, save: api.users.setAvatar }),
    [],
  );
  const { avatar, saveAvatar } = useAvatarSettings({
    seed: profile.userId,
    store: avatarStore,
  });
  const store = useApplicationsStore({
    repository,
    search,
    filterStatus,
    sortBy,
    sortOrder,
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

  return (
    <ApplicationsContext.Provider value={applicationsContext}>
      {/* Same header as the extension, minus its sweep (the page background moves). */}
      <AppHeader
        animated={false}
        paddingBottom={18}
        contentClassName="mx-auto w-full max-w-6xl"
        wrapBrand={(brand) => <BrandLink>{brand}</BrandLink>}
        right={
          <AccountMenu
            profile={profile}
            avatar={avatar}
            onSaveAvatar={saveAvatar}
            onSignOut={onSignOut}
            onDeleteAccount={onDeleteAccount}
          />
        }
      />

      {/* Only the visible parts are data-radar-avoid (not this column), so background
          blips can still show in the empty space around and between them. */}
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-[18px] py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div data-radar-avoid className="text-left">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              {profile.name ? `Hi, ${profile.name.split(" ")[0]}` : "Your applications"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Synced with the Apply Radar extension.
            </p>
          </div>
          <div data-radar-avoid className="flex flex-wrap items-center gap-2">
            <ViewSwitch view={view} onChange={setView} radarSeen={radarSeen} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void store.reload()}
              aria-label="Reload applications"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${store.isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <AddByLinkButton onCreate={(app) => store.createApplication(app)} />
            <ApplicationForm
              onSave={(app) => store.createApplication(app)}
              triggerComponent={
                <Button variant="primary" size="sm">
                  <Plus className="h-4 w-4" />
                  Add application
                </Button>
              }
            />
          </div>
        </div>

        {store.error && (
          <StatusBanner
            tone="error"
            actions={
              <>
                <BannerAction onClick={() => void store.reload()}>Reload</BannerAction>
                <BannerAction onClick={store.clearError}>Dismiss</BannerAction>
              </>
            }
          >
            {store.error}
          </StatusBanner>
        )}

        <StatsRow applications={store.allApplications} />

        {store.isLoading && store.allApplications.length === 0 ? (
          <div data-radar-avoid className="py-16 text-center text-sm text-gray-400 dark:text-slate-500">
            Loading your applications…
          </div>
        ) : view === "radar" ? (
          <DashboardRadar
            applications={store.allApplications}
            onUpdate={store.updateApplication}
            search={search}
            setSearch={setSearch}
          />
        ) : (
          <ApplicationsPanel listMaxHeight="none" />
        )}
      </div>
    </ApplicationsContext.Provider>
  );
};
