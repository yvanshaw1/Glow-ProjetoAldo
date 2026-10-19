import "server-only";
import { getServiceClient } from "@/server/supabase/clients";
import type { Permission } from "@/shared/constants/permissions";

// Table staff, with its role and the role's permissions
// (docs/equipe/dados.md).

type StaffAccountRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  must_change_password: boolean;
  roles: {
    is_active: boolean;
    role_permissions: { permission_key: Permission }[];
  } | null;
};

export type StaffAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  // Null for the admin, who has no role (RN027).
  role: { isActive: boolean; permissions: Permission[] } | null;
};

const STAFF_ACCOUNT_COLUMNS =
  "id, first_name, last_name, email, is_admin, is_active, must_change_password, roles(is_active, role_permissions(permission_key))";

function toStaffAccount(row: StaffAccountRow): StaffAccount {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    isAdmin: row.is_admin,
    isActive: row.is_active,
    mustChangePassword: row.must_change_password,
    role:
      row.roles === null
        ? null
        : {
            isActive: row.roles.is_active,
            permissions: row.roles.role_permissions.map(
              ({ permission_key }) => permission_key,
            ),
          },
  };
}

// Account, situation, role and permissions in a single query (RS011).
export async function findStaffAccount(
  id: string,
): Promise<StaffAccount | null> {
  const { data, error } = await getServiceClient()
    .from("staff")
    .select(STAFF_ACCOUNT_COLUMNS)
    .eq("id", id)
    .maybeSingle<StaffAccountRow>();
  if (error) {
    throw error;
  }
  return data === null ? null : toStaffAccount(data);
}

// RS004: only a pending change is cleared, so updated_at does not change
// without a reason (RNF011).
export async function clearStaffPasswordChange(id: string): Promise<void> {
  const { error } = await getServiceClient()
    .from("staff")
    .update({ must_change_password: false })
    .eq("id", id)
    .eq("must_change_password", true);
  if (error) {
    throw error;
  }
}
