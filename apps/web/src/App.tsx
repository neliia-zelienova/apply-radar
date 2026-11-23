import { RadarBackground, RadarEffectsContext, ThemeContext } from "@apply-radar/ui";
import { ConfigError } from "./components/config-error";
import { Dashboard } from "./components/dashboard";
import { SignInPage } from "./components/sign-in-page";
import { missingConfig } from "./config";
import { useRadarEffectsPreference } from "./hooks/use-radar-effects-preference";
import { useSession } from "./hooks/use-session";
import { useTheme } from "./hooks/use-theme";

const SignedInGate = ({ radarEffects }: { radarEffects: boolean }) => {
  const { session, signingIn, signInWithGoogle, signOut, deleteAccount } = useSession();

  let content;
  switch (session.status) {
    case "loading":
      content = (
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-400 dark:text-slate-500">
          Loading…
        </div>
      );
      break;
    case "signed-out":
      content = (
        <SignInPage
          error={session.error}
          busy={signingIn}
          onSignIn={() => void signInWithGoogle()}
        />
      );
      break;
    case "signed-in":
      content = (
        <Dashboard
          // Remount (reload data) when the account changes.
          key={session.profile.userId}
          profile={session.profile}
          onSignOut={() => void signOut()}
          onDeleteAccount={deleteAccount}
        />
      );
      break;
  }

  return (
    <>
      {/* Net + sweep everywhere; the "detections" easter egg only on the dashboard. */}
      {radarEffects && <RadarBackground detections={session.status === "signed-in"} labels={false} />}
      <div className="relative z-[1]">{content}</div>
    </>
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
          <SignedInGate radarEffects={radarEffects.enabled} />
        )}
      </RadarEffectsContext.Provider>
    </ThemeContext.Provider>
  );
}
