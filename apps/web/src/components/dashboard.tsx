import { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
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
import { StatsRow } from "./stats-row";

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
        ) : (
          <ApplicationsPanel listMaxHeight="none" />
        )}
      </div>
    </ApplicationsContext.Provider>
  );
};
