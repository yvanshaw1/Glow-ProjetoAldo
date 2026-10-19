import "server-only";
import {
  clearLoginAttempts,
  releaseLoginAttempt,
  reserveLoginAttempt,
} from "@/server/auth/login-attempts";
import {
  loadAccount,
  signIn,
  signOut,
  type Account,
} from "@/server/auth/session";
import { logger, setRequestUser } from "@/server/http/logger";
import type { SessionUser } from "@/shared/api/auth";
import { AppError } from "@/shared/errors/app-error";
import type { LoginInput } from "@/shared/validation/auth";

// Module auth (docs/acesso/): login and logout of clients and staff.

// UC03, UC08, RN029: one login for every profile.
export async function login({
  email,
  password,
}: LoginInput): Promise<SessionUser> {
  await reserveLoginAttempt(email);
  const result = await signIn(email, password);
  if (result.outcome === "auth_unavailable") {
    await releaseLoginAttempt(email);
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  // RS005: the same answer for an unknown e-mail and a wrong password.
  if (result.outcome === "invalid_credentials") {
    throw new AppError("INVALID_CREDENTIALS");
  }
  const account = await keepSession(email, result.userId);
  setRequestUser(account.id);
  logger.info("login", { profile: account.profile });
  return toSessionUser(account);
}

// The password was right, so the count is reset; the session stays only for
// an account that may sign in (RN026, RN030). Any failure ends the session,
// so no error response carries a session cookie.
async function keepSession(email: string, userId: string): Promise<Account> {
  try {
    await clearLoginAttempts(email);
    const account = await loadAccount(userId);
    // RS005: an account without profile gets the answer of an unknown e-mail.
    if (account === null) {
      throw new AppError("INVALID_CREDENTIALS");
    }
    if (!account.isActive) {
      throw new AppError("ACCOUNT_INACTIVE");
    }
    return account;
  } catch (error) {
    await signOut();
    throw error;
  }
}

// RS007: ends this browser's session, whatever the state of the account.
export function logout(): Promise<void> {
  return signOut();
}

export function toSessionUser({
  profile,
  firstName,
  lastName,
  mustChangePassword,
  permissions,
}: Account): SessionUser {
  return { profile, firstName, lastName, mustChangePassword, permissions };
}
