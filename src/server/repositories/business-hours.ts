import "server-only";
import { getServiceClient } from "@/server/supabase/clients";
import type { BusinessDay } from "@/shared/api/settings";

// Table business_hours, one row per weekday (docs/configuracoes/dados.md).

type BusinessHoursRow = {
  weekday: number;
  is_open: boolean;
  opens_at: string | null;
  closes_at: string | null;
  break_starts_at: string | null;
  break_ends_at: string | null;
};

const BUSINESS_HOURS_COLUMNS =
  "weekday, is_open, opens_at, closes_at, break_starts_at, break_ends_at";
// The time type comes as 08:00:00; the API and the rules use HH:MM
// (docs/padroes/api.md).
const TIME_OF_DAY_LENGTH = "HH:MM".length;

function toTimeOfDay(time: string | null): string | null {
  return time === null ? null : time.slice(0, TIME_OF_DAY_LENGTH);
}

function toBusinessDay(row: BusinessHoursRow): BusinessDay {
  return {
    weekday: row.weekday,
    isOpen: row.is_open,
    opensAt: toTimeOfDay(row.opens_at),
    closesAt: toTimeOfDay(row.closes_at),
    breakStartsAt: toTimeOfDay(row.break_starts_at),
    breakEndsAt: toTimeOfDay(row.break_ends_at),
  };
}

// The seven days, from Sunday (0) to Saturday (6).
export async function listBusinessHours(): Promise<BusinessDay[]> {
  const { data, error } = await getServiceClient()
    .from("business_hours")
    .select(BUSINESS_HOURS_COLUMNS)
    .order("weekday")
    .overrideTypes<BusinessHoursRow[], { merge: false }>();
  if (error) {
    throw error;
  }
  return data.map(toBusinessDay);
}
