import type { BusinessDay } from "@/shared/api/settings";
import { TIME_SLOT_MINUTES } from "@/shared/constants/time-slot";

// docs/catalogo/paginas-publicas.md, Localização: the hours of one day as the
// home page shows them. The times are shown as the API gives them, HH:MM in
// the company's time zone (decision 0053).

const CLOSED_LABEL = "Fechado";
const MINUTES_PER_HOUR = 60;

function formatPeriod(start: string, end: string): string {
  return `${start} às ${end}`;
}

export function formatBusinessHours(day: BusinessDay): string {
  const { isOpen, opensAt, closesAt, breakStartsAt, breakEndsAt } = day;
  if (!isOpen || opensAt === null || closesAt === null) return CLOSED_LABEL;
  if (breakStartsAt === null || breakEndsAt === null) {
    return formatPeriod(opensAt, closesAt);
  }
  return `${formatPeriod(opensAt, breakStartsAt)} e ${formatPeriod(breakEndsAt, closesAt)}`;
}

// UC06, step 9: the start times of a day the booking offers, every 30
// minutes from the opening (included) to the closing (excluded), out of the
// break (RN013, RN035); none on a closed day. They only guide the screen: the
// API checks the time (UC06 FE03).
export function listStartTimes(day: BusinessDay): string[] {
  const { isOpen, opensAt, closesAt, breakStartsAt, breakEndsAt } = day;
  if (!isOpen || opensAt === null || closesAt === null) return [];
  const opening = toMinuteOfDay(opensAt);
  const slotCount = Math.ceil(
    (toMinuteOfDay(closesAt) - opening) / TIME_SLOT_MINUTES,
  );
  const isDuringBreak = (minute: number) =>
    breakStartsAt !== null &&
    breakEndsAt !== null &&
    minute >= toMinuteOfDay(breakStartsAt) &&
    minute < toMinuteOfDay(breakEndsAt);
  return Array.from(
    { length: slotCount },
    (_, index) => opening + index * TIME_SLOT_MINUTES,
  )
    .filter((minute) => !isDuringBreak(minute))
    .map(toTime);
}

function toMinuteOfDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
}

function toTime(minuteOfDay: number): string {
  const hours = Math.floor(minuteOfDay / MINUTES_PER_HOUR);
  const minutes = minuteOfDay % MINUTES_PER_HOUR;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
