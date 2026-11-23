import { Plus } from "lucide-react";
import { type Application } from "@apply-radar/shared";
import { AppHeader, ApplicationForm, useApplicationContext } from "@apply-radar/ui";
import { useAuthContext } from "../../context/auth-context";
import { SettingsDropdown } from "./settings-dropdown";
import { OpenWebAppButton } from "./open-web-app-button";
import { AddFromPageButton } from "./add-from-page";
import { PillButton } from "./pill-button";

export const Header = () => {
  const { createApplication } = useApplicationContext();
  const { authType } = useAuthContext();

  // Resolves false on failure, which keeps the form open with the draft.
  const createNewApp = (application: Application) => createApplication(application);

  return (
    <AppHeader
      right={
        <div className="flex items-center gap-2">
          {/* The web dashboard needs an account, so only for Google sign-in. */}
          {authType === "google" && <OpenWebAppButton />}
          <SettingsDropdown />
        </div>
      }
    >
      {authType !== null && (
        <div className="flex flex-wrap items-center gap-2">
          <ApplicationForm
            triggerComponent={
              <PillButton>
                <Plus className="h-3.5 w-3.5" />
                Add application
              </PillButton>
            }
            onSave={createNewApp}
          />
          <AddFromPageButton />
        </div>
      )}
    </AppHeader>
  );
};
