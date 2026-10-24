import type { ReactNode } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AdminAppointmentSummary } from "@/shared/api/appointments";
import { formatCurrency } from "@/shared/format/currency";
import { formatDateTime } from "@/shared/format/date";
import { formatPlate } from "@/shared/format/plate";

// UC10, step 4 (docs/agendamento/agendamentos-do-painel.md): the summary of
// an appointment, with the status written (RN017) and the data copied in it
// (RN037).

export function AppointmentCard({
  appointment,
}: {
  appointment: AdminAppointmentSummary;
}) {
  const { status, clientName, vehicle, scheduledAt, estimatedEndAt } =
    appointment;
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md">
      <StatusBadge status={status} />
      <h2 className="font-semibold">{clientName}</h2>
      <p className="text-muted-foreground">
        {vehicle.brand} {vehicle.model} · {formatPlate(vehicle.plate)}
      </p>
      <CardLine label="Data">{formatDateTime(scheduledAt)}</CardLine>
      <CardLine label="Previsão de conclusão">
        {formatDateTime(estimatedEndAt)}
      </CardLine>
      <CardLine label="Serviços">
        {appointment.services.map(({ name }) => name).join(", ")}
      </CardLine>
      <p className="font-semibold">
        Total: {formatCurrency(appointment.total)}
      </p>
    </article>
  );
}

function CardLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p>
      <span className="text-muted-foreground">{label}:</span> {children}
    </p>
  );
}
