"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  SessionContext,
  type SessionContextValue,
  type SessionState,
} from "@/hooks/use-session";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { SessionUser } from "@/shared/api/auth";

const ME_PATH = "/api/auth/me";
const LOGOUT_PATH = "/api/auth/logout";

const LOADING: SessionState = { status: "loading", user: null };
const VISITOR: SessionState = { status: "visitor", user: null };
const UNAVAILABLE: SessionState = { status: "unavailable", user: null };

// The logout answers 204 even without a session, and the server clears the
// cookies even when the Supabase Auth fails; a failure here changes nothing
// the screen could act on.
async function endSession(): Promise<void> {
  await apiRequest(LOGOUT_PATH, { method: "POST" }).catch(() => undefined);
}

async function loadSession(): Promise<SessionState> {
  try {
    const user = await apiRequest<SessionUser>(ME_PATH, {
      isSessionLoad: true,
    });
    return { status: "authenticated", user };
  } catch (error) {
    if (!(error instanceof ApiError)) return UNAVAILABLE;
    if (error.code === "UNAUTHENTICATED") return VISITOR;
    // Deactivated after the login: its cookies are good for nothing, and the
    // login tells why it no longer enters (RN026).
    if (error.code === "ACCOUNT_INACTIVE") {
      await endSession();
      return VISITOR;
    }
    return UNAVAILABLE;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(LOADING);

  useEffect(() => {
    let isMounted = true;
    loadSession().then((loaded) => {
      if (isMounted) setSession(loaded);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback((user: SessionUser) => {
    setSession({ status: "authenticated", user });
  }, []);

  const signOut = useCallback(async (destination: string) => {
    await endSession();
    location.assign(destination);
  }, []);

  const reload = useCallback(async () => {
    setSession(LOADING);
    setSession(await loadSession());
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ ...session, signIn, signOut, reload }),
    [session, signIn, signOut, reload],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}
