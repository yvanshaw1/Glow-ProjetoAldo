import { z } from "zod";

// Formats of RN035 (docs/plataforma/RN035-formatos-dos-dados.md), shared by
// the forms and the API routes. Each schema normalizes the input and then
// validates it, with the messages of docs/plataforma/mensagens-de-validacao.md.

const LOCALE = "pt-BR";

const REQUIRED_MESSAGE = "Preencha este campo.";
const PERSON_NAME_MESSAGE =
  "Use de 2 a 60 letras; espaço, hífen e apóstrofo também valem.";
const EMAIL_MESSAGE = "Informe um e-mail válido, como maria@email.com.";
const MOBILE_PHONE_MESSAGE =
  "Informe um celular com DDD, como (82) 99999-8888.";
const COMPANY_PHONE_MESSAGE =
  "Informe um telefone com DDD, como (82) 3333-4444.";
const PASSWORD_MESSAGE =
  "A senha deve ter de 8 a 72 caracteres, com letra maiúscula, número e caractere especial.";
const PLATE_MESSAGE = "Informe uma placa válida.";
const BRAND_MODEL_MESSAGE = "Use de 1 a 40 caracteres.";
const COLOR_MESSAGE = "Use de 3 a 30 letras.";
const MONEY_MESSAGE = "Informe um valor maior que zero e de até R$ 99.999,99.";
const PERCENT_MESSAGE =
  "Informe um percentual de 0 a 100, com até duas casas decimais.";
const DURATION_MESSAGE = "Informe a duração em minutos, de 5 a 2.400.";
const CNPJ_MESSAGE = "Informe um CNPJ válido.";
const INSTAGRAM_MESSAGE =
  "Informe o endereço do perfil no Instagram, começando por https://.";
const FACEBOOK_MESSAGE =
  "Informe o endereço da página no Facebook, começando por https://.";
const ENTITY_NAME_MESSAGE = "Use de 2 a 60 caracteres.";
const HALF_HOUR_TIME_MESSAGE = "Escolha um horário em hora cheia ou meia hora.";

export const COMPANY_NAME_MAX_LENGTH = 100;
export const ADDRESS_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 500;
const SEARCH_TERM_MAX_LENGTH = 100;
const SEARCH_TERM_MESSAGE = `Use até ${SEARCH_TERM_MAX_LENGTH} caracteres.`;
const SOCIAL_URL_MAX_LENGTH = 200;
const EMAIL_MAX_LENGTH = 254;

const PERSON_NAME_LENGTH = { min: 2, max: 60 };
const BRAND_MODEL_LENGTH = { min: 1, max: 40 };
const COLOR_LENGTH = { min: 3, max: 30 };
const ENTITY_NAME_LENGTH = { min: 2, max: 60 };
const PASSWORD_MIN_LENGTH = 8;
// RS003: bcrypt handles at most 72 bytes, so the limit counts UTF-8 bytes.
const PASSWORD_MAX_BYTES = 72;

const FIRST_CAR_YEAR = 1886;
// RN035: the model year of a new vehicle is usually the next one.
const MODEL_YEARS_AHEAD = 1;
const MONEY_MAX = 99999.99;
const PERCENT_MAX = 100;
const DURATION_MINUTES = { min: 5, max: 2400 };
// Tolerance for numbers that are not exact in binary, such as 0.07 * 100.
const DECIMAL_TOLERANCE = 1e-6;

// RN035: particles kept in lower case in person names.
const NAME_PARTICLES = new Set(["da", "de", "do", "das", "dos", "e"]);
// RN035: the 67 national area codes of Anatel.
const AREA_CODES = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);
const CNPJ_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const PERSON_NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;
const COLOR_PATTERN = /^[\p{L}\p{M} ]+$/u;
const PHONE_MASK_PATTERN = /^[\d ().-]+$/;
const MOBILE_PHONE_PATTERN = /^\d{2}9\d{8}$/;
const LANDLINE_PATTERN = /^\d{10}$/;
const PLATE_PATTERN = /^([A-Z]{3})-?(\d[A-Z\d]\d{2})$/;
const CNPJ_MASK_PATTERN = /^[\dA-Z./-]+$/;
const CNPJ_PATTERN = /^[\dA-Z]{12}\d{2}$/;
const REPEATED_CHARACTER_PATTERN = /^(.)\1*$/;
const HALF_HOUR_TIME_PATTERN = /^(?:[01]\d|2[0-3]):(?:00|30)$/;
const UPPERCASE_LETTER_PATTERN = /\p{Lu}/u;
const DIGIT_PATTERN = /\p{Nd}/u;
const SPECIAL_CHARACTER_PATTERN = /[^\p{L}\p{M}\p{N}\s]/u;

const utf8 = new TextEncoder();

type LengthRange = { min: number; max: number };

type TextFormat = {
  message: string;
  // Value to store, or null when the text does not follow the format.
  toStoredValue: (text: string) => string | null;
  prepare?: (value: string) => string;
};

type NumberFormat = {
  message: string;
  isValid: (value: number) => boolean;
};

// RN035: applied to every text field except the password.
export function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\t\n\v\f\r]/g, " ")
    .replace(/\p{Cc}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isMissing(input: unknown): boolean {
  return input === undefined || input === null;
}

function reject(context: z.core.$RefinementCtx, message: string): never {
  context.addIssue({ code: "custom", message });
  return z.NEVER;
}

function textFormat({
  message,
  toStoredValue,
  prepare = normalizeText,
}: TextFormat) {
  return z
    .string({
      error: (issue) => (isMissing(issue.input) ? REQUIRED_MESSAGE : message),
    })
    .transform((value, context) => {
      const text = prepare(value);
      if (text === "") return reject(context, REQUIRED_MESSAGE);
      return toStoredValue(text) ?? reject(context, message);
    });
}

function numberFormat({ message, isValid }: NumberFormat) {
  return z
    .number({
      error: (issue) => (isMissing(issue.input) ? REQUIRED_MESSAGE : message),
    })
    .refine(isValid, { error: message });
}

function countCharacters(text: string): number {
  return [...text].length;
}

function hasLength(text: string, { min, max }: LengthRange): boolean {
  const length = countCharacters(text);
  return length >= min && length <= max;
}

function hasAtMostTwoDecimals(value: number): boolean {
  const cents = value * 100;
  return Math.abs(cents - Math.round(cents)) < DECIMAL_TOLERANCE;
}

function capitalizeFirst(text: string): string {
  const [first = "", ...rest] = text;
  return first.toLocaleUpperCase(LOCALE) + rest.join("");
}

function capitalizePersonName(name: string): string {
  return name
    .toLocaleLowerCase(LOCALE)
    .split(" ")
    .map((word) =>
      NAME_PARTICLES.has(word)
        ? word
        : word.replace(
            /(^|[-'])(\p{L})/gu,
            (_match, separator: string, letter: string) =>
              separator + letter.toLocaleUpperCase(LOCALE),
          ),
    )
    .join(" ");
}

function capitalizeWords(text: string): string {
  return text.replace(
    /(^| )(\p{L})/gu,
    (_match, separator: string, letter: string) =>
      separator + letter.toLocaleUpperCase(LOCALE),
  );
}

function hasValidAreaCode(digits: string): boolean {
  return AREA_CODES.has(Number(digits.slice(0, 2)));
}

function isMobilePhone(digits: string): boolean {
  return MOBILE_PHONE_PATTERN.test(digits) && hasValidAreaCode(digits);
}

function isLandline(digits: string): boolean {
  return LANDLINE_PATTERN.test(digits) && hasValidAreaCode(digits);
}

function removePhoneMask(text: string): string | null {
  return PHONE_MASK_PATTERN.test(text) ? text.replace(/\D/g, "") : null;
}

function isStrongPassword(password: string): boolean {
  return (
    countCharacters(password) >= PASSWORD_MIN_LENGTH &&
    utf8.encode(password).length <= PASSWORD_MAX_BYTES &&
    UPPERCASE_LETTER_PATTERN.test(password) &&
    DIGIT_PATTERN.test(password) &&
    SPECIAL_CHARACTER_PATTERN.test(password)
  );
}

// Each character is worth its ASCII code minus 48, which also covers the
// alphanumeric CNPJ of the Receita Federal (A = 17, B = 18...).
function calculateCnpjCheckDigit(characters: string): number {
  const weights = CNPJ_WEIGHTS.slice(CNPJ_WEIGHTS.length - characters.length);
  const sum = [...characters].reduce(
    (total, character, index) =>
      total + (character.charCodeAt(0) - 48) * weights[index],
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCnpj(cnpj: string): boolean {
  if (!CNPJ_PATTERN.test(cnpj) || REPEATED_CHARACTER_PATTERN.test(cnpj)) {
    return false;
  }
  const firstDigit = calculateCnpjCheckDigit(cnpj.slice(0, 12));
  const secondDigit = calculateCnpjCheckDigit(cnpj.slice(0, 12) + firstDigit);
  return cnpj.slice(12) === `${firstDigit}${secondDigit}`;
}

function isProfileUrl(text: string, domain: string): boolean {
  const url = URL.parse(text);
  return (
    url !== null &&
    countCharacters(text) <= SOCIAL_URL_MAX_LENGTH &&
    text.toLowerCase().startsWith("https://") &&
    (url.hostname === domain || url.hostname.endsWith(`.${domain}`)) &&
    url.pathname.length > 1
  );
}

export const personNameSchema = textFormat({
  message: PERSON_NAME_MESSAGE,
  toStoredValue: (text) => {
    const name = text.replaceAll("’", "'");
    return PERSON_NAME_PATTERN.test(name) && hasLength(name, PERSON_NAME_LENGTH)
      ? capitalizePersonName(name)
      : null;
  },
});

export const emailSchema = textFormat({
  message: EMAIL_MESSAGE,
  toStoredValue: (text) => {
    const email = text.toLowerCase();
    return countCharacters(email) <= EMAIL_MAX_LENGTH &&
      z.regexes.email.test(email)
      ? email
      : null;
  },
});

// Client's mobile and the company's WhatsApp.
export const mobilePhoneSchema = textFormat({
  message: MOBILE_PHONE_MESSAGE,
  toStoredValue: (text) => {
    const digits = removePhoneMask(text);
    return digits !== null && isMobilePhone(digits) ? digits : null;
  },
});

export const companyPhoneSchema = textFormat({
  message: COMPANY_PHONE_MESSAGE,
  toStoredValue: (text) => {
    const digits = removePhoneMask(text);
    return digits !== null && (isLandline(digits) || isMobilePhone(digits))
      ? digits
      : null;
  },
});

// RN035: the password is stored as typed, without the text normalization.
export const passwordSchema = textFormat({
  message: PASSWORD_MESSAGE,
  prepare: (value) => value,
  toStoredValue: (password) => (isStrongPassword(password) ? password : null),
});

// Password typed at the login: only required and limited to the bytes bcrypt
// handles. RS005: a password outside the RS003 rules gets the same answer as a
// wrong one, so the composition rules apply only where a password is defined.
export const signInPasswordSchema = textFormat({
  message: PASSWORD_MESSAGE,
  prepare: (value) => value,
  toStoredValue: (password) =>
    utf8.encode(password).length <= PASSWORD_MAX_BYTES ? password : null,
});

export const plateSchema = textFormat({
  message: PLATE_MESSAGE,
  toStoredValue: (text) => {
    const match = PLATE_PATTERN.exec(text.toUpperCase());
    return match ? match[1] + match[2] : null;
  },
});

export const vehicleBrandModelSchema = textFormat({
  message: BRAND_MODEL_MESSAGE,
  toStoredValue: (text) =>
    hasLength(text, BRAND_MODEL_LENGTH) ? capitalizeWords(text) : null,
});

export const vehicleColorSchema = textFormat({
  message: COLOR_MESSAGE,
  toStoredValue: (text) =>
    COLOR_PATTERN.test(text) && hasLength(text, COLOR_LENGTH)
      ? capitalizeFirst(text.toLocaleLowerCase(LOCALE))
      : null,
});

// The current year comes from the caller: the server uses the company's time
// zone, and the form, the browser's clock.
export function vehicleYearSchema(currentYear: number) {
  const latestYear = currentYear + MODEL_YEARS_AHEAD;
  return numberFormat({
    message: `Informe um ano de ${FIRST_CAR_YEAR} a ${latestYear}.`,
    isValid: (year) =>
      Number.isInteger(year) && year >= FIRST_CAR_YEAR && year <= latestYear,
  });
}

// In reais; the server converts to cents before calculating (api.md).
export const moneySchema = numberFormat({
  message: MONEY_MESSAGE,
  isValid: (value) =>
    value > 0 && value <= MONEY_MAX && hasAtMostTwoDecimals(value),
});

export const percentSchema = numberFormat({
  message: PERCENT_MESSAGE,
  isValid: (value) =>
    value >= 0 && value <= PERCENT_MAX && hasAtMostTwoDecimals(value),
});

export const durationMinutesSchema = numberFormat({
  message: DURATION_MESSAGE,
  isValid: (minutes) =>
    Number.isInteger(minutes) &&
    minutes >= DURATION_MINUTES.min &&
    minutes <= DURATION_MINUTES.max,
});

export const cnpjSchema = textFormat({
  message: CNPJ_MESSAGE,
  toStoredValue: (text) => {
    const upperCase = text.toUpperCase();
    if (!CNPJ_MASK_PATTERN.test(upperCase)) return null;
    const cnpj = upperCase.replace(/[./-]/g, "");
    return isValidCnpj(cnpj) ? cnpj : null;
  },
});

export const instagramUrlSchema = textFormat({
  message: INSTAGRAM_MESSAGE,
  toStoredValue: (text) => (isProfileUrl(text, "instagram.com") ? text : null),
});

export const facebookUrlSchema = textFormat({
  message: FACEBOOK_MESSAGE,
  toStoredValue: (text) => (isProfileUrl(text, "facebook.com") ? text : null),
});

// Names of service, category and role; uniqueness is checked by the service.
export const entityNameSchema = textFormat({
  message: ENTITY_NAME_MESSAGE,
  toStoredValue: (text) =>
    hasLength(text, ENTITY_NAME_LENGTH) ? capitalizeFirst(text) : null,
});

// RN035 gives the staff member's job title the same format as the names.
export const jobTitleSchema = entityNameSchema;

// Business hours and breaks; the order of opening, break and closing is checked
// by the settings module.
export const halfHourTimeSchema = textFormat({
  message: HALF_HOUR_TIME_MESSAGE,
  toStoredValue: (text) => (HALF_HOUR_TIME_PATTERN.test(text) ? text : null),
});

// Company name, address and descriptions: plain text, HTML is not interpreted.
export function plainTextSchema(maxLength: number) {
  return textFormat({
    message: `Use até ${maxLength} caracteres.`,
    toStoredValue: (text) => (countCharacters(text) <= maxLength ? text : null),
  });
}

// An empty search term means no filter, so it is not required.
export const searchTermSchema = z
  .string({ error: SEARCH_TERM_MESSAGE })
  .transform(normalizeText)
  .refine((term) => countCharacters(term) <= SEARCH_TERM_MAX_LENGTH, {
    error: SEARCH_TERM_MESSAGE,
  });
