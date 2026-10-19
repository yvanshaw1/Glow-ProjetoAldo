import "server-only";
import { isAuthError } from "@supabase/supabase-js";
import { createAccount, deleteAccount } from "@/server/auth/accounts";
import {
  clearLoginAttempts,
  releaseLoginAttempt,
  reserveLoginAttempt,
} from "@/server/auth/login-attempts";
import {
  loadAccount,
  signIn,
  signOut,
  updatePassword,
  type Account,
} from "@/server/auth/session";
import { logger, setRequestUser } from "@/server/http/logger";
import {
  clearClientPasswordChange,
  insertClient,
} from "@/server/repositories/clients";
import { clearStaffPasswordChange } from "@/server/repositories/staff";
import type { RegisteredClient, SessionUser } from "@/shared/api/auth";
import { AppError } from "@/shared/errors/app-error";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
} from "@/shared/validation/auth";

// Module auth (docs/acesso/): sign-up of clients, login, logout and password
// change of clients and staff.

// UC02, RN022: the account in Supabase Auth, then the client with the same
// id. No session is started: the interface sends the visitor to the login.
export async function register({
  password,
  ...client
}: RegisterInput): Promise<RegisteredClient> {
  const accountId = await createAccount({ email: client.email, password });
  try {
    await insertClient({ id: accountId, ...client });
  } catch (error) {
    await discardAccount(accountId);
    throw error;
  }
  return client;
}

// docs/padroes/backend.md: an account without its profile is removed. If the
// removal fails too, the id goes to the log, so the account can be removed
// later, and the response is the one of the profile's error.
async function discardAccount(accountId: string): Promise<void> {
  try {
    await deleteAccount(accountId);
  } catch (removalError) {
    logger.error("account_removal_failed", {
      accountId,
      authCode: isAuthError(removalError) ? (removalError.code ?? null) : null,
      authStatus: isAuthError(removalError)
        ? (removalError.status ?? null)
        : null,
    });
  }
}

// UC03, UC08, RN029: one login for every profile.
export async function login({
  email,
  password,
}: LoginInput): Promise<SessionUser> {
  const userId = await checkPassword(email, password);
  // RS005: the same answer for an unknown e-mail and a wrong password.
  if (userId === null) {
    throw new AppError("INVALID_CREDENTIALS");
  }
  const account = await keepSession(email, userId);
  setRequestUser(account.id);
  logger.info("login", { profile: account.profile });
  return toSessionUser(account);
}

// RS006 (decision 0047): the attempt is counted before the password is
// checked and given back when Supabase Auth does not answer. The right
// password puts a new session in the cookies and returns the account id; a
// wrong one returns null.
async function checkPassword(
  email: string,
  password: string,
): Promise<string | null> {
  await reserveLoginAttempt(email);
  const result = await signIn(email, password);
  if (result.outcome === "auth_unavailable") {
    await releaseLoginAttempt(email);
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  return result.outcome === "signed_in" ? result.userId : null;
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

// UC03 FA03, UC04 FA01, UC08 FA01 (RN023, RS004): the current password, the
// initial one on the first access, is checked like a login, with the same
// lock (RS006). Supabase Auth then keeps only this browser's session, renewed
// by the check (decision 0048).
export async function changePassword(
  account: Account,
  { currentPassword, newPassword }: ChangePasswordInput,
): Promise<void> {
  await checkCurrentPassword(account, currentPassword);
  await updatePassword(newPassword);
  // Cleared after the password is saved: if this fails, the change stays
  // pending (RS004).
  if (account.mustChangePassword) {
    await clearPasswordChange(account);
  }
}

async function checkCurrentPassword(
  { id, email }: Account,
  password: string,
): Promise<void> {
  const userId = await checkPassword(email, password);
  if (userId === null) {
    throw new AppError("INVALID_CURRENT_PASSWORD");
  }
  await clearLoginAttempts(email);
  // The e-mail of the profile is a copy: a session of another account never
  // stays in the cookies.
  if (userId !== id) {
    await signOut();
    throw new Error("The e-mail of the profile signs in another account");
  }
}

function clearPasswordChange({ id, profile }: Account): Promise<void> {
  return profile === "client"
    ? clearClientPasswordChange(id)
    : clearStaffPasswordChange(id);
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
