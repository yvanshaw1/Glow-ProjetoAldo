import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  cnpjSchema,
  companyPhoneSchema,
  durationMinutesSchema,
  emailSchema,
  entityNameSchema,
  facebookUrlSchema,
  halfHourTimeSchema,
  instagramUrlSchema,
  jobTitleSchema,
  mobilePhoneSchema,
  moneySchema,
  normalizeText,
  passwordSchema,
  percentSchema,
  personNameSchema,
  plainTextSchema,
  plateSchema,
  searchTermSchema,
  vehicleBrandModelSchema,
  vehicleColorSchema,
  vehicleYearSchema,
} from "@/shared/validation/formats";

// Messages from docs/plataforma/mensagens-de-validacao.md.
const REQUIRED = "Preencha este campo.";
const PERSON_NAME =
  "Use de 2 a 60 letras; espaço, hífen e apóstrofo também valem.";
const EMAIL = "Informe um e-mail válido, como maria@email.com.";
const MOBILE_PHONE = "Informe um celular com DDD, como (82) 99999-8888.";
const COMPANY_PHONE = "Informe um telefone com DDD, como (82) 3333-4444.";
const PASSWORD =
  "A senha deve ter de 8 a 72 caracteres, com letra maiúscula, número e caractere especial.";
const PLATE = "Informe uma placa válida.";
const BRAND_MODEL = "Use de 1 a 40 caracteres.";
const COLOR = "Use de 3 a 30 letras.";
const MONEY = "Informe um valor maior que zero e de até R$ 99.999,99.";
const PERCENT =
  "Informe um percentual de 0 a 100, com até duas casas decimais.";
const DURATION = "Informe a duração em minutos, de 5 a 2.400.";
const CNPJ = "Informe um CNPJ válido.";
const INSTAGRAM =
  "Informe o endereço do perfil no Instagram, começando por https://.";
const FACEBOOK =
  "Informe o endereço da página no Facebook, começando por https://.";
const ENTITY_NAME = "Use de 2 a 60 caracteres.";
const HALF_HOUR_TIME = "Escolha um horário em hora cheia ou meia hora.";

function messageOf(schema: z.ZodType, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("normalizeText", () => {
  it("trims spaces at both ends", () => {
    expect(normalizeText("  Glow  ")).toBe("Glow");
  });

  it("collapses repeated spaces into one", () => {
    expect(normalizeText("Lavagem    completa")).toBe("Lavagem completa");
  });

  it("removes control characters", () => {
    expect(normalizeText("Ma\u0000ri\u0007a")).toBe("Maria");
  });

  it("turns tabs and line breaks into a single space", () => {
    expect(normalizeText("Lavagem\ncompleta\r\ncom\tcera")).toBe(
      "Lavagem completa com cera",
    );
  });

  it("composes an accent typed as a separate mark", () => {
    const composed = normalizeText("José");
    expect(composed).toBe("José");
    expect(composed).toHaveLength(4);
  });
});

describe("personNameSchema", () => {
  it("capitalizes each word and lowercases the other letters", () => {
    expect(personNameSchema.parse("MARIA")).toBe("Maria");
  });

  it("keeps the particles da, de, do, das, dos and e in lower case", () => {
    expect(personNameSchema.parse(" joão DOS santos e silva ")).toBe(
      "João dos Santos e Silva",
    );
    expect(personNameSchema.parse(" maria  DA silva ")).toBe("Maria da Silva");
    expect(personNameSchema.parse("DE souza DAS neves DO carmo")).toBe(
      "de Souza das Neves do Carmo",
    );
  });

  it("keeps accented letters", () => {
    expect(personNameSchema.parse("ÂNGELA")).toBe("Ângela");
  });

  it("capitalizes after a hyphen and an apostrophe", () => {
    expect(personNameSchema.parse("ana-maria")).toBe("Ana-Maria");
    expect(personNameSchema.parse("d'ávila")).toBe("D'Ávila");
  });

  it("stores the typographic apostrophe as a plain one", () => {
    expect(personNameSchema.parse("D’Ávila")).toBe("D'Ávila");
  });

  it("accepts 2 and 60 characters and rejects 1 and 61", () => {
    expect(personNameSchema.parse("Li")).toBe("Li");
    expect(personNameSchema.parse("A".repeat(60))).toBe("A" + "a".repeat(59));
    expect(messageOf(personNameSchema, "A")).toBe(PERSON_NAME);
    expect(messageOf(personNameSchema, "A".repeat(61))).toBe(PERSON_NAME);
  });

  it("rejects digits and symbols", () => {
    expect(messageOf(personNameSchema, "Maria2")).toBe(PERSON_NAME);
    expect(messageOf(personNameSchema, "Maria@")).toBe(PERSON_NAME);
  });

  it("rejects a hyphen or an apostrophe outside letters", () => {
    expect(messageOf(personNameSchema, "-Maria")).toBe(PERSON_NAME);
    expect(messageOf(personNameSchema, "Maria'")).toBe(PERSON_NAME);
    expect(messageOf(personNameSchema, "--")).toBe(PERSON_NAME);
  });

  it("rejects an empty or missing value with the required message", () => {
    expect(messageOf(personNameSchema, "")).toBe(REQUIRED);
    expect(messageOf(personNameSchema, "   ")).toBe(REQUIRED);
    expect(messageOf(personNameSchema, undefined)).toBe(REQUIRED);
    expect(messageOf(personNameSchema, null)).toBe(REQUIRED);
  });

  it("rejects a value that is not text with the format message", () => {
    expect(messageOf(personNameSchema, 42)).toBe(PERSON_NAME);
  });
});

describe("emailSchema", () => {
  it("lowercases the address", () => {
    expect(emailSchema.parse(" Maria@Email.COM ")).toBe("maria@email.com");
  });

  it("accepts a domain with more than one dot", () => {
    expect(emailSchema.parse("maria@email.com.br")).toBe("maria@email.com.br");
  });

  it("rejects a domain without a dot", () => {
    expect(messageOf(emailSchema, "maria@email")).toBe(EMAIL);
  });

  it("rejects an address without @ or with a space inside", () => {
    expect(messageOf(emailSchema, "maria.email.com")).toBe(EMAIL);
    expect(messageOf(emailSchema, "maria silva@email.com")).toBe(EMAIL);
  });

  it("accepts 254 characters and rejects 255", () => {
    const domain = "@email.com";
    const longest = "a".repeat(254 - domain.length) + domain;
    expect(emailSchema.parse(longest)).toBe(longest);
    expect(messageOf(emailSchema, "a" + longest)).toBe(EMAIL);
  });

  it("rejects an empty value with the required message", () => {
    expect(messageOf(emailSchema, "")).toBe(REQUIRED);
  });
});

describe("mobilePhoneSchema", () => {
  it("removes the mask", () => {
    expect(mobilePhoneSchema.parse("(82) 99999-8888")).toBe("82999998888");
  });

  it("accepts digits only", () => {
    expect(mobilePhoneSchema.parse("82999998888")).toBe("82999998888");
  });

  it("rejects 10 digits", () => {
    expect(messageOf(mobilePhoneSchema, "8299998888")).toBe(MOBILE_PHONE);
  });

  it("rejects a number whose first digit after the area code is not 9", () => {
    expect(messageOf(mobilePhoneSchema, "82899998888")).toBe(MOBILE_PHONE);
  });

  it("rejects an area code that does not exist", () => {
    expect(messageOf(mobilePhoneSchema, "20999998888")).toBe(MOBILE_PHONE);
    expect(messageOf(mobilePhoneSchema, "23999998888")).toBe(MOBILE_PHONE);
  });

  it("accepts the first and the last area codes of the list", () => {
    expect(mobilePhoneSchema.parse("11999998888")).toBe("11999998888");
    expect(mobilePhoneSchema.parse("99999998888")).toBe("99999998888");
  });

  it("rejects letters", () => {
    expect(messageOf(mobilePhoneSchema, "(82) 9999A-8888")).toBe(MOBILE_PHONE);
  });

  it("rejects the country code", () => {
    expect(messageOf(mobilePhoneSchema, "+55 82 99999-8888")).toBe(
      MOBILE_PHONE,
    );
  });
});

describe("companyPhoneSchema", () => {
  it("accepts a landline with 10 digits", () => {
    expect(companyPhoneSchema.parse("(82) 3333-4444")).toBe("8233334444");
  });

  it("accepts a mobile with 11 digits", () => {
    expect(companyPhoneSchema.parse("(82) 99999-8888")).toBe("82999998888");
  });

  it("rejects 11 digits not starting with 9 after the area code", () => {
    expect(messageOf(companyPhoneSchema, "82333344445")).toBe(COMPANY_PHONE);
  });

  it("rejects 9 digits and an area code that does not exist", () => {
    expect(messageOf(companyPhoneSchema, "823333444")).toBe(COMPANY_PHONE);
    expect(messageOf(companyPhoneSchema, "(20) 3333-4444")).toBe(COMPANY_PHONE);
  });
});

describe("passwordSchema", () => {
  const VALID_START = "Aa1@";

  it("accepts 8 characters with upper case, number and special character", () => {
    expect(passwordSchema.parse("Senha@12")).toBe("Senha@12");
  });

  it("rejects 7 characters", () => {
    expect(messageOf(passwordSchema, "Senh@12")).toBe(PASSWORD);
  });

  it("accepts 72 characters and rejects 73", () => {
    const longest = VALID_START + "a".repeat(68);
    expect(passwordSchema.parse(longest)).toBe(longest);
    expect(messageOf(passwordSchema, longest + "a")).toBe(PASSWORD);
  });

  it("rejects a password without upper case, without a number or without a special character", () => {
    expect(messageOf(passwordSchema, "senha@12")).toBe(PASSWORD);
    expect(messageOf(passwordSchema, "Senha@ab")).toBe(PASSWORD);
    expect(messageOf(passwordSchema, "Senha123")).toBe(PASSWORD);
  });

  it("counts an accented capital as upper case", () => {
    expect(messageOf(passwordSchema, "ésenha@1")).toBe(PASSWORD);
    expect(passwordSchema.parse("Ésenha@1")).toBe("Ésenha@1");
  });

  it("does not count a space as a special character", () => {
    expect(messageOf(passwordSchema, "Senha 123")).toBe(PASSWORD);
  });

  it("keeps the password as typed, with spaces at the ends", () => {
    expect(passwordSchema.parse(" Senha@12  ")).toBe(" Senha@12  ");
  });

  it("rejects 72 characters that take more than 72 bytes", () => {
    const seventyTwoBytes = VALID_START + "a".repeat(66) + "é";
    expect(passwordSchema.parse(seventyTwoBytes)).toBe(seventyTwoBytes);
    const seventyThreeBytes = VALID_START + "a".repeat(67) + "é";
    expect(messageOf(passwordSchema, seventyThreeBytes)).toBe(PASSWORD);
  });

  it("rejects an empty value with the required message", () => {
    expect(messageOf(passwordSchema, "")).toBe(REQUIRED);
    expect(messageOf(passwordSchema, undefined)).toBe(REQUIRED);
  });
});

describe("plateSchema", () => {
  it("accepts the Mercosul pattern with hyphen and lower case", () => {
    expect(plateSchema.parse("abc-1d23")).toBe("ABC1D23");
  });

  it("accepts the old pattern", () => {
    expect(plateSchema.parse("abc1234")).toBe("ABC1234");
    expect(plateSchema.parse("ABC-1234")).toBe("ABC1234");
  });

  it("rejects other patterns", () => {
    expect(messageOf(plateSchema, "AB12345")).toBe(PLATE);
    expect(messageOf(plateSchema, "ABCD123")).toBe(PLATE);
    expect(messageOf(plateSchema, "ABC12D3")).toBe(PLATE);
  });
});

describe("vehicleBrandModelSchema", () => {
  it("capitalizes the first letter of each word", () => {
    expect(vehicleBrandModelSchema.parse("volkswagen")).toBe("Volkswagen");
    expect(vehicleBrandModelSchema.parse("hb20 sense")).toBe("Hb20 Sense");
  });

  it("keeps the other letters as typed", () => {
    expect(vehicleBrandModelSchema.parse("HB20 sense")).toBe("HB20 Sense");
    expect(vehicleBrandModelSchema.parse("mcLaren")).toBe("McLaren");
  });

  it("accepts 1 and 40 characters and rejects 41", () => {
    expect(vehicleBrandModelSchema.parse("x")).toBe("X");
    expect(vehicleBrandModelSchema.parse("A".repeat(40))).toBe("A".repeat(40));
    expect(messageOf(vehicleBrandModelSchema, "A".repeat(41))).toBe(
      BRAND_MODEL,
    );
  });
});

describe("vehicleColorSchema", () => {
  it("capitalizes only the first letter", () => {
    expect(vehicleColorSchema.parse("azul MARINHO")).toBe("Azul marinho");
    expect(vehicleColorSchema.parse("prata")).toBe("Prata");
  });

  it("accepts 3 and 30 characters and rejects 2 and 31", () => {
    expect(vehicleColorSchema.parse("ouro")).toBe("Ouro");
    expect(vehicleColorSchema.parse("cor")).toBe("Cor");
    expect(vehicleColorSchema.parse("a".repeat(30))).toBe("A" + "a".repeat(29));
    expect(messageOf(vehicleColorSchema, "az")).toBe(COLOR);
    expect(messageOf(vehicleColorSchema, "a".repeat(31))).toBe(COLOR);
  });

  it("rejects digits and hyphens", () => {
    expect(messageOf(vehicleColorSchema, "Azul 2")).toBe(COLOR);
    expect(messageOf(vehicleColorSchema, "Verde-claro")).toBe(COLOR);
  });
});

describe("vehicleYearSchema", () => {
  const CURRENT_YEAR = 2026;
  const yearSchema = vehicleYearSchema(CURRENT_YEAR);
  const YEAR = "Informe um ano de 1886 a 2027.";

  it("accepts 1886 and rejects 1885", () => {
    expect(yearSchema.parse(1886)).toBe(1886);
    expect(messageOf(yearSchema, 1885)).toBe(YEAR);
  });

  it("accepts the current year and the next one and rejects the one after", () => {
    expect(yearSchema.parse(2026)).toBe(2026);
    expect(yearSchema.parse(2027)).toBe(2027);
    expect(messageOf(yearSchema, 2028)).toBe(YEAR);
  });

  it("rejects a decimal number and text", () => {
    expect(messageOf(yearSchema, 2020.5)).toBe(YEAR);
    expect(messageOf(yearSchema, "2020")).toBe(YEAR);
  });

  it("rejects a missing value with the required message", () => {
    expect(messageOf(yearSchema, undefined)).toBe(REQUIRED);
  });
});

describe("moneySchema", () => {
  it("accepts 0.01 and 99999.99", () => {
    expect(moneySchema.parse(0.01)).toBe(0.01);
    expect(moneySchema.parse(99999.99)).toBe(99999.99);
  });

  it("rejects zero, a negative value and 100000", () => {
    expect(messageOf(moneySchema, 0)).toBe(MONEY);
    expect(messageOf(moneySchema, -10)).toBe(MONEY);
    expect(messageOf(moneySchema, 100000)).toBe(MONEY);
  });

  it("rejects three decimal places", () => {
    expect(messageOf(moneySchema, 10.005)).toBe(MONEY);
  });

  it("accepts values that are not exact in binary", () => {
    expect(moneySchema.parse(0.07)).toBe(0.07);
    expect(moneySchema.parse(19.99)).toBe(19.99);
  });

  it("rejects text", () => {
    expect(messageOf(moneySchema, "1.250,00")).toBe(MONEY);
  });

  it("rejects a missing value with the required message", () => {
    expect(messageOf(moneySchema, undefined)).toBe(REQUIRED);
  });
});

describe("percentSchema", () => {
  it("accepts 0, 100 and 5.25", () => {
    expect(percentSchema.parse(0)).toBe(0);
    expect(percentSchema.parse(100)).toBe(100);
    expect(percentSchema.parse(5.25)).toBe(5.25);
  });

  it("rejects -1, 100.01 and 5.255", () => {
    expect(messageOf(percentSchema, -1)).toBe(PERCENT);
    expect(messageOf(percentSchema, 100.01)).toBe(PERCENT);
    expect(messageOf(percentSchema, 5.255)).toBe(PERCENT);
  });
});

describe("durationMinutesSchema", () => {
  it("accepts 5 and 2400", () => {
    expect(durationMinutesSchema.parse(5)).toBe(5);
    expect(durationMinutesSchema.parse(2400)).toBe(2400);
  });

  it("rejects 4, 2401 and 90.5", () => {
    expect(messageOf(durationMinutesSchema, 4)).toBe(DURATION);
    expect(messageOf(durationMinutesSchema, 2401)).toBe(DURATION);
    expect(messageOf(durationMinutesSchema, 90.5)).toBe(DURATION);
  });
});

describe("cnpjSchema", () => {
  it("removes the mask", () => {
    expect(cnpjSchema.parse("12.345.678/0001-95")).toBe("12345678000195");
  });

  it("rejects a wrong check digit", () => {
    expect(messageOf(cnpjSchema, "12.345.678/0001-90")).toBe(CNPJ);
  });

  it("rejects 14 equal digits", () => {
    expect(messageOf(cnpjSchema, "11111111111111")).toBe(CNPJ);
  });

  it("accepts the alphanumeric CNPJ and stores it in upper case", () => {
    expect(cnpjSchema.parse("12.abc.345/01de-35")).toBe("12ABC34501DE35");
  });

  it("rejects 13 characters", () => {
    expect(messageOf(cnpjSchema, "1234567800019")).toBe(CNPJ);
  });
});

describe("instagramUrlSchema and facebookUrlSchema", () => {
  it("accepts the domain and its subdomains", () => {
    expect(instagramUrlSchema.parse("https://instagram.com/glow")).toBe(
      "https://instagram.com/glow",
    );
    expect(instagramUrlSchema.parse("https://www.instagram.com/glow")).toBe(
      "https://www.instagram.com/glow",
    );
    expect(facebookUrlSchema.parse("https://m.facebook.com/glow")).toBe(
      "https://m.facebook.com/glow",
    );
  });

  it("rejects http", () => {
    expect(messageOf(instagramUrlSchema, "http://instagram.com/glow")).toBe(
      INSTAGRAM,
    );
  });

  it("rejects another domain that contains the name", () => {
    expect(
      messageOf(instagramUrlSchema, "https://instagram.com.golpe.com/glow"),
    ).toBe(INSTAGRAM);
    expect(messageOf(instagramUrlSchema, "https://notinstagram.com/glow")).toBe(
      INSTAGRAM,
    );
  });

  it("rejects the other network's address in each field", () => {
    expect(messageOf(instagramUrlSchema, "https://facebook.com/glow")).toBe(
      INSTAGRAM,
    );
    expect(messageOf(facebookUrlSchema, "https://instagram.com/glow")).toBe(
      FACEBOOK,
    );
  });

  it("rejects an address without the profile path", () => {
    expect(messageOf(instagramUrlSchema, "https://instagram.com/")).toBe(
      INSTAGRAM,
    );
  });

  it("rejects more than 200 characters", () => {
    const prefix = "https://instagram.com/";
    const longest = prefix + "a".repeat(200 - prefix.length);
    expect(instagramUrlSchema.parse(longest)).toBe(longest);
    expect(messageOf(instagramUrlSchema, longest + "a")).toBe(INSTAGRAM);
  });
});

describe("entityNameSchema and jobTitleSchema", () => {
  it("capitalizes the first letter", () => {
    expect(entityNameSchema.parse("lavagem completa")).toBe("Lavagem completa");
    expect(jobTitleSchema.parse("supervisor de lavagem")).toBe(
      "Supervisor de lavagem",
    );
  });

  it("keeps the other letters as typed", () => {
    expect(entityNameSchema.parse("polimento 3M")).toBe("Polimento 3M");
  });

  it("accepts 2 and 60 characters and rejects 1 and 61", () => {
    expect(entityNameSchema.parse("ab")).toBe("Ab");
    expect(entityNameSchema.parse("a".repeat(60))).toBe("A" + "a".repeat(59));
    expect(messageOf(entityNameSchema, "a")).toBe(ENTITY_NAME);
    expect(messageOf(entityNameSchema, "a".repeat(61))).toBe(ENTITY_NAME);
    expect(messageOf(jobTitleSchema, "a")).toBe(ENTITY_NAME);
    expect(messageOf(jobTitleSchema, "a".repeat(61))).toBe(ENTITY_NAME);
  });
});

describe("halfHourTimeSchema", () => {
  it("accepts 00:00, 08:00, 08:30 and 23:30", () => {
    for (const time of ["00:00", "08:00", "08:30", "23:30"]) {
      expect(halfHourTimeSchema.parse(time)).toBe(time);
    }
  });

  it("rejects 08:15, 8:00, 24:00 and 08:00:00", () => {
    for (const time of ["08:15", "8:00", "24:00", "08:00:00"]) {
      expect(messageOf(halfHourTimeSchema, time)).toBe(HALF_HOUR_TIME);
    }
  });
});

describe("plainTextSchema and searchTermSchema", () => {
  it("accepts the limit and rejects one character more", () => {
    for (const maxLength of [100, 200, 500]) {
      const schema = plainTextSchema(maxLength);
      const longest = "a".repeat(maxLength);
      expect(schema.parse(longest)).toBe(longest);
      expect(messageOf(schema, longest + "a")).toBe(
        `Use até ${maxLength} caracteres.`,
      );
    }
    expect(searchTermSchema.parse("a".repeat(100))).toBe("a".repeat(100));
    expect(messageOf(searchTermSchema, "a".repeat(101))).toBe(
      "Use até 100 caracteres.",
    );
  });

  it("keeps HTML as plain text", () => {
    expect(plainTextSchema(100).parse("<b>Glow</b>")).toBe("<b>Glow</b>");
  });

  it("accepts an empty search term", () => {
    expect(searchTermSchema.parse("   ")).toBe("");
  });

  it("rejects an empty text with the required message", () => {
    expect(messageOf(plainTextSchema(100), "  ")).toBe(REQUIRED);
  });
});
