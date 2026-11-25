import { createContext, useContext } from "react";
import type { useSession } from "./hooks/use-session";

export type SessionState = ReturnType<typeof useSession>;

/** The sign-in state, shared by the header (public pages) and the dashboard. */
export const SessionContext = createContext<SessionState | null>(null);

export const useSessionContext = (): SessionState => {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSessionContext must be used inside SessionContext");
  return value;
};
