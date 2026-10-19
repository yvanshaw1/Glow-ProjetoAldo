import type { Permission } from "@/shared/constants/permissions";
import type { Profile } from "@/shared/constants/profiles";

// Body of POST /api/auth/login and GET /api/auth/me (docs/acesso/rotas.md).
export type SessionUser = {
  profile: Profile;
  firstName: string;
  lastName: string;
  // RN023, RS004: the initial password still has to be changed.
  mustChangePassword: boolean;
  // In the order of RN025; every one for the admin, none for a client.
  permissions: Permission[];
};
