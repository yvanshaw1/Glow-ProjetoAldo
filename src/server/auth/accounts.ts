import "server-only";
import { isAuthUnavailable, logAuthUnavailable } from "@/server/auth/session";
import { getServiceClient } from "@/server/supabase/clients";
import { AppError } from "@/shared/errors/app-error";

// Accounts of Supabase Auth, created and removed by the server with the
// service key (docs/acesso/autenticacao.md, Perfis e contas). The profile row
// is written afterwards, with the same id.

// RN022: Supabase Auth does not accept a repeated e-mail, so this covers
// clients, staff and the admin.
const EMAIL_IN_USE_CODES = new Set(["email_exists", "user_already_exists"]);

type NewAccount = {
  email: string;
  password: string;
};

// Decisions 0015 and 0044: the e-mail is born confirmed, so no e-mail is sent,
// and the public sign-up (signUp) is never used. Returns the account id.
export async function createAccount({
  email,
  password,
}: NewAccount): Promise<string> {
  const { data, error } = await getServiceClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error === null) {
    return data.user.id;
  }
  if (error.code !== undefined && EMAIL_IN_USE_CODES.has(error.code)) {
    throw new AppError("EMAIL_IN_USE");
  }
  if (isAuthUnavailable(error)) {
    logAuthUnavailable(error);
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  throw error;
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await getServiceClient().auth.admin.deleteUser(id);
  if (error) {
    throw error;
  }
}
