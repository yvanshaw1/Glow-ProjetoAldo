// Bodies of the routes of docs/configuracoes/rotas.md. An empty optional
// field is null (docs/padroes/api.md).

// One day of the business hours, with the times as HH:MM in the company's
// time zone: the same shape the scheduling rules take (BusinessDay of
// src/server/rules/scheduling.ts).
export type BusinessDay = {
  // From Sunday (0) to Saturday (6).
  weekday: number;
  isOpen: boolean;
  opensAt: string | null;
  closesAt: string | null;
  breakStartsAt: string | null;
  breakEndsAt: string | null;
};

// GET /api/public/company (RN028): the CNPJ is not public.
export type PublicCompany = {
  companyName: string;
  email: string | null;
  // Phones as stored: only the digits (RN035).
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  // The seven days, from Sunday to Saturday.
  businessHours: BusinessDay[];
};

// GET and PUT /api/admin/settings/company (UC22).
export type CompanySettings = {
  companyName: string;
  // Without the mask, letters in upper case (RN035).
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsapp: string | null;
  // RNF011: sent back on the PUT as it came, treated as text.
  updatedAt: string;
};
