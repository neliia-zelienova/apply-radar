type ChromeIdentity = {
  launchWebAuthFlow: (
    details: { url: string; interactive: boolean },
    callback: (responseUrl?: string) => void,
  ) => void;
  getRedirectURL: (path?: string) => string;
};

function getChromeIdentity(): ChromeIdentity {
  const anyGlobal = globalThis as any;
  const identity = anyGlobal?.chrome?.identity as ChromeIdentity | undefined;
  if (!identity) {
    throw new Error(
      "chrome.identity is not available. Make sure the extension has the 'identity' permission and you're running inside Chrome/Chromium.",
    );
  }
  return identity;
}

function getRuntimeLastError(): { message: string } | undefined {
  return (globalThis as any)?.chrome?.runtime?.lastError as
    | { message: string }
    | undefined;
}

function parseQuery(url: string) {
  const u = new URL(url);
  const params = new URLSearchParams(u.search);
  const hash = u.hash?.startsWith("#") ? u.hash.slice(1) : "";
  const hashParams = new URLSearchParams(hash);
  return { params, hashParams };
}

function createNonce(length = 32) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/**
 * Launches the Google OAuth flow using chrome.identity and returns an access token.
 *
 * This is extension-CSP friendly and avoids loading apis.google.com scripts.
 */
export async function getGoogleAccessTokenViaIdentity(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as
    | string
    | undefined;

  if (!clientId) {
    throw new Error(
      [
        "Missing VITE_GOOGLE_OAUTH_CLIENT_ID.",
        "Fix:",
        "- add VITE_GOOGLE_OAUTH_CLIENT_ID to apps/apply-radar-extension/.env",
        "- restart the dev server / rebuild",
      ].join("\n"),
    );
  }

  const identity = getChromeIdentity();
  const redirectUri = identity.getRedirectURL("oauth2");

  // Debug help for redirect_uri_mismatch.
  // This log should show something like:
  // https://<EXTENSION_ID>.chromiumapp.org/oauth2
  // Make sure the OAuth client is created as "Chrome Extension" and uses the same Item ID.
  console.log("[oauth] redirectUri:", redirectUri);

  // Minimal scopes for basic profile + email.
  // Add more if you need Google APIs.
  const scope = encodeURIComponent("openid email profile");

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${scope}` +
    `&prompt=select_account`;

  console.log("[oauth] launchWebAuthFlow authUrl (sans token):", authUrl);

  const responseUrl = await new Promise<string>((resolve, reject) => {
    identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      (url?: string) => {
        const lastError = getRuntimeLastError();
        if (lastError) return reject(new Error(lastError.message));
        if (!url) return reject(new Error("No response URL from auth flow."));
        resolve(url);
      },
    );
  });

  const { params, hashParams } = parseQuery(responseUrl);
  const accessToken =
    hashParams.get("access_token") ?? params.get("access_token");
  const error = hashParams.get("error") ?? params.get("error");

  if (error) {
    throw new Error(`Google OAuth failed: ${error}`);
  }
  if (!accessToken) {
    throw new Error(
      [
        "Google OAuth completed but no access_token was returned.",
        `Response: ${responseUrl}`,
      ].join("\n"),
    );
  }

  return accessToken;
}

/**
 * Launches the Google OAuth flow using chrome.identity and returns a Google ID token (JWT).
 *
 * Note: This requires a Web OAuth client with the redirect URI added in Google Cloud Console:
 * https://<EXTENSION_ID>.chromiumapp.org/oauth2
 */
export async function getGoogleIdTokenViaIdentity(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as
    | string
    | undefined;

  if (!clientId) {
    throw new Error(
      [
        "Missing VITE_GOOGLE_OAUTH_CLIENT_ID.",
        "Fix:",
        "- add VITE_GOOGLE_OAUTH_CLIENT_ID to apps/apply-radar-extension/.env",
        "- restart the dev server / rebuild",
      ].join("\n"),
    );
  }

  const identity = getChromeIdentity();
  const redirectUri = identity.getRedirectURL("oauth2");

  console.log("[oauth] redirectUri:", redirectUri);

  const scope = encodeURIComponent("openid email profile");
  const nonce = createNonce();

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=id_token%20token` +
    `&scope=${scope}` +
    `&nonce=${encodeURIComponent(nonce)}` +
    `&prompt=select_account`;

  console.log("[oauth] launchWebAuthFlow authUrl (sans token):", authUrl);

  const responseUrl = await new Promise<string>((resolve, reject) => {
    identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      (url?: string) => {
        const lastError = getRuntimeLastError();
        if (lastError) return reject(new Error(lastError.message));
        if (!url) return reject(new Error("No response URL from auth flow."));
        resolve(url);
      },
    );
  });

  const { params, hashParams } = parseQuery(responseUrl);
  const idToken = hashParams.get("id_token") ?? params.get("id_token");
  const error = hashParams.get("error") ?? params.get("error");

  if (error) {
    throw new Error(`Google OAuth failed: ${error}`);
  }
  if (!idToken) {
    throw new Error(
      [
        "Google OAuth completed but no id_token was returned.",
        `Response: ${responseUrl}`,
      ].join("\n"),
    );
  }

  return idToken;
}

export async function getGoogleUserInfo(accessToken: string): Promise<{
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch Google userinfo: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return res.json();
}
