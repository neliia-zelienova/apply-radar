import { useEffect, useState } from "react";
import {
  getExtensionStorage,
  removeExtensionStorage,
  setExtensionStorage,
} from "../utils/extensionStorage";
import { ApplyRadarApi } from "../services/app-radar-api";
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

  const signInWithGoogle = async () => {
    try {
      const idToken = await getGoogleIdTokenViaIdentity();

      // Validate token with backend and get JWT
      const response = await ApplyRadarApi.googleSignIn(idToken);
      await handleJwt(response.access_token);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  // Check login status on mount
  useEffect(() => {
    (async () => {
      const storedType = await getExtensionStorage<string>("loginType");
      const storedJwt = await getExtensionStorage<string>("jwt");
      if (storedType === "google" && storedJwt) {
        setAuthType("google");
      } else if (storedType === "local") {
        setAuthType("local");
      }
    })();
  }, []);

  return {
    authType,
    userId,
    email,
    name,
    picture,
    setAuthType: handleAuthTypeChange,
    getJwt: extractedJwt,
    signInWithGoogle,
  };
};
