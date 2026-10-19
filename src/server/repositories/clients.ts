import "server-only";
import { getServiceClient } from "@/server/supabase/clients";
import { AppError } from "@/shared/errors/app-error";

// Table clients (docs/clientes/dados.md). A deleted client is left out of
// every selection (RN030).

const UNIQUE_VIOLATION = "23505";
const EMAIL_CONSTRAINT = "uq_clients_email";

type ClientAccountRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  must_change_password: boolean;
};

export type ClientAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mustChangePassword: boolean;
};

export type NewClient = {
  // The id of the Supabase Auth account.
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const CLIENT_ACCOUNT_COLUMNS =
  "id, first_name, last_name, email, must_change_password";

function toClientAccount(row: ClientAccountRow): ClientAccount {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    mustChangePassword: row.must_change_password,
  };
}

export async function findClientAccount(
  id: string,
): Promise<ClientAccount | null> {
  const { data, error } = await getServiceClient()
    .from("clients")
    .select(CLIENT_ACCOUNT_COLUMNS)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<ClientAccountRow>();
  if (error) {
    throw error;
  }
  return data === null ? null : toClientAccount(data);
}

export async function insertClient({
  id,
  firstName,
  lastName,
  email,
  phone,
}: NewClient): Promise<void> {
  const { error } = await getServiceClient().from("clients").insert({
    id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
  });
  if (!error) {
    return;
  }
  // RN022: another client that was not deleted has the e-mail.
  if (
    error.code === UNIQUE_VIOLATION &&
    error.message.includes(EMAIL_CONSTRAINT)
  ) {
    throw new AppError("EMAIL_IN_USE");
  }
  throw error;
}

// RS004: only a pending change is cleared, so updated_at does not change
// without a reason (RNF011).
export async function clearClientPasswordChange(id: string): Promise<void> {
  const { error } = await getServiceClient()
    .from("clients")
    .update({ must_change_password: false })
    .eq("id", id)
    .eq("must_change_password", true);
  if (error) {
    throw error;
  }
}
