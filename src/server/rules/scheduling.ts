import "server-only";
import { TIME_SLOT_MINUTES } from "@/shared/constants/time-slot";

// docs/agendamento/calculos.md, section 3 (RN013 to RN016, RN034). The day and
// the time of an instant are read in the time zone received (decision 0053)
// with Intl, without a date library. Nothing here looks at other
// appointments: there is no capacity or conflict control (RN016).

// A row of business_hours, with the times as "HH:MM" (docs/configuracoes).
export type BusinessDay = {
  // From Sunday (0) to Saturday (6).
  weekday: number;
  isOpen: boolean;
  opensAt: string | null;
  closesAt: string | null;
  breakStartsAt: string | null;
  breakEndsAt: string | null;
};

export type AvailabilityError =
  "CLOSED_DAY" | "OUTSIDE_BUSINESS_HOURS" | "DURING_BREAK" | "OFF_TIME_SLOT";

export type StartError = AvailabilityError | "IN_THE_PAST";

type CalendarDate = { year: number; month: number; day: number };

type LocalTime = CalendarDate & { minuteOfDay: number };

// Minutes of the day, from the start (included) to the end (excluded).
type WorkingPeriod = { start: number; end: number };

const MINUTES_PER_HOUR = 60;
const MILLISECONDS_PER_MINUTE = 60_000;

function readLocalTime(instant: Date, timeZone: string): LocalTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(instant);
  const readPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: readPart("year"),
    month: readPart("month"),
    day: readPart("day"),
    minuteOfDay: readPart("hour") * MINUTES_PER_HOUR + readPart("minute"),
  };
}

// The calendar date has no time zone: its arithmetic is done in UTC.
function toUtcDate({ year, month, day }: CalendarDate, minuteOfDay = 0) {
  return Date.UTC(year, month - 1, day, 0, minuteOfDay);
}

// Date.UTC carries the extra days into the next months and years.
function addDays({ year, month, day }: CalendarDate, days: number) {
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

function findWeekday(date: CalendarDate): number {
  return new Date(toUtcDate(date)).getUTCDay();
}

// How far the local clock is from UTC at the instant.
function findOffset(instant: number, timeZone: string): number {
  const wholeMinute = instant - (instant % MILLISECONDS_PER_MINUTE);
  const local = readLocalTime(new Date(wholeMinute), timeZone);
  return toUtcDate(local, local.minuteOfDay) - wholeMinute;
}

// The instant of a local date and time. The offset is taken again at the
// first guess, for a zone whose offset changes during the day.
function toInstant(
  date: CalendarDate,
  minuteOfDay: number,
  timeZone: string,
): Date {
  const localAsUtc = toUtcDate(date, minuteOfDay);
  const firstGuess = localAsUtc - findOffset(localAsUtc, timeZone);
  return new Date(localAsUtc - findOffset(firstGuess, timeZone));
}

function toMinuteOfDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
}

// RN034: from the opening to the break and from the end of the break to the
// closing; a closed day, or one missing from the list, has none.
function findWorkingPeriods(day: BusinessDay | undefined): WorkingPeriod[] {
  if (!day?.isOpen || day.opensAt === null || day.closesAt === null) return [];
  const opensAt = toMinuteOfDay(day.opensAt);
  const closesAt = toMinuteOfDay(day.closesAt);
  if (day.breakStartsAt === null || day.breakEndsAt === null) {
    return [{ start: opensAt, end: closesAt }];
  }
  return [
    { start: opensAt, end: toMinuteOfDay(day.breakStartsAt) },
    { start: toMinuteOfDay(day.breakEndsAt), end: closesAt },
  ];
}

function findBusinessDay(
  businessHours: readonly BusinessDay[],
  date: CalendarDate,
): BusinessDay | undefined {
  const weekday = findWeekday(date);
  return businessHours.find((day) => day.weekday === weekday);
}

// RN014: informative, the sum of the average durations.
export function calculateEstimatedDuration(
  services: readonly { durationMinutes: number }[],
): number {
  return services.reduce((sum, service) => sum + service.durationMinutes, 0);
}

// RN013: an open day, from the opening (included) to the closing (excluded),
// out of the break, on the hour or half hour (RN035). The current instant is
// not checked: after the vehicle arrives, the staff moves the date back
// (RN033).
export function findAvailabilityError({
  startsAt,
  businessHours,
  timeZone,
}: {
  startsAt: Date;
  businessHours: readonly BusinessDay[];
  timeZone: string;
}): AvailabilityError | null {
  const local = readLocalTime(startsAt, timeZone);
  const day = findBusinessDay(businessHours, local);
  if (!day?.isOpen || day.opensAt === null || day.closesAt === null) {
    return "CLOSED_DAY";
  }
  const minute = local.minuteOfDay;
  if (
    minute < toMinuteOfDay(day.opensAt) ||
    minute >= toMinuteOfDay(day.closesAt)
  ) {
    return "OUTSIDE_BUSINESS_HOURS";
  }
  const isDuringBreak =
    day.breakStartsAt !== null &&
    day.breakEndsAt !== null &&
    minute >= toMinuteOfDay(day.breakStartsAt) &&
    minute < toMinuteOfDay(day.breakEndsAt);
  if (isDuringBreak) return "DURING_BREAK";
  const isOnTimeSlot =
    minute % TIME_SLOT_MINUTES === 0 &&
    startsAt.getTime() % MILLISECONDS_PER_MINUTE === 0;
  return isOnTimeSlot ? null : "OFF_TIME_SLOT";
}

// A new appointment or a rescheduling: within the hours and not before now
// (RN013, RN015). The moment of the booking itself is not limited.
export function findStartError({
  startsAt,
  businessHours,
  timeZone,
  now,
}: {
  startsAt: Date;
  businessHours: readonly BusinessDay[];
  timeZone: string;
  now: Date;
}): StartError | null {
  const availabilityError = findAvailabilityError({
    startsAt,
    businessHours,
    timeZone,
  });
  if (availabilityError) return availabilityError;
  return startsAt < now ? "IN_THE_PAST" : null;
}

// RN034: the duration spent only in the working periods, skipping the break,
// the night and the closed days. Work that ends exactly at the closing or at
// the start of the break ends there. A start out of the hours, as a date kept
// in an edit (RN033), starts counting at the next period. null when no day of
// the week has working time.
export function calculateEstimatedEnd({
  startsAt,
  durationMinutes,
  businessHours,
  timeZone,
}: {
  startsAt: Date;
  durationMinutes: number;
  businessHours: readonly BusinessDay[];
  timeZone: string;
}): Date | null {
  const hasWorkingTime = businessHours.some((day) =>
    findWorkingPeriods(day).some((period) => period.end > period.start),
  );
  if (!hasWorkingTime) return null;
  const start = readLocalTime(startsAt, timeZone);
  let remainingMinutes = durationMinutes;
  for (let dayOffset = 0; ; dayOffset += 1) {
    const date = addDays(start, dayOffset);
    const fromMinute = dayOffset === 0 ? start.minuteOfDay : 0;
    for (const period of findWorkingPeriods(
      findBusinessDay(businessHours, date),
    )) {
      const begin = Math.max(period.start, fromMinute);
      const availableMinutes = period.end - begin;
      if (availableMinutes <= 0) continue;
      if (remainingMinutes <= availableMinutes) {
        return toInstant(date, begin + remainingMinutes, timeZone);
      }
      remainingMinutes -= availableMinutes;
    }
  }
}
