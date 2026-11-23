import { useEffect, useState } from "react";
import { ApiError } from "@apply-radar/shared";
import { useSessionSync } from "@apply-radar/ui";
import {
  getExtensionStorage,
  removeExtensionStorage,
  setExtensionStorage,
} from "../utils/extensionStorage";
import {
  api,
  SESSION_EXPIRED_EVENT,
  sessionEvents,
} from "../services/app-radar-api";
import { getGoogleIdTokenViaIdentity } from "../services/google-identity-auth";

type JwtPayload = {
  sub?: string;
  userId?: string;
  email?: string;
  name?: string;
  picture?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  // JWT: header.payload.signature
  const parts = token.split(".");
  if (parts.length < 2) return null;

  // base64url -> base64
  const b64url = parts[1];
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (b64.length % 4)) % 4;
  const padded = b64 + "=".repeat(padLen);

  try {
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export const useAuth = () => {
  const [authType, setAuthType] = useState<"google" | "local" | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [picture, setPicture] = useState<string>("");

  const handleJwt = async (token: string | null) => {
    if (token) {
      const payload = decodeJwtPayload(token);
      if (!payload) {
        console.warn("Failed to decode JWT payload; clearing auth state");
        await handleAuthTypeChange(null);
        await setExtensionStorage("jwt", null);
        await removeExtensionStorage("jwt");
        return;
      }

      // Backend uses `sub` as the user id. Keep a fallback for older tokens.
      setUserId(payload.sub ?? payload.userId ?? "");
      setEmail(payload.email ?? "");
      setName(payload.name ?? "");
      setPicture(payload.picture ?? "");
      await handleAuthTypeChange("google");
    }
    await setExtensionStorage("jwt", token);
  };

  //   const { signInWithGoogle } = useGoogleAuth({ handleJwt });

  const extractedJwt = async () => {
    const storedJwt = await getExtensionStorage<string>("jwt");
    return storedJwt;
  };

  const handleAuthTypeChange = async (type: "google" | "local" | null) => {
    setAuthType(type);
    await setExtensionStorage("loginType", type);
    if (type === "local") {
      await setExtensionStorage("jwt", null);
      await removeExtensionStorage("jwt");
      setUserId("");
      setEmail("");
      setName("");
      setPicture("");
    }
  };

  const signOut = async () => {
    // Also clears the refresh cookie, so the session can't be restored.
    await api.logout();
    await handleAuthTypeChange(null);
    await removeExtensionStorage("jwt");
    await removeExtensionStorage("loginType");
  };

  const signInWithGoogle = async () => {
    try {
      const idToken = await getGoogleIdTokenViaIdentity();

      // Validate token with backend and get JWT
      const jwt = await api.googleSignIn(idToken);
      await handleJwt(jwt);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  // The API client couldn't refresh the session: show the login screen again.
  useEffect(() => {
    const onExpired = () => void signOut();
    sessionEvents.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () =>
      sessionEvents.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
    // signOut only touches state setters and storage; registering once is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Follows the session shared with the web app (the API's refresh cookie):
   * signed in on the web → signed in here; signed out there → signed out here;
   * a different account there → switch to it. "Device only" mode is left alone.
   */
  const syncWithSharedSession = async () => {
    const storedType = await getExtensionStorage<string>("loginType");
    if (storedType === "local") return;
    try {
      await handleJwt(await api.refresh());
    } catch (error) {
      // 401: no shared session. If we had one, onSessionExpired already signed us out.
      // Network errors: keep the current state.
      if (error instanceof ApiError && error.status === 401 && storedType === "google") {
        await signOut();
      }
    }
  };

  // Check login status on mount
  useEffect(() => {
    (async () => {
      const storedType = await getExtensionStorage<string>("loginType");
      const storedJwt = await getExtensionStorage<string>("jwt");
      if (storedType === "google" && storedJwt) {
        // Rehydrate user state from the stored JWT.
        // handleJwt() also persists authType/jwt to storage; that's fine on mount.
        await handleJwt(storedJwt);
      } else if (storedType === "local") {
        setAuthType("local");
      }
      await syncWithSharedSession();
    })();
    // Runs once on open; later checks come from useSessionSync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useSessionSync(() => void syncWithSharedSession());

  return {
    authType,
    userId,
    email,
    name,
    picture,
    setAuthType: handleAuthTypeChange,
    getJwt: extractedJwt,
    signInWithGoogle,
    signOut,
  };
};
