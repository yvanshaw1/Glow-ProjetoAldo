import type { BusinessDay } from "@/shared/api/settings";

// docs/catalogo/paginas-publicas.md, Localização: the hours of one day as the
// home page shows them. The times are shown as the API gives them, HH:MM in
// the company's time zone (decision 0053).

const CLOSED_LABEL = "Fechado";

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
