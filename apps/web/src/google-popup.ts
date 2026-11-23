import { config } from "./config";

/** Path Google redirects the popup to. Must be an "Authorized redirect URI" of the OAuth client. */
export const OAUTH_CALLBACK_PATH = "/oauth2";
const CHANNEL = "apply-radar:google-oauth";

const redirectUri = () => `${window.location.origin}${OAUTH_CALLBACK_PATH}`;

/**
 * Signs in with Google in a popup (same OpenID flow as the extension) and
 * resolves with the Google ID token.
 *
 * The result comes back over a same-origin BroadcastChannel rather than
 * `window.opener`, because Google's pages use COOP, which cuts the popup off
 * from its opener (and makes `popup.closed` unreliable).
 */
export const signInWithGooglePopup = (): Promise<string> =>
  new Promise((resolve, reject) => {
    const state = crypto.randomUUID();
    const url =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: config.googleClientId,
        redirect_uri: redirectUri(),
        response_type: "id_token",
        scope: "openid email profile",
        nonce: crypto.randomUUID(),
        state,
        prompt: "select_account",
      }).toString();

    const width = 480;
    const height = 640;
    const popup = window.open(
      url,
      "apply-radar-google-sign-in",
      `popup,width=${width},height=${height},left=${Math.round(
        window.screenX + (window.outerWidth - width) / 2,
      )},top=${window.screenY + 80}`,
    );
    if (!popup) {
      reject(new Error("The sign-in popup was blocked. Allow popups for this site and try again."));
      return;
    }

    const channel = new BroadcastChannel(CHANNEL);
    let cancelTimer: number | undefined;

    const finish = () => {
      channel.close();
      window.removeEventListener("focus", onFocus);
      window.clearTimeout(cancelTimer);
    };

    channel.onmessage = (event: MessageEvent<{ hash?: string }>) => {
      const params = new URLSearchParams(String(event.data?.hash ?? "").replace(/^#/, ""));
      if (params.get("state") !== state) return; // another tab's sign-in
      finish();
      const error = params.get("error");
      const idToken = params.get("id_token");
      if (error || !idToken) {
        reject(
          new Error(
            error === "access_denied"
              ? "Sign-in was cancelled."
              : `Google sign-in failed: ${error ?? "no token returned"}`,
          ),
        );
        return;
      }
      resolve(idToken);
    };

    // Coming back to this window without a result = the popup was closed.
    // (The callback posts its message before closing, so give it a moment.)
    const onFocus = () => {
      window.clearTimeout(cancelTimer);
      cancelTimer = window.setTimeout(() => {
        finish();
        reject(new Error("Sign-in was cancelled."));
      }, 1500);
    };
    window.addEventListener("focus", onFocus);
  });

/**
 * Runs inside the popup after Google redirects back: hands the result to the
 * app window and closes. Returns true if this page load was the OAuth callback.
 */
export const handleOAuthCallback = (): boolean => {
  if (window.location.pathname !== OAUTH_CALLBACK_PATH) return false;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage({ hash: window.location.hash });
  channel.close();
  window.close();
  return true;
};
