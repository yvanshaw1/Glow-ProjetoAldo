import "server-only";
import {
  PERMISSION_PAGES,
  PERMISSIONS,
  type Permission,
} from "@/shared/constants/permissions";
import type { Profile } from "@/shared/constants/profiles";

// Where src/proxy.ts sends each person (docs/acesso/protecao-das-paginas.md,
// decision 0051). Pure: the requested address and the account go in, and the
// redirect comes out, or null to show the requested page. Navigation only:
// the API decides the access to the data (RS008).

// The part of the account the navigation depends on (RS011).
export type PageAccount = {
  profile: Profile;
  isActive: boolean;
  mustChangePassword: boolean;
  // In the order of RN025; every one for the admin.
  permissions: readonly Permission[];
};

type PageKind = "access" | "client" | "panel" | "public";

const LOGIN_PAGE = "/login";
const PASSWORD_CHANGE_PAGE = "/set-password";
const ACCESS_PAGES = [LOGIN_PAGE, "/register", PASSWORD_CHANGE_PAGE];
// RN001: the pages only a client opens.
const CLIENT_PAGES = ["/profile", "/booking", "/appointments"];
const PANEL_PREFIX = "/admin";
const PORTAL_HOME = "/";
// Addresses of the site that are not pages.
const NON_PAGE_PREFIXES = ["/api", "/_next"];
// Any origin works: it only tells whether next stays on the site.
const SITE_ORIGIN = "https://glow.invalid";
// Read by the access denied notice of the layouts (UC08 FE03, RS008).
const DENIED_PARAM = "denied=1";

function isUnder(pathname: string, page: string): boolean {
  return pathname === page || pathname.startsWith(`${page}/`);
}

function classifyPage(pathname: string): PageKind {
  if (ACCESS_PAGES.includes(pathname)) return "access";
  if (CLIENT_PAGES.some((page) => isUnder(pathname, page))) return "client";
  if (isUnder(pathname, PANEL_PREFIX)) return "panel";
  return "public";
}

// RN025: the permission of a panel page, or null for an address of the panel
// that is not a page, which the not found page answers.
function findPagePermission(pathname: string): Permission | null {
  return (
    PERMISSIONS.find((permission) => {
      const page = PERMISSION_PAGES[permission];
      return page === PANEL_PREFIX
        ? pathname === page
        : isUnder(pathname, page);
    }) ?? null
  );
}

function canOpen(pathname: string, account: PageAccount): boolean {
  const kind = classifyPage(pathname);
  if (kind === "client") return account.profile === "client";
  if (kind === "panel") {
    if (account.profile === "client") return false;
    const permission = findPagePermission(pathname);
    return permission === null || account.permissions.includes(permission);
  }
  return true;
}

// A page of the site, outside the API and the access pages; the address is
// read as a URL, so `//other.site` and `/\other.site` leave the site and are
// ignored. Null when there is no next or it is not valid.
function readNext(address: URL): string | null {
  const next = address.searchParams.get("next");
  if (next === null || !next.startsWith("/")) return null;
  const target = new URL(next, SITE_ORIGIN);
  const isPage =
    target.origin === SITE_ORIGIN &&
    !NON_PAGE_PREFIXES.some((prefix) => isUnder(target.pathname, prefix)) &&
    !ACCESS_PAGES.includes(target.pathname);
  return isPage ? target.pathname + target.search : null;
}

function withNext(page: string, next: string | null): string {
  return next === null ? page : `${page}?next=${encodeURIComponent(next)}`;
}

// The home of the area: the portal home for a client and the first page the
// role allows for staff and admin. Staff without any permission has no page
// in the panel and goes to the portal home with the notice.
function sendHome(account: PageAccount, isDenied: boolean): string {
  if (account.profile === "client") {
    return isDenied ? `${PORTAL_HOME}?${DENIED_PARAM}` : PORTAL_HOME;
  }
  const [firstPermission] = account.permissions;
  if (firstPermission === undefined) return `${PORTAL_HOME}?${DENIED_PARAM}`;
  const firstPage = PERMISSION_PAGES[firstPermission];
  return isDenied ? `${firstPage}?${DENIED_PARAM}` : firstPage;
}

// RF010, RN001: the restricted pages send the visitor to the login, which
// brings it back to the requested page.
function decideForVisitor(
  kind: PageKind,
  address: URL,
  next: string | null,
): string | null {
  if (kind === "client" || kind === "panel") {
    return withNext(LOGIN_PAGE, address.pathname + address.search);
  }
  if (address.pathname === PASSWORD_CHANGE_PAGE) {
    return withNext(LOGIN_PAGE, next);
  }
  return null;
}

// RN023, RS004: the initial password is changed before any restricted page.
function decideForPendingChange(
  kind: PageKind,
  address: URL,
  next: string | null,
): string | null {
  if (kind === "client" || kind === "panel") {
    return withNext(PASSWORD_CHANGE_PAGE, address.pathname + address.search);
  }
  if (kind === "access" && address.pathname !== PASSWORD_CHANGE_PAGE) {
    return withNext(PASSWORD_CHANGE_PAGE, next);
  }
  return null;
}

// RN029: after the login, the page in next if the profile opens it, or the
// home of the area; RN025, RS010: a page the profile does not open sends to
// the home of the area, with the notice.
function decideForAccount(
  kind: PageKind,
  address: URL,
  next: string | null,
  account: PageAccount,
): string | null {
  if (kind === "access") {
    if (next === null) return sendHome(account, false);
    return canOpen(new URL(next, SITE_ORIGIN).pathname, account)
      ? next
      : sendHome(account, true);
  }
  return canOpen(address.pathname, account) ? null : sendHome(account, true);
}

export function decidePageAccess(
  requestedAddress: string,
  account: PageAccount | null,
): string | null {
  const address = new URL(requestedAddress, SITE_ORIGIN);
  const kind = classifyPage(address.pathname);
  const next = readNext(address);
  // RN026: a deactivated account navigates as a visitor.
  if (account === null || !account.isActive) {
    return decideForVisitor(kind, address, next);
  }
  if (account.mustChangePassword) {
    return decideForPendingChange(kind, address, next);
  }
  return decideForAccount(kind, address, next, account);
}
