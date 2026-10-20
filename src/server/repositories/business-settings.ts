import "server-only";
import { getServiceClient } from "@/server/supabase/clients";
import type { CompanySettings } from "@/shared/api/settings";

// Table business_settings, a single row (docs/configuracoes/dados.md).

const SINGLE_ROW_ID = 1;

type BusinessSettingsRow = {
  company_name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  whatsapp: string | null;
  updated_at: string;
};

export type BusinessSettingsValues = Omit<CompanySettings, "updatedAt">;

const BUSINESS_SETTINGS_COLUMNS =
  "company_name, cnpj, email, phone, address, instagram_url, facebook_url, whatsapp, updated_at";

function toCompanySettings(row: BusinessSettingsRow): CompanySettings {
  return {
    companyName: row.company_name,
    cnpj: row.cnpj,
    email: row.email,
    phone: row.phone,
    address: row.address,
    instagramUrl: row.instagram_url,
    facebookUrl: row.facebook_url,
    whatsapp: row.whatsapp,
    updatedAt: row.updated_at,
  };
}

export async function findBusinessSettings(): Promise<CompanySettings | null> {
  const { data, error } = await getServiceClient()
    .from("business_settings")
    .select(BUSINESS_SETTINGS_COLUMNS)
    .eq("id", SINGLE_ROW_ID)
    .maybeSingle<BusinessSettingsRow>();
  if (error) {
    throw error;
  }
  return data === null ? null : toCompanySettings(data);
}

// RNF011, decision 0009: the version is checked by the update itself, so a
// change saved in between is never overwritten. Null when the row no longer
// has that updated_at; trg_business_settings_updated_at writes the new one.
export async function updateBusinessSettings(
  values: BusinessSettingsValues,
  updatedAt: string,
): Promise<CompanySettings | null> {
  const { data, error } = await getServiceClient()
    .from("business_settings")
    .update({
      company_name: values.companyName,
      cnpj: values.cnpj,
      email: values.email,
      phone: values.phone,
      address: values.address,
      instagram_url: values.instagramUrl,
      facebook_url: values.facebookUrl,
      whatsapp: values.whatsapp,
    })
    .eq("id", SINGLE_ROW_ID)
    .eq("updated_at", updatedAt)
    .select(BUSINESS_SETTINGS_COLUMNS)
    .maybeSingle<BusinessSettingsRow>();
  if (error) {
    throw error;
  }
  return data === null ? null : toCompanySettings(data);
}
