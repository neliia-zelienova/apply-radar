import { AppHeader, GoogleSignInCard, StatusBanner } from "@apply-radar/ui";

/**
 * Same start page as the extension (header + "Sign in with Google" card),
 * without the "device only" option — the web app needs an account.
 */
export const SignInPage = ({
  error,
  busy,
  onSignIn,
}: {
  error?: string;
  busy: boolean;
  onSignIn: () => void;
}) => (
  <div className="flex min-h-screen justify-center">
    <div data-radar-avoid className="flex w-full max-w-[600px] flex-col">
      <AppHeader />
      <div
        className="bg-slate-50 dark:bg-[#070d1a]"
        style={{
          flex: 1,
          padding: "28px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "4px" }}>
          <div
            className="text-gray-900 dark:text-slate-100"
            style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}
          >
            Sign in to Apply Radar
          </div>
          <div className="text-gray-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
            Use the same Google account as in the extension to see your applications
          </div>
        </div>

        {error && <StatusBanner tone="error">{error}</StatusBanner>}

        <GoogleSignInCard onSignIn={onSignIn} busy={busy} recommended={false} />
      </div>
    </div>
  </div>
);
