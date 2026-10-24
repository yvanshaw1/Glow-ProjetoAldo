import type { ReactNode } from "react";
import { AppointmentDetailsDialog } from "@/components/admin/appointments/appointment-details-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AdminAppointmentSummary } from "@/shared/api/appointments";
import { formatCurrency } from "@/shared/format/currency";
import { formatDateTime } from "@/shared/format/date";
import { formatPlate } from "@/shared/format/plate";

// UC10, step 4 (docs/agendamento/agendamentos-do-painel.md): the summary of
// an appointment, with the status written (RN017) and the data copied in it
// (RN037).

type AppointmentCardProps = {
  appointment: AdminAppointmentSummary;
  onChange: () => void;
};

export function AppointmentCard({
  appointment,
  onChange,
}: AppointmentCardProps) {
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
      <div className="mt-auto flex flex-col pt-2">
        <AppointmentDetailsDialog
          appointment={appointment}
          onChange={onChange}
        />
      </div>
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
