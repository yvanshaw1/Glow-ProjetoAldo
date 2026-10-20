import { z } from "zod";
import {
  ADDRESS_MAX_LENGTH,
  cnpjSchema,
  COMPANY_NAME_MAX_LENGTH,
  companyPhoneSchema,
  emailSchema,
  facebookUrlSchema,
  instagramUrlSchema,
  mobilePhoneSchema,
  optionalFormat,
  plainTextSchema,
} from "@/shared/validation/formats";
import { updatedAtSchema } from "@/shared/validation/params";

// Bodies of the routes of /api/admin/settings (docs/configuracoes/rotas.md),
// also used by the forms of /admin/settings. Unknown fields are discarded
// (RS013).

// UC22: only the company name is required (RN035).
export const companySettingsSchema = z.object({
  companyName: plainTextSchema(COMPANY_NAME_MAX_LENGTH),
  cnpj: optionalFormat(cnpjSchema),
  email: optionalFormat(emailSchema),
  phone: optionalFormat(companyPhoneSchema),
  address: optionalFormat(plainTextSchema(ADDRESS_MAX_LENGTH)),
  instagramUrl: optionalFormat(instagramUrlSchema),
  facebookUrl: optionalFormat(facebookUrlSchema),
  whatsapp: optionalFormat(mobilePhoneSchema),
  updatedAt: updatedAtSchema,
});

export type CompanySettingsInput = z.output<typeof companySettingsSchema>;

export type CompanySettingsFormInput = z.input<typeof companySettingsSchema>;
