import { useAuthContext } from "../../context/auth-context";
import { GoogleSignInCard, useThemeContext } from "@apply-radar/ui";

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

      <GoogleSignInCard onSignIn={signInWithGoogle} />

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
