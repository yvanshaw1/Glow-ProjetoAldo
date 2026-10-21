// RN035, column Exibição: ABC1D23 in the Mercosul pattern and ABC-1234 in the
// old one. The plate field also uses it as the mask while the plate is typed,
// so it formats any count of characters up to seven.

const MAX_CHARACTERS = 7;
// The hyphen of the old pattern, after the three letters, once the next two
// characters are digits: in a Mercosul plate the second one is a letter.
const OLD_PATTERN_START = /^([A-Z]{3})(\d{2})/;

export function formatPlate(text: string): string {
  const characters = text
    .toUpperCase()
    .replace(/[^\dA-Z]/g, "")
    .slice(0, MAX_CHARACTERS);
  return characters.replace(OLD_PATTERN_START, "$1-$2");
}
