import "server-only";
import { getServiceClient } from "@/server/supabase/clients";

// Table clients (docs/clientes/dados.md). A deleted client is left out of
// every selection (RN030).

type ClientAccountRow = {
  id: string;
  first_name: string;
  last_name: string;
  must_change_password: boolean;
};

export type ClientAccount = {
  id: string;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
};

const CLIENT_ACCOUNT_COLUMNS =
  "id, first_name, last_name, must_change_password";

function toClientAccount(row: ClientAccountRow): ClientAccount {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
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
