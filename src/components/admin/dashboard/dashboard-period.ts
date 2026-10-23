// UC09, RN035: the period of the dashboard, as calendar days (2026-10-01), and
// the shortcuts of the selector (docs/agendamento/dashboard-do-painel.md).
// "Today" is the calendar day in the company's time zone, given by the caller,
// so these functions read no clock.

export type Period = { from: string; to: string };

export const PERIOD_PRESETS = [
  { id: "month", label: "Este mês" },
  { id: "today", label: "Hoje" },
  { id: "week", label: "7 dias" },
  { id: "thirtyDays", label: "30 dias" },
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number]["id"];

const WEEK_DAYS = 7;
const THIRTY_DAYS = 30;
const MS_PER_DAY = 86_400_000;

// The month of today, from its first day to its last one.
function findMonth(today: string): Period {
  const date = new Date(`${today}T00:00:00Z`);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return {
    from: fromDayNumber(Date.UTC(year, month, 1) / MS_PER_DAY),
    // Day 0 of the next month is the last one of this month.
    to: fromDayNumber(Date.UTC(year, month + 1, 0) / MS_PER_DAY),
  };
}

// The last days, counting today.
function findLastDays(today: string, count: number): Period {
  const todayNumber = Date.parse(`${today}T00:00:00Z`) / MS_PER_DAY;
  return { from: fromDayNumber(todayNumber + 1 - count), to: today };
}

// A calendar day has no time zone: it is counted in days since 1970-01-01, so
// the arithmetic never meets a time change.
function fromDayNumber(dayNumber: number): string {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

const PRESET_PERIODS = {
  month: findMonth,
  today: (today) => ({ from: today, to: today }),
  week: (today) => findLastDays(today, WEEK_DAYS),
  thirtyDays: (today) => findLastDays(today, THIRTY_DAYS),
} as const satisfies Record<PeriodPreset, (today: string) => Period>;

export function findPresetPeriod(preset: PeriodPreset, today: string): Period {
  return PRESET_PERIODS[preset](today);
}

export function isSamePeriod(first: Period | null, second: Period | null) {
  return (
    first !== null &&
    second !== null &&
    first.from === second.from &&
    first.to === second.to
  );
}
