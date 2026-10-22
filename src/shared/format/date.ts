import { COMPANY_TIME_ZONE } from "@/shared/constants/time-zone";

// RN035, column Exibição, and RNF016: dates as 15/10/2026 and dates with the
// time as 15/10/2026 às 09:30. An instant (ISO 8601 with the offset, as the
// API sends it) shows in the company's time zone, whatever the zone of the
// device (decision 0053).

const LOCALE = "pt-BR";
// A calendar date, like the dashboard period, has no time zone: as an
// instant, 2026-10-01 is midnight in UTC, still 30/09 in Maceió.
const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: COMPANY_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const yearFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: COMPANY_TIME_ZONE,
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: COMPANY_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// en-CA writes the calendar day as 2026-10-21.
const calendarDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: COMPANY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// The offset of the company's time zone at an instant, as GMT-03:00.
const offsetFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: COMPANY_TIME_ZONE,
  timeZoneName: "longOffset",
});

// A calendar date is read as midnight in UTC and written in UTC, so the day
// never moves.
const monthFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

const longDateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(value: string): string {
  const calendarDate = CALENDAR_DATE_PATTERN.exec(value);
  if (calendarDate) {
    const [, year, month, day] = calendarDate;
    return `${day}/${month}/${year}`;
  }
  return dateFormat.format(new Date(value));
}

// Intl joins the date and the time with a comma; RN035 joins them with "às".
export function formatDateTime(value: string): string {
  const instant = new Date(value);
  return `${dateFormat.format(instant)} às ${timeFormat.format(instant)}`;
}

// The year of an instant in the company's time zone, as in the copyright
// notice of the portal footer.
export function formatYear(value: string): string {
  return yearFormat.format(new Date(value));
}

// The calendar day of an instant in the company's time zone, as 2026-10-21:
// the day of the booking calendar.
export function formatCalendarDate(value: string): string {
  return calendarDateFormat.format(new Date(value));
}

// The time of an instant in the company's time zone, as 09:30.
export function formatTime(value: string): string {
  return timeFormat.format(new Date(value));
}

// The instant of a calendar day and a time (HH:MM) in the company's time
// zone, as the API takes it: ISO 8601 with the offset (docs/padroes/api.md).
// The offset comes from Intl, not from the code (decision 0053).
export function toCompanyInstant(date: string, time: string): string {
  const localAsUtc = new Date(`${date}T${time}:00Z`);
  return `${date}T${time}:00${readOffset(localAsUtc)}`;
}

// The month of a calendar day, as outubro de 2026.
export function formatMonth(date: string): string {
  return monthFormat.format(new Date(`${date}T00:00:00Z`));
}

// A calendar day in full, as quarta-feira, 28 de outubro de 2026: the name of
// a day of the booking calendar for a screen reader.
export function formatLongDate(date: string): string {
  return longDateFormat.format(new Date(`${date}T00:00:00Z`));
}

// Brazil has no daylight saving time since 2019 (decision 0053), so the
// offset near the local time is the offset at it. A zone at UTC writes only
// "GMT".
function readOffset(instant: Date): string {
  const zoneName = offsetFormat
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;
  return !zoneName || zoneName === "GMT" ? "+00:00" : zoneName.slice(3);
}
