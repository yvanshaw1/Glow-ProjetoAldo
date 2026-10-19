// Profiles of the glossary (guia/mapa.md): the admin is the staff account with
// is_admin (RN027). The login sends each one to its own area (RN029).
export const PROFILES = ["client", "staff", "admin"] as const;

export type Profile = (typeof PROFILES)[number];
