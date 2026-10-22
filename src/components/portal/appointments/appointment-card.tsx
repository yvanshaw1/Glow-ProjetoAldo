import type { ReactNode } from "react";
import { AppointmentDetailsDialog } from "@/components/portal/appointments/appointment-details-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ClientAppointmentSummary } from "@/shared/api/appointments";
import { formatCurrency } from "@/shared/format/currency";
import { formatDateTime } from "@/shared/format/date";
import { formatPlate } from "@/shared/format/plate";

// UC07, step 2 (docs/agendamento/meus-agendamentos.md): the summary of an
// appointment, with the status written (RN017); the detail and the actions
// are in the dialog.

type AppointmentCardProps = {
  appointment: ClientAppointmentSummary;
  onChange: () => void;
};

export function AppointmentCard({
  appointment,
  onChange,
}: AppointmentCardProps) {
  const { status, vehicle, scheduledAt, estimatedEndAt, services, total } =
    appointment;
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md">
      <StatusBadge status={status} />
      <h2 className="font-semibold">
        {vehicle.brand} {vehicle.model}
      </h2>
      <p className="text-muted-foreground">
        Placa {formatPlate(vehicle.plate)} · {vehicle.color}
      </p>
      <CardLine label="Data">{formatDateTime(scheduledAt)}</CardLine>
      <CardLine label="Previsão de conclusão">
        {formatDateTime(estimatedEndAt)}
      </CardLine>
      <CardLine label="Serviços">
        {services.map(({ name }) => name).join(", ")}
      </CardLine>
      <p className="font-semibold">Total: {formatCurrency(total)}</p>
      <div className="mt-auto flex flex-col pt-2">
        <AppointmentDetailsDialog
          appointment={appointment}
          onCancelled={onChange}
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
