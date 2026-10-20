import { NextResponse, type NextRequest } from "next/server";
import { decidePageAccess, type PageAccount } from "@/server/auth/page-access";
import { getSessionUserId, loadAccount } from "@/server/auth/session";
import { logger } from "@/server/http/logger";
import { AppError } from "@/shared/errors/app-error";

// Protection of the pages (docs/acesso/protecao-das-paginas.md, decisions
// 0032 and 0051). It only guides the navigation: the API decides the access
// to the data (RS008).

// The answer depends on the session and may carry renewed cookies, so no
// cache may keep it.
const NO_STORE = "private, no-store";

// Decision 0046 and RS011: the session checked in Supabase Auth, which renews
// an expired token into the cookies, and the account read from the database,
// as the guards do. A deactivated account or one without a profile navigates
// as a visitor.
async function loadPageAccount(): Promise<PageAccount | null> {
  const userId = await getSessionUserId();
  return userId === null ? null : loadAccount(userId);
}

// RS018: only the code and the message, never the request.
function describeFailure(error: unknown) {
  const { code = null, message = null } = (error ?? {}) as {
    code?: unknown;
    message?: unknown;
  };
  return { code, message: typeof message === "string" ? message : null };
}

async function decideResponse(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  try {
    const account = await loadPageAccount();
    const destination = decidePageAccess(pathname + search, account);
    return destination === null
      ? NextResponse.next()
      : NextResponse.redirect(new URL(destination, request.url));
  } catch (error) {
    // The page goes on: its calls to the API show the failure and keep the
    // data protected. An unavailable Supabase Auth is already logged.
    const isAuthUnavailable =
      error instanceof AppError && error.code === "SERVICE_UNAVAILABLE";
    if (!isAuthUnavailable) {
      logger.error("page_protection_failed", {
        path: pathname,
        error: describeFailure(error),
      });
    }
    return NextResponse.next();
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = await decideResponse(request);
  response.headers.set("Cache-Control", NO_STORE);
  return response;
}

// The access, client and panel pages of src/server/auth/page-access.ts; the
// home, the catalog, the API and the static files never wait for Supabase.
// Next.js reads the matcher at build time, so it is written out here.
export const config = {
  matcher: [
    "/login",
    "/register",
    "/set-password",
    "/profile/:path*",
    "/booking/:path*",
    "/appointments/:path*",
    "/admin/:path*",
  ],
};
