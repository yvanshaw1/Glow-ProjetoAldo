import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "@/shared/validation/auth";

// Bodies of the routes of /api/auth (docs/acesso/rotas.md), with the messages
// of docs/plataforma/mensagens-de-validacao.md.

const REQUIRED = "Preencha este campo.";
const EMAIL = "Informe um e-mail válido, como maria@email.com.";
const PERSON_NAME =
  "Use de 2 a 60 letras; espaço, hífen e apóstrofo também valem.";
const MOBILE_PHONE = "Informe um celular com DDD, como (82) 99999-8888.";
const PASSWORD =
  "A senha deve ter de 8 a 72 caracteres, com letra maiúscula, número e caractere especial.";
const SAME_PASSWORD = "A nova senha precisa ser diferente da atual.";

const VALID_REGISTRATION = {
  firstName: "Maria",
  lastName: "da Silva",
  email: "maria@email.com",
  phone: "82999998888",
  password: "Senha forte 1!",
};

// The first message of each field, as the single handler sends in `fields`.
function fieldMessages(
  schema: z.ZodType,
  value: unknown,
): Record<string, string> {
  const result = schema.safeParse(value);
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues
          .toReversed()
          .map((issue) => [issue.path.join("."), issue.message]),
      );
}

describe("loginSchema", () => {
  it("normalizes the e-mail", () => {
    expect(
      loginSchema.parse({ email: "  Maria@Email.COM ", password: "Senha@12" }),
    ).toEqual({ email: "maria@email.com", password: "Senha@12" });
  });

  it("rejects an e-mail outside the RN035 format", () => {
    expect(
      fieldMessages(loginSchema, {
        email: "maria@email",
        password: "Senha@12",
      }),
    ).toEqual({ email: EMAIL });
  });

  it("requires the e-mail and the password", () => {
    expect(fieldMessages(loginSchema, {})).toEqual({
      email: REQUIRED,
      password: REQUIRED,
    });
    expect(fieldMessages(loginSchema, { email: "", password: "" })).toEqual({
      email: REQUIRED,
      password: REQUIRED,
    });
  });

  it("discards fields not in the schema (RS013)", () => {
    expect(
      loginSchema.parse({
        email: "maria@email.com",
        password: "Senha@12",
        profile: "admin",
      }),
    ).toEqual({ email: "maria@email.com", password: "Senha@12" });
  });
});

describe("registerSchema", () => {
  it("normalizes the client's data", () => {
    expect(
      registerSchema.parse({
        firstName: "  maria  DA silva ",
        lastName: " d’ávila ",
        email: "  Maria@Email.COM ",
        phone: "(82) 99999-8888",
        password: " Senha forte 1! ",
      }),
    ).toEqual({
      firstName: "Maria da Silva",
      lastName: "D'Ávila",
      email: "maria@email.com",
      phone: "82999998888",
      password: " Senha forte 1! ",
    });
  });

  it("requires every field", () => {
    const allRequired = {
      firstName: REQUIRED,
      lastName: REQUIRED,
      email: REQUIRED,
      phone: REQUIRED,
      password: REQUIRED,
    };
    expect(fieldMessages(registerSchema, {})).toEqual(allRequired);
    expect(
      fieldMessages(registerSchema, {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
      }),
    ).toEqual(allRequired);
  });

  it("rejects a landline as the client's phone", () => {
    expect(
      fieldMessages(registerSchema, {
        ...VALID_REGISTRATION,
        phone: "(82) 3333-4444",
      }),
    ).toEqual({ phone: MOBILE_PHONE });
  });

  it("rejects a name with a digit", () => {
    expect(
      fieldMessages(registerSchema, {
        ...VALID_REGISTRATION,
        firstName: "Maria2",
      }),
    ).toEqual({ firstName: PERSON_NAME });
  });

  it("rejects a password outside the RS003 rules", () => {
    expect(
      fieldMessages(registerSchema, {
        ...VALID_REGISTRATION,
        password: "senha forte 1!",
      }),
    ).toEqual({ password: PASSWORD });
  });

  it("discards fields not in the schema (RS013)", () => {
    expect(
      registerSchema.parse({
        ...VALID_REGISTRATION,
        mustChangePassword: true,
        id: "4e31423b-fe30-cf42-7e5a-eebc618ac6e6",
        profile: "admin",
      }),
    ).toEqual(VALID_REGISTRATION);
  });
});

describe("changePasswordSchema", () => {
  it("keeps both passwords as typed", () => {
    const input = {
      currentPassword: " Senha atual 1! ",
      newPassword: " Nova senha 2! ",
    };
    expect(changePasswordSchema.parse(input)).toEqual(input);
  });

  it("accepts a current password outside the RS003 rules", () => {
    const input = { currentPassword: "abc", newPassword: "Nova senha 2!" };
    expect(changePasswordSchema.parse(input)).toEqual(input);
  });

  it("rejects a new password equal to the current one (RN023, RS004)", () => {
    expect(
      fieldMessages(changePasswordSchema, {
        currentPassword: "Senha forte 1!",
        newPassword: "Senha forte 1!",
      }),
    ).toEqual({ newPassword: SAME_PASSWORD });
  });

  it("accepts a new password that differs from the current one only in a space", () => {
    const input = {
      currentPassword: "Senha forte 1!",
      newPassword: "Senha forte 1! ",
    };
    expect(changePasswordSchema.parse(input)).toEqual(input);
  });

  it("rejects a new password outside the RS003 rules", () => {
    expect(
      fieldMessages(changePasswordSchema, {
        currentPassword: "Senha atual 1!",
        newPassword: "novasenha1!",
      }),
    ).toEqual({ newPassword: PASSWORD });
  });

  it("reports only the format message when the new password is invalid and equal to the current one", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "abc",
      newPassword: "abc",
    });
    expect(
      result.error?.issues.map(({ path, message }) => [
        path.join("."),
        message,
      ]),
    ).toEqual([["newPassword", PASSWORD]]);
  });

  it("requires both passwords", () => {
    const bothRequired = { currentPassword: REQUIRED, newPassword: REQUIRED };
    expect(fieldMessages(changePasswordSchema, {})).toEqual(bothRequired);
    expect(
      fieldMessages(changePasswordSchema, {
        currentPassword: "",
        newPassword: "",
      }),
    ).toEqual(bothRequired);
    expect(
      fieldMessages(changePasswordSchema, { newPassword: "Nova senha 2!" }),
    ).toEqual({ currentPassword: REQUIRED });
  });

  it("rejects a current password above 72 bytes in UTF-8 with the RS003 message", () => {
    expect(
      fieldMessages(changePasswordSchema, {
        currentPassword: "é".repeat(37),
        newPassword: "Nova senha 2!",
      }),
    ).toEqual({ currentPassword: PASSWORD });
  });

  it("discards fields not in the schema (RS013)", () => {
    expect(
      changePasswordSchema.parse({
        currentPassword: "Senha atual 1!",
        newPassword: "Nova senha 2!",
        email: "maria@email.com",
      }),
    ).toEqual({
      currentPassword: "Senha atual 1!",
      newPassword: "Nova senha 2!",
    });
  });
});
