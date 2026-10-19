// Profiles of the glossary (guia/mapa.md): the admin is the staff account with
// is_admin (RN027). The login sends each one to its own area (RN029).
export const PROFILES = ["client", "staff", "admin"] as const;

export type Profile = (typeof PROFILES)[number];

// Names of the profiles in the glossary, shown in the panel navigation.
export const PROFILE_LABELS = {
  client: "Cliente",
  staff: "Funcionário",
  admin: "Administrador",
} as const satisfies Record<Profile, string>;
