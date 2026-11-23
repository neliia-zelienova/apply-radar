import { useCallback, useEffect, useState } from "react";
import { ApiError, decodeAccessToken } from "@apply-radar/shared";
import { useSessionSync } from "@apply-radar/ui";
import { api, SESSION_EXPIRED_EVENT, sessionEvents } from "../api";
import { signInWithGooglePopup } from "../google-popup";

export interface Profile {
  userId: string;
  email: string;
  name: string;
  picture: string;
}

export type Session =
  | { status: "loading" }
  | { status: "signed-out"; error?: string }
  | { status: "signed-in"; profile: Profile };

const profileFrom = (token: string): Profile => {
  const claims = decodeAccessToken(token) ?? {};
  return {
    userId: claims.sub ?? claims.userId ?? "",
    email: claims.email ?? "",
    name: claims.name ?? "",
    picture: claims.picture ?? "",
  };
};

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Web sign-in state. The session is shared with the extension through the
 * API's refresh cookie: it's re-checked on load, focus and every 30s, so
 * signing in/out (or switching account) in either app shows up here.
 */
export const useSession = () => {
  const [session, setSession] = useState<Session>({ status: "loading" });
  const [signingIn, setSigningIn] = useState(false);

  const checkSharedSession = useCallback(async () => {
    try {
      const profile = profileFrom(await api.refresh());
      setSession((prev) =>
        prev.status === "signed-in" &&
        prev.profile.userId === profile.userId &&
        prev.profile.picture === profile.picture
          ? prev
          : { status: "signed-in", profile },
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        // Server unreachable: keep what we have (but don't stay on "Loading").
        setSession((prev) =>
          prev.status === "loading"
            ? { status: "signed-out", error: "Can't reach the server. Is the API running?" }
            : prev,
        );
        return;
      }
      setSession((prev) =>
        prev.status === "signed-in"
          ? { status: "signed-out", error: "You were signed out (maybe in the extension)." }
          : prev.status === "loading"
            ? { status: "signed-out" }
            : prev,
      );
    }
  }, []);

  useEffect(() => {
    void checkSharedSession();
  }, [checkSharedSession]);

  useSessionSync(() => void checkSharedSession());

  useEffect(() => {
    const onExpired = () =>
      setSession({ status: "signed-out", error: "Your session ended. Please sign in again." });
    sessionEvents.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => sessionEvents.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setSigningIn(true);
    try {
      const idToken = await signInWithGooglePopup();
      const token = await api.googleSignIn(idToken);
      setSession({ status: "signed-in", profile: profileFrom(token) });
    } catch (error) {
      setSession({ status: "signed-out", error: messageOf(error) });
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    // Clears the shared refresh cookie, which also signs the extension out.
    await api.logout();
    setSession({ status: "signed-out" });
  }, []);

  const deleteAccount = useCallback(async () => {
    await api.deleteAccount();
    await api.logout();
    setSession({ status: "signed-out" });
  }, []);

  return { session, signingIn, signInWithGoogle, signOut, deleteAccount };
};
