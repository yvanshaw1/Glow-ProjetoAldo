"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/shared/api/auth";

// The only state shared by the screens (docs/padroes/frontend.md): loaded from
// GET /api/auth/me on every page load and changed only by the login and the
// logout. It only guides the screen; the API decides the access (RS008).
export type SessionState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: SessionUser }
  | { status: "visitor"; user: null }
  | { status: "unavailable"; user: null };

export type SessionContextValue = SessionState & {
  // Stores the user answered by the login (#26).
  signIn: (user: SessionUser) => void;
  // Ends the session and loads `destination`: "/" in the portal (UC03 FA05),
  // "/login" in the panel (UC08 FA03).
  signOut: (destination: string) => Promise<void>;
  // Loads the session again, like after a failure or a password change.
  reload: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used inside SessionProvider.");
  }
  return session;
}
