import { useThemeContext } from "../context/theme-context";

/** The Google "G" (brand colors). */
export const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export interface GoogleSignInCardProps {
  onSignIn: () => void;
  /** Disables the button while a sign-in is in progress. */
  busy?: boolean;
  /** "RECOMMENDED" badge — useful only when other sign-in options are shown. */
  recommended?: boolean;
}

/** "Sync across devices — Sign in with Google" card, shared by the extension and web. */
export const GoogleSignInCard = ({
  onSignIn,
  busy = false,
  recommended = true,
}: GoogleSignInCardProps) => {
  const { theme } = useThemeContext();
  const dark = theme === "dark";

  return (
    <div
      className="cursor-pointer"
      style={{
        borderRadius: "14px",
        padding: "20px",
        background: dark ? "rgba(20,184,166,0.06)" : "rgba(20,184,166,0.04)",
        border: "2px solid rgba(20,184,166,0.4)",
        boxShadow: "0 0 24px rgba(20,184,166,0.1)",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 32px rgba(20,184,166,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 24px rgba(20,184,166,0.1)";
      }}
    >
      {/* Recommended badge */}
      {recommended && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(20,184,166,0.15)",
            border: "1px solid rgba(20,184,166,0.3)",
            borderRadius: "9999px",
            padding: "2px 8px",
            fontSize: "10px",
            fontWeight: 700,
            color: "#14b8a6",
            letterSpacing: "0.05em",
          }}
        >
          RECOMMENDED
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        <div
          className="dark:bg-white/5 bg-black/[0.04] dark:border-white/[0.08] border-black/[0.06]"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: "1px solid",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GoogleIcon />
        </div>
        <div>
          <div
            className="text-gray-900 dark:text-slate-100"
            style={{ fontSize: "14px", fontWeight: 700 }}
          >
            Sync across devices
          </div>
          <div
            className="text-gray-400 dark:text-slate-500"
            style={{ fontSize: "11px", marginTop: "1px" }}
          >
            Sign in with Google
          </div>
        </div>
      </div>

      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
        {[
          "Your applications sync across all browsers",
          "Access your data anywhere, anytime",
          "Secure cloud backup",
        ].map((feature) => (
          <li
            key={feature}
            className="text-gray-500 dark:text-slate-500"
            style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11px" }}
          >
            <span style={{ color: "#14b8a6" }}>
              <IconCheck />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onSignIn}
        disabled={busy}
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "10px",
          borderRadius: "9999px",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(90deg, #0d9488, #14b8a6)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          boxShadow: "0 4px 16px rgba(20,184,166,0.35)",
          transition: "box-shadow 0.2s",
          fontFamily: "Roboto, sans-serif",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 24px rgba(20,184,166,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 16px rgba(20,184,166,0.35)";
        }}
      >
        {busy ? "Signing in…" : "Continue with Google"}
      </button>
    </div>
  );
};
