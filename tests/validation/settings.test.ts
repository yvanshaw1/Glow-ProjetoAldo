import { describe, expect, it } from "vitest";
import { companySettingsSchema } from "@/shared/validation/settings";

// Body of PUT /api/admin/settings/company and the company form (UC22): the
// formats of RN035, with every field optional but the company name.

// Messages from docs/plataforma/mensagens-de-validacao.md.
const REQUIRED = "Preencha este campo.";
const EMAIL = "Informe um e-mail válido, como maria@email.com.";
const MOBILE_PHONE = "Informe um celular com DDD, como (82) 99999-8888.";
const CNPJ = "Informe um CNPJ válido.";
const INSTAGRAM =
  "Informe o endereço do perfil no Instagram, começando por https://.";
const STALE_VERSION = "Atualize a página e tente novamente.";

const UPDATED_AT = "2026-10-20T13:45:12.345678+00:00";

const OPTIONAL_FIELDS = [
  "cnpj",
  "email",
  "phone",
  "address",
  "instagramUrl",
  "facebookUrl",
  "whatsapp",
] as const;

const filledInput = {
  companyName: "  Glow   Estética ",
  cnpj: "12.abc.345/01de-35",
  email: " Contato@Glow.COM ",
  phone: "(82) 3333-4444",
  address: "Rua  Exemplo,   100 –  Maceió",
  instagramUrl: "https://instagram.com/glow",
  facebookUrl: "https://www.facebook.com/glow",
  whatsapp: "(82) 99999-8888",
  updatedAt: UPDATED_AT,
};

function messagesOf(value: unknown): Record<string, string> {
  const result = companySettingsSchema.safeParse(value);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map(({ path, message }) => [String(path[0]), message]),
  );
}

describe("companySettingsSchema", () => {
  it("normalizes every field of the company data", () => {
    expect(companySettingsSchema.parse(filledInput)).toEqual({
      companyName: "Glow Estética",
      cnpj: "12ABC34501DE35",
      email: "contato@glow.com",
      phone: "8233334444",
      address: "Rua Exemplo, 100 – Maceió",
      instagramUrl: "https://instagram.com/glow",
      facebookUrl: "https://www.facebook.com/glow",
      whatsapp: "82999998888",
      updatedAt: UPDATED_AT,
    });
  });

  it("accepts the company name alone, with every optional field empty", () => {
    const emptyValues = ["", null, undefined];
    for (const emptyValue of emptyValues) {
      const input = Object.fromEntries(
        OPTIONAL_FIELDS.map((field) => [field, emptyValue]),
      );
      expect(
        companySettingsSchema.parse({
          ...input,
          companyName: "Glow",
          updatedAt: UPDATED_AT,
        }),
      ).toEqual({
        companyName: "Glow",
        cnpj: null,
        email: null,
        phone: null,
        address: null,
        instagramUrl: null,
        facebookUrl: null,
        whatsapp: null,
        updatedAt: UPDATED_AT,
      });
    }
  });

  it("requires the company name", () => {
    for (const companyName of ["", "   ", undefined]) {
      expect(messagesOf({ ...filledInput, companyName }).companyName).toBe(
        REQUIRED,
      );
    }
  });

  it("rejects a company name over 100 characters", () => {
    const companyName = "a".repeat(101);
    expect(messagesOf({ ...filledInput, companyName }).companyName).toBe(
      "Use até 100 caracteres.",
    );
  });

  it("rejects a CNPJ with a wrong check digit", () => {
    const cnpj = "12.345.678/0001-96";
    expect(messagesOf({ ...filledInput, cnpj }).cnpj).toBe(CNPJ);
  });

  it("rejects an e-mail without a domain", () => {
    for (const email of ["maria@", "maria@email"]) {
      expect(messagesOf({ ...filledInput, email }).email).toBe(EMAIL);
    }
  });

  it("rejects a landline as the WhatsApp", () => {
    const whatsapp = "(82) 3333-4444";
    expect(messagesOf({ ...filledInput, whatsapp }).whatsapp).toBe(
      MOBILE_PHONE,
    );
  });

  it("rejects an Instagram address on another site", () => {
    const instagramUrl = "https://glow.com/instagram";
    expect(messagesOf({ ...filledInput, instagramUrl }).instagramUrl).toBe(
      INSTAGRAM,
    );
  });

  it("rejects an address over 200 characters", () => {
    const address = "a".repeat(201);
    expect(messagesOf({ ...filledInput, address }).address).toBe(
      "Use até 200 caracteres.",
    );
  });

  it("requires the updatedAt", () => {
    const withoutVersion = { ...filledInput, updatedAt: undefined };
    expect(messagesOf(withoutVersion).updatedAt).toBe(STALE_VERSION);
  });

  it("discards unknown fields", () => {
    const settings = companySettingsSchema.parse({
      ...filledInput,
      id: 2,
      createdAt: UPDATED_AT,
    });
    expect(settings).not.toHaveProperty("id");
    expect(settings).not.toHaveProperty("createdAt");
  });
});
