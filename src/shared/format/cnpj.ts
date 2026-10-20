// RN035, column Exibição: 12.345.678/0001-95, with the letters of the
// alphanumeric CNPJ in upper case. The CNPJ field also uses it as the mask
// while the CNPJ is typed, so it formats any count of characters up to
// fourteen.

const MAX_CHARACTERS = 14;
// The separator written before the character at each position.
const SEPARATORS_BEFORE: Readonly<Record<number, string>> = {
  2: ".",
  5: ".",
  8: "/",
  12: "-",
};

export function formatCnpj(text: string): string {
  const characters = text
    .toUpperCase()
    .replace(/[^\dA-Z]/g, "")
    .slice(0, MAX_CHARACTERS);
  return [...characters]
    .map((character, index) => (SEPARATORS_BEFORE[index] ?? "") + character)
    .join("");
}
