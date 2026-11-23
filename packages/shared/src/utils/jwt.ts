/** Profile claims the API puts in its access token. */
export interface AccessTokenClaims {
  /** User id. */
  sub?: string;
  /** Older tokens used `userId` instead of `sub`. */
  userId?: string;
  email?: string;
  name?: string;
  picture?: string;
  /** Expiry, seconds since epoch. */
  exp?: number;
}

/**
 * Reads the payload of a JWT without verifying it — for displaying the user's
 * name/picture only. The API verifies tokens; never trust these claims for access.
 */
export const decodeAccessToken = (token: string): AccessTokenClaims | null => {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as AccessTokenClaims;
  } catch {
    return null;
  }
};
