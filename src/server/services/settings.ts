import "server-only";
import { listBusinessHours } from "@/server/repositories/business-hours";
import {
  findBusinessSettings,
  updateBusinessSettings,
} from "@/server/repositories/business-settings";
import type { CompanySettings, PublicCompany } from "@/shared/api/settings";
import { AppError } from "@/shared/errors/app-error";
import type { CompanySettingsInput } from "@/shared/validation/settings";

// Module settings (docs/configuracoes/): company data, business hours and
// payment fees.

// seed.sql creates the single row and the panel only changes it
// (docs/configuracoes/dados.md), so a missing row is an unexpected failure.
export async function getCompanySettings(): Promise<CompanySettings> {
  const settings = await findBusinessSettings();
  if (settings === null) {
    throw new Error("business_settings has no row");
  }
  return settings;
}

// RN028: the portal shows what the panel saved, without the CNPJ.
export async function getPublicCompany(): Promise<PublicCompany> {
  const [settings, businessHours] = await Promise.all([
    getCompanySettings(),
    listBusinessHours(),
  ]);
  return {
    companyName: settings.companyName,
    email: settings.email,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    address: settings.address,
    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    businessHours,
  };
}

// UC22, RNF011: saved only if nobody saved after the given version.
export async function updateCompanySettings({
  updatedAt,
  ...values
}: CompanySettingsInput): Promise<CompanySettings> {
  const settings = await updateBusinessSettings(values, updatedAt);
  if (settings === null) {
    throw new AppError("VERSION_CONFLICT");
  }
  return settings;
}
