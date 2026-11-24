import { useState } from "react";
import { Check, HardDrive, Loader2 } from "lucide-react";
import { Button, GoogleIcon } from "@apply-radar/ui";
import { useAuthContext } from "../../context/auth-context";

const FEATURES = [
  "Synced across all your browsers",
  "The web dashboard and AI fill from job pages",
  "Backed up to your account",
];

/**
 * First screen of the extension: sign in with Google (recommended) or keep
 * the applications on this device. Same card style as the web sign-in page.
 */
const LoginPage = () => {
  const { setAuthType, signInWithGoogle } = useAuthContext();
  const [signingIn, setSigningIn] = useState(false);

  const signIn = async () => {
    setSigningIn(true);
    // Errors are handled (logged) inside; on success this screen goes away.
    await signInWithGoogle();
    setSigningIn(false);
  };

  return (
    // Overlaps the header's bottom edge, like the applications list does.
    <div className="relative z-10 -mt-[18px] px-3 pb-3 font-roboto">
      <section
        data-radar-avoid
        aria-labelledby="login-title"
        className="rounded-3xl border border-black/5 bg-white p-5 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#0f1829] dark:shadow-black/40"
      >
        <h1
          id="login-title"
          className="text-xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
        >
          Sign in to Apply Radar
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
          Choose how you'd like to use the extension.
        </p>

        {/* Recommended: Google account */}
        <div className="mt-5 rounded-2xl border border-teal-500/30 bg-teal-500/[0.05] p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-white shadow-sm dark:border-white/10">
              <GoogleIcon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                Sync across devices
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Sign in with Google
              </div>
            </div>
            <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-teal-700 dark:text-teal-300">
              RECOMMENDED
            </span>
          </div>

          <ul className="mt-3.5 flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-4"
            disabled={signingIn}
            onClick={() => void signIn()}
          >
            {signingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                {/* The "G" on white, so its colors stay true on the teal button. */}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                  <GoogleIcon size={14} />
                </span>
                Continue with Google
              </>
            )}
          </Button>
        </div>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          or
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        {/* Device only */}
        <div className="flex items-start gap-3 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-black/[0.03] text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            <HardDrive className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Use without an account
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
              Applications stay on this device. Sign in later and they're copied to
              your account.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          className="mt-3.5"
          disabled={signingIn}
          onClick={() => void setAuthType("local")}
        >
          Continue without account
        </Button>
      </section>
    </div>
  );
};

export default LoginPage;
