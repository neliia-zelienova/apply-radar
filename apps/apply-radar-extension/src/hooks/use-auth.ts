import { useEffect, useState } from "react";
import {
  getExtensionStorage,
  removeExtensionStorage,
  setExtensionStorage,
} from "../utils/extensionStorage";
import { ApplyRadarApi } from "../services/app-radar-api";
import { getGoogleIdTokenViaIdentity } from "../services/google-identity-auth";

export const useAuth = () => {
  const [authType, setAuthType] = useState<"google" | "local" | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [picture, setPicture] = useState<string>("");

  const handleJwt = (token: string | null) => {
    if (token) {
      // Decode JWT to extract user info (this is a simple example, consider using a library like jwt-decode)
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.userId);
      setEmail(payload.email);
      setName(payload.name);
      setPicture(payload.picture);
    }
    setExtensionStorage("jwt", token);
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
      handleJwt(response.access_token);
      await handleAuthTypeChange("google");
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
    setJwt: handleJwt,
    getJwt: extractedJwt,
    signInWithGoogle,
  };
};
