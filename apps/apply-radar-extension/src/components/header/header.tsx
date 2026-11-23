import { Plus } from "lucide-react";
import { type Application } from "@apply-radar/shared";
import { AppHeader, ApplicationForm, useApplicationContext } from "@apply-radar/ui";
import { useAuthContext } from "../../context/auth-context";
import { SettingsDropdown } from "./settings-dropdown";
import { OpenWebAppButton } from "./open-web-app-button";

export const Header = () => {
  const { createApplication } = useApplicationContext();
  const { authType } = useAuthContext();

  const createNewApp = (application: Application) => {
    createApplication(application);
  };

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
        <ApplicationForm
          triggerComponent={
            <button
              className="self-start flex items-center gap-1.5 cursor-pointer"
              style={{
                padding: "9px 18px",
                borderRadius: "9999px",
                background: "transparent",
                border: "1.5px solid rgba(20,184,166,0.55)",
                color: "#5eead4",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                boxShadow:
                  "0 0 12px rgba(20,184,166,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                transition: "all 0.2s ease",
                fontFamily: "Roboto, sans-serif",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(20,184,166,0.12)";
                el.style.boxShadow =
                  "0 0 20px rgba(20,184,166,0.35), inset 0 1px 0 rgba(255,255,255,0.05)";
                el.style.borderColor = "rgba(20,184,166,0.8)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
                el.style.boxShadow =
                  "0 0 12px rgba(20,184,166,0.15), inset 0 1px 0 rgba(255,255,255,0.05)";
                el.style.borderColor = "rgba(20,184,166,0.55)";
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add application
            </button>
          }
          onSave={createNewApp}
        />
      )}
    </AppHeader>
  );
};
