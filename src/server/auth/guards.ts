import "server-only";
import {
  getSessionUserId,
  loadAccount,
  type Account,
} from "@/server/auth/session";
import { setRequestUser } from "@/server/http/logger";
import type { Permission } from "@/shared/constants/permissions";
import { AppError } from "@/shared/errors/app-error";

// Guards called by the routes on every request (docs/acesso/autenticacao.md,
// Autorização). Each one returns the account, which the route passes on to
// the service.

type UserOptions = {
  // RS004: only GET /api/auth/me and the password change accept a pending
  // initial password.
  allowPasswordChange?: boolean;
};

// RS001, RS011: valid session and an active account, read from the database.
export async function requireUser({
  allowPasswordChange = false,
}: UserOptions = {}): Promise<Account> {
  const userId = await getSessionUserId();
  if (userId === null) {
    throw new AppError("UNAUTHENTICATED");
  }
  const account = await loadAccount(userId);
  if (account === null) {
    throw new AppError("UNAUTHENTICATED");
  }
  setRequestUser(account.id);
  // RN026: the session stays until the logout.
  if (!account.isActive) {
    throw new AppError("ACCOUNT_INACTIVE");
  }
  if (account.mustChangePassword && !allowPasswordChange) {
    throw new AppError("PASSWORD_CHANGE_REQUIRED");
  }
  return account;
}

// RS009: the routes of /api/me take the client id from this account, never
// from the request.
export async function requireClient(): Promise<Account> {
  const account = await requireUser();
  if (account.profile !== "client") {
    throw new AppError("FORBIDDEN");
  }
  return account;
}

// RS008, RS010: staff or admin with the permission of the page; the admin has
// every one (RN027), and a client gets 403.
export async function requirePermission(
  permission: Permission,
): Promise<Account> {
  const account = await requireUser();
  if (
    account.profile === "client" ||
    !account.permissions.includes(permission)
  ) {
    throw new AppError("FORBIDDEN");
  }
  return account;
}
