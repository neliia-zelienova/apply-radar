import { createContext, useContext } from "react";

interface AuthContextType {
  authType: "google" | "local" | null;
  userId: string;
  email: string;
  name: string;
  picture: string;
  setAuthType: (type: "google" | "local" | null) => void;
  getJwt: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
