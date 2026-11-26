import { Check, Loader2 } from "lucide-react";
import { Button, GoogleIcon, RadarLogo, StatusBanner } from "@apply-radar/ui";

const FEATURES = [
  "The same applications as in the extension",
  "Synced across all your browsers",
  "Backed up to your account",
];

/**
 * /dashboard when signed out: a centered sign-in card (under the site header).
 * No "device only" option: the web app needs an account.
 */
export const SignInPage = ({
  error,
  busy,
  onSignIn,
  onCancel,
}: {
  error?: string;
  busy: boolean;
  onSignIn: () => void;
  /** Stops waiting for the Google popup. */
  onCancel: () => void;
}) => (
  <main className="flex flex-1 items-center justify-center px-4 py-10">
    <section
      data-radar-avoid
      aria-labelledby="sign-in-title"
      className="w-full max-w-[400px] rounded-3xl border border-black/5 bg-white/95 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-[#0f1829]/95 dark:shadow-black/40"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
        <RadarLogo size={40} />
      </div>
      <h1
        id="sign-in-title"
        className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
      >
        Sign in to Apply Radar
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
        Use the same Google account as in the extension to see your applications.
      </p>

      <ul className="mt-6 flex flex-col gap-2.5 text-left text-sm text-gray-600 dark:text-slate-300">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {error && (
        <div className="mt-6 text-left">
          <StatusBanner tone="error">{error}</StatusBanner>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-6"
        disabled={busy}
        onClick={onSignIn}
      >
        {busy ? (
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

      {busy && (
        // We can't detect the popup being closed (Google's pages cut it off
        // from this window), so let the user stop waiting.
        <div
          role="status"
          className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-slate-400"
        >
          <span>Finish signing in in the Google window.</span>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full px-2 py-1 font-semibold text-teal-700 hover:bg-teal-600/10 dark:text-teal-300 dark:hover:bg-teal-400/10"
          >
            Cancel
          </button>
        </div>
      )}
    </section>
  </main>
);
