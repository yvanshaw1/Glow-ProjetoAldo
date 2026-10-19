import { describe, expect, it } from "vitest";
import { loginSchema } from "@/shared/validation/auth";

// Body of POST /api/auth/login (docs/acesso/rotas.md), with the messages of
// docs/plataforma/mensagens-de-validacao.md.

const REQUIRED = "Preencha este campo.";
const EMAIL = "Informe um e-mail válido, como maria@email.com.";

function fieldMessages(value: unknown): Record<string, string> {
  const result = loginSchema.safeParse(value);
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path.join("."),
          issue.message,
        ]),
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
      fieldMessages({ email: "maria@email", password: "Senha@12" }),
    ).toEqual({ email: EMAIL });
  });

  it("requires the e-mail and the password", () => {
    expect(fieldMessages({})).toEqual({ email: REQUIRED, password: REQUIRED });
    expect(fieldMessages({ email: "", password: "" })).toEqual({
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
