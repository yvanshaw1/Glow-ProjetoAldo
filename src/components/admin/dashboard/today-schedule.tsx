import { CalendarX2Icon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DashboardAgendaItem } from "@/shared/api/dashboard";
import { formatCurrency } from "@/shared/format/currency";
import {
  formatCalendarDate,
  formatLongDate,
  formatTime,
} from "@/shared/format/date";
import { formatPlate } from "@/shared/format/plate";

// UC09, step 4 (RF043): the appointments scheduled for today, by time, with
// the status written (RN017) and the data copied in each one (RN037).
export function TodaySchedule({ agenda }: { agenda: DashboardAgendaItem[] }) {
  return (
    <section
      aria-labelledby="dashboard-agenda-title"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id="dashboard-agenda-title" className="font-semibold">
          Agenda do dia
        </h2>
        <p className="text-sm text-muted-foreground">
          {formatLongDate(formatCalendarDate(new Date().toISOString()))}
        </p>
      </div>
      {agenda.length === 0 ? (
        <EmptyState
          icon={CalendarX2Icon}
          title="Nenhum agendamento para hoje"
          description="Os agendamentos marcados para hoje aparecem aqui."
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {agenda.map((item) => (
            <AgendaRow key={item.id} item={item} />
          ))}
        </ol>
      )}
    </section>
  );
}

function AgendaRow({ item }: { item: DashboardAgendaItem }) {
  const { vehicle } = item;
  return (
    <li className="flex flex-col gap-2 rounded-xl bg-background p-5 shadow-neu-md md:flex-row md:items-center md:gap-5">
      <p className="font-semibold md:w-36">
        {formatTime(item.scheduledAt)} às {formatTime(item.estimatedEndAt)}
      </p>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="font-semibold">{item.clientName}</p>
        <p className="text-sm text-muted-foreground">
          {vehicle.brand} {vehicle.model} · {formatPlate(vehicle.plate)}
        </p>
        <p className="text-sm">
          {item.services.map(({ name }) => name).join(", ")}
        </p>
      </div>
      <p className="font-semibold">{formatCurrency(item.total)}</p>
      <div>
        <StatusBadge status={item.status} />
      </div>
    </li>
  );
}
