import type { Permission } from "@/shared/constants/permissions";
import type { Profile } from "@/shared/constants/profiles";

// Body of the 201 of POST /api/auth/register (docs/acesso/rotas.md): the data
// as stored, normalized by RN035, without the id, which always comes from the
// session (RS009).
export type RegisteredClient = {
  firstName: string;
  lastName: string;
  email: string;
  // The 11 digits of the mobile phone, without the mask.
  phone: string;
};

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
