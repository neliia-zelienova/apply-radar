import { useAuthContext } from "../../context/auth-context";
import { useThemeContext } from "../../context/theme-context";

const IconGoogle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
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

const LoginPage = () => {
  const { setAuthType, signInWithGoogle } = useAuthContext();
  const { theme } = useThemeContext();
  const dark = theme === "dark";

  const handleLocalLogin = async () => {
    await setAuthType("local");
  };

  return (
    <div
      className="dark:bg-[#070d1a] bg-slate-50"
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
        <div
          className="text-gray-400 dark:text-slate-500"
          style={{ fontSize: "12px" }}
        >
          Choose how you'd like to use the extension
        </div>
      </div>

      {/* Google Card — Recommended */}
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
            <IconGoogle />
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
          onClick={signInWithGoogle}
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
          Continue with Google
        </button>
      </div>

      {/* Local Card */}
      <div
        className="cursor-pointer dark:bg-white/[0.03] bg-black/[0.02]"
        style={{
          borderRadius: "14px",
          padding: "20px",
          border: "1.5px solid",
          borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = dark
            ? "rgba(255,255,255,0.15)"
            : "rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = dark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.08)";
        }}
      >
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="stroke-gray-400 dark:stroke-slate-500"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <div
              className="text-gray-500 dark:text-slate-400"
              style={{ fontSize: "14px", fontWeight: 700 }}
            >
              No account — Device only
            </div>
            <div
              className="text-gray-400 dark:text-slate-600"
              style={{ fontSize: "11px", marginTop: "1px" }}
            >
              Data stays on this device
            </div>
          </div>
        </div>

        <button
          onClick={handleLocalLogin}
          className="dark:text-slate-500 text-gray-500 dark:hover:bg-white/[0.04] hover:bg-black/[0.04]"
          style={{
            marginTop: "4px",
            width: "100%",
            padding: "10px",
            borderRadius: "9999px",
            border: "1.5px solid rgba(0,0,0,0.12)",
            background: "transparent",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "Roboto, sans-serif",
          }}
        >
          Continue without account
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
