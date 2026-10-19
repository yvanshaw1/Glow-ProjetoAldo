import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Supabase clients of the server (docs/plataforma/infraestrutura.md). The
// variables are read when a client is created, during the request, never at
// build time: the container image is built without them.

type SupabaseVariable =
  "SUPABASE_URL" | "SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY";

// RS007: scripts cannot read the session cookies, which go only over HTTPS
// and are not sent with writes started on other sites (RS014).
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
} as const;

// RS016: the error names the missing variable, never a value.
function readVariable(name: SupabaseVariable): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

// Created on first use, during a request, and shared afterwards: it keeps no
// user session.
let serviceClient: SupabaseClient | null = null;

// Data and account creation: the service key is the only one with privileges
// on the tables (decision 0042), so it never leaves src/server.
export function getServiceClient(): SupabaseClient {
  serviceClient ??= createClient(
    readVariable("SUPABASE_URL"),
    readVariable("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return serviceClient;
}

// Session in cookies, only for Supabase Auth: the anon key has no privileges
// on the tables (decision 0042). @supabase/ssr requires one client per
// request.
export async function createSessionClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(
    readVariable("SUPABASE_URL"),
    readVariable("SUPABASE_ANON_KEY"),
    {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      cookies: {
        getAll: () => cookieStore.getAll(),
        // The no-cache headers that come with the cookies are left aside:
        // the single handler sends Cache-Control: no-store with every API
        // response (docs/padroes/api.md). The pages need them in
        // src/proxy.ts (#26).
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
