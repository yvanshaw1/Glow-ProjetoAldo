// RN035, column Exibição: the average duration of a service as 1 h 30 min,
// without the part equal to zero (45 min, 2 h). The two parts are joined
// here, not by Intl.DurationFormat, whose list pattern changes the result
// between browsers ("1 h e 30 min" in the short style).

const LOCALE = "pt-BR";
const MINUTES_PER_HOUR = 60;

const hoursFormat = new Intl.NumberFormat(LOCALE, {
  style: "unit",
  unit: "hour",
  unitDisplay: "short",
});

const minutesFormat = new Intl.NumberFormat(LOCALE, {
  style: "unit",
  unit: "minute",
  unitDisplay: "short",
});

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const parts = [
    hours > 0 && hoursFormat.format(hours),
    minutes > 0 && minutesFormat.format(minutes),
  ].filter(Boolean);
  return parts.join(" ");
}
