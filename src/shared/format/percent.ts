// RN035, column Exibição: the percent of a payment method as 5,00%, with two
// decimals. It takes the percent as stored (5 for 5%).

const LOCALE = "pt-BR";
const PERCENT_SCALE = 100;
const DECIMALS = 2;

const percentFormat = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: DECIMALS,
  maximumFractionDigits: DECIMALS,
});

export function formatPercent(value: number): string {
  return percentFormat.format(value / PERCENT_SCALE);
}
