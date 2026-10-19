import "server-only";
import {
  isAuthRetryableFetchError,
  type AuthError,
} from "@supabase/supabase-js";
import { logger } from "@/server/http/logger";
import { findClientAccount } from "@/server/repositories/clients";
import {
  findStaffAccount,
  type StaffAccount,
} from "@/server/repositories/staff";
import { createSessionClient } from "@/server/supabase/clients";
import { PERMISSIONS, type Permission } from "@/shared/constants/permissions";
import type { Profile } from "@/shared/constants/profiles";
import { AppError } from "@/shared/errors/app-error";

// Session in Supabase Auth and the account read from the database on every
// request (docs/acesso/autenticacao.md, RS011).

const TOO_MANY_REQUESTS = 429;
const FIRST_SERVER_ERROR = 500;

export type Account = {
  id: string;
  profile: Profile;
  firstName: string;
  lastName: string;
  // Copy of the e-mail of the Supabase Auth account (docs/clientes/dados.md).
  email: string;
  isActive: boolean;
  mustChangePassword: boolean;
  // In the order of RN025.
  permissions: Permission[];
};

export type SignInResult =
  | { outcome: "signed_in"; userId: string }
  | { outcome: "invalid_credentials" }
  | { outcome: "auth_unavailable" };

// Network failure, request limit or server error of Supabase Auth: the
// credentials were not checked (docs/padroes/api.md, Erros).
export function isAuthUnavailable(error: AuthError): boolean {
  const status = error.status ?? 0;
  return (
    isAuthRetryableFetchError(error) ||
    status === TOO_MANY_REQUESTS ||
    status >= FIRST_SERVER_ERROR
  );
}

// RS018: only the code and the status of the error, never the e-mail.
export function logAuthUnavailable(error: AuthError): void {
  logger.warn("auth_unavailable", {
    authCode: error.code ?? null,
    authStatus: error.status ?? null,
  });
}

// Checks the password in Supabase Auth; when it is right, the session goes to
// the cookies.
export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error === null) {
    return { outcome: "signed_in", userId: data.user.id };
  }
  if (error.code === "invalid_credentials") {
    return { outcome: "invalid_credentials" };
  }
  if (isAuthUnavailable(error)) {
    logAuthUnavailable(error);
    return { outcome: "auth_unavailable" };
  }
  throw error;
}

// Ends this browser's session in Supabase Auth and deletes the cookies; the
// sessions of other devices go on. Without a session, nothing changes. The
// cookies are deleted even when Supabase Auth fails.
export async function signOut(): Promise<void> {
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error === null) {
    return;
  }
  if (isAuthUnavailable(error)) {
    logAuthUnavailable(error);
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  throw error;
}

// Saves the new password through this browser's session. Supabase Auth keeps
// this session and ends every other session of the account (decision 0048).
export async function updatePassword(password: string): Promise<void> {
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error === null) {
    return;
  }
  if (isAuthUnavailable(error)) {
    logAuthUnavailable(error);
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  throw error;
}

// Decision 0046: the session is checked in Supabase Auth on every request, so
// an ended session stops working at once; an expired access token is renewed
// on the way. Null without a valid session.
export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error === null) {
    return data.user.id;
  }
  if (isAuthUnavailable(error)) {
    logAuthUnavailable(error);
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  return null;
}

// RN027: the admin has every permission; an inactive role grants none
// (docs/equipe/dados.md).
function listStaffPermissions({ isAdmin, role }: StaffAccount): Permission[] {
  if (isAdmin) {
    return [...PERMISSIONS];
  }
  if (role === null || !role.isActive) {
    return [];
  }
  return PERMISSIONS.filter((permission) =>
    role.permissions.includes(permission),
  );
}

function toAccountOfStaff(staff: StaffAccount): Account {
  return {
    id: staff.id,
    profile: staff.isAdmin ? "admin" : "staff",
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    isActive: staff.isActive,
    mustChangePassword: staff.mustChangePassword,
    permissions: listStaffPermissions(staff),
  };
}

// Profile, situation, role and permissions of the account, or null when it
// has no profile: a deleted client or a Supabase Auth account without its row.
// An id is never in both tables: it comes from Supabase Auth (RN022).
export async function loadAccount(userId: string): Promise<Account | null> {
  const [staff, client] = await Promise.all([
    findStaffAccount(userId),
    findClientAccount(userId),
  ]);
  if (staff !== null) {
    return toAccountOfStaff(staff);
  }
  if (client !== null) {
    return {
      ...client,
      profile: "client",
      isActive: true,
      permissions: [],
    };
  }
  logger.warn("account_without_profile", { accountId: userId });
  return null;
}
