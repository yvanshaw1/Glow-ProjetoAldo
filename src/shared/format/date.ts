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

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: COMPANY_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
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
