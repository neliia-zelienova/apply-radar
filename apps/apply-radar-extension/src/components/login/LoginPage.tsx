import { useAuthContext } from "../../context/auth-context";
import {
  removeExtensionStorage,
  setExtensionStorage,
} from "../../utils/extensionStorage";
import googleLogo from "../../assets/google-logo.svg";

const LoginPage = () => {
  const { setAuthType, signInWithGoogle } = useAuthContext();

  // Local login handler
  const handleLocalLogin = async () => {
    setAuthType("local");
    await setExtensionStorage("loginType", "local");
    await removeExtensionStorage("jwt");
  };
  return (
    <div className="min-h-full px-6 py-8">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50 via-white to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950" />
        <div className="absolute -top-24 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-400/10" />
      </div>

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <h1
              className="text-[28px] leading-[1.1] tracking-[0.2px] font-bold text-black dark:text-white"
              style={{
                fontFamily:
                  'var(--font-momo-trust, "Momo Trust Display", sans-serif)',
              }}
            >
              Choose your workspace
            </h1>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Pick how Apply Radar should store your applications. You can
              change this later.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            {/* Google card */}
            <section className="flex flex-col items-center rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] p-2">
              <h2 className="text-[16px] font-semibold text-black/60 dark:text-white/80 mb-2">
                Sync across devices
              </h2>
              Best if you want your data available on multiple devices
              <div className="group w-fit relative mt-4 rounded-xl overflow-hidden animate-highlight-ring">
                <button
                  type="button"
                  className="border border-black/10 w-fit relative cursor-pointer rounded-xl px-3 py-2.5 text-[13px] font-bold transition shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md transition hover:-translate-y-[1px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.32)] active:translate-y-px dark:text-inherit"
                  onClick={signInWithGoogle}
                >
                  <img
                    src={googleLogo}
                    alt="Google logo"
                    className="inline h-4 w-4 mr-2"
                  />
                  Sign in with Google
                  <div className="pointer-events-none absolute overflow-hidden inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute -top-12 -right-12 h-22 w-22 rounded-full bg-teal-400/20 blur-sm dark:bg-teal-400/10" />
                  </div>
                </button>
              </div>
            </section>

            {/* Local card */}
            <section className="flex flex-col items-center rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] p-2">
              <h2 className="text-[16px] font-semibold text-black/60 dark:text-white/80 mb-2">
                No account. Device-only mode
              </h2>
              Your data stays on this browser only. Remove the extension anytime
              to delete everything.
              <div className="group relative mt-4 rounded-xl relative overflow-hidden">
                <button
                  type="button"
                  className="border border-black/10 w-fit relative cursor-pointer rounded-xl px-3 py-2.5 text-[13px] font-bold transition shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md transition hover:-translate-y-[1px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_16px_36px_rgba(255,255,255,0.30)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_10px_30px_rgba(255,255,255,0.25)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.32)] active:translate-y-px dark:text-inherit"
                  onClick={handleLocalLogin}
                >
                  Continue locally
                </button>
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -bottom-12 -left-10 h-25 w-25 rounded-full bg-black/8 blur-2xl dark:bg-white/6" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
