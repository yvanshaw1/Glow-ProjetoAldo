// RN035, column Exibição, and RNF016: values in reais, as R$ 1.250,00. Intl
// separates R$ from the number with a no-break space, so they never break
// into two lines.

const LOCALE = "pt-BR";
// R$ 99.999,99, the largest value of RN035, has seven digits.
const MAX_DIGITS = 7;
const CENTS_PER_REAL = 100;

const currencyFormat = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currencyFormat.format(value);
}

// The money field (docs/padroes/componentes.md): each typed digit enters as
// the last cent, so 1, 2, 5, 0, 0, 0 make R$ 1.250,00 and deleting removes
// the last digit. A digit beyond the largest value is ignored.
export function readCurrencyInput(text: string): number | null {
  const digits = text
    .replace(/\D/g, "")
    .replace(/^0+/, "")
    .slice(0, MAX_DIGITS);
  if (digits === "") return null;
  return Number(digits) / CENTS_PER_REAL;
}
