import type { Permission } from "@/shared/constants/permissions";

// Bodies of the routes of docs/equipe/rotas.md. An empty optional field is
// null (docs/padroes/api.md).

// One item of the page of GET /api/admin/staff and the body of the writes
// (UC19, UC20): never the administrator account (RN027).
export type AdminStaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // The description of the position in the company, free text.
  jobTitle: string | null;
  // The role of the system, which gives the permissions (RN024).
  roleId: string;
  roleName: string;
  isActive: boolean;
  // RNF011: sent back on the PATCH as it came, treated as text.
  updatedAt: string;
};

// One item of the page of GET /api/admin/roles and the body of the writes
// (UC21).
export type AdminRole = {
  id: string;
  name: string;
  description: string | null;
  // In the order of RN025.
  permissionKeys: Permission[];
  isActive: boolean;
  updatedAt: string;
};
