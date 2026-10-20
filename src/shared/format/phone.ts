// RN035, column Exibição: (82) 99999-8888 for a mobile phone and
// (82) 3333-4444 for a landline. The phone fields also use it as the mask
// while the number is typed, so it formats any count of digits up to eleven.

const MAX_DIGITS = 11;
const AREA_CODE_LENGTH = 2;
const LANDLINE_DIGITS = 10;
const LANDLINE_PREFIX_LENGTH = 4;
const MOBILE_PREFIX_LENGTH = 5;

export function formatPhone(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, MAX_DIGITS);
  const areaCode = digits.slice(0, AREA_CODE_LENGTH);
  const number = digits.slice(AREA_CODE_LENGTH);
  if (digits === "") return "";
  if (number === "") return `(${areaCode}`;

  // The prefix grows from four to five digits only with the eleventh digit
  // of a mobile phone.
  const prefixLength =
    digits.length > LANDLINE_DIGITS
      ? MOBILE_PREFIX_LENGTH
      : LANDLINE_PREFIX_LENGTH;
  const prefix = number.slice(0, prefixLength);
  const suffix = number.slice(prefixLength);
  return suffix === ""
    ? `(${areaCode}) ${prefix}`
    : `(${areaCode}) ${prefix}-${suffix}`;
}

// The links need Brazil's country code, which RN035 does not store.
const COUNTRY_CODE = "55";

// A stored phone (its digits) as a link for calling.
export function formatPhoneLink(digits: string): string {
  return `tel:+${COUNTRY_CODE}${digits}`;
}

// A stored WhatsApp (its digits) as WhatsApp's own link to a chat.
export function formatWhatsAppLink(digits: string): string {
  return `https://wa.me/${COUNTRY_CODE}${digits}`;
}
