// RN025: one permission per page of the admin panel, in the order of the
// panel (and of the permission_key enum of the database, decision 0012).
export const PERMISSIONS = [
  "dashboard",
  "appointments",
  "services",
  "clients",
  "staff",
  "settings",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// Names of the pages in RN025, shown in the panel navigation and in the roles.
export const PERMISSION_LABELS = {
  dashboard: "Dashboard",
  appointments: "Agendamentos",
  services: "Serviços",
  clients: "Clientes",
  staff: "Funcionários",
  settings: "Configurações",
} as const satisfies Record<Permission, string>;

// Page of each permission (docs/acesso/autenticacao.md), used by the panel
// navigation and to find the first allowed page.
export const PERMISSION_PAGES = {
  dashboard: "/admin",
  appointments: "/admin/appointments",
  services: "/admin/services",
  clients: "/admin/clients",
  staff: "/admin/staff",
  settings: "/admin/settings",
} as const satisfies Record<Permission, string>;
