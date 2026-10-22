"use client";

import { useState, type ReactNode } from "react";
import { AppointmentChangeDialog } from "@/components/portal/appointments/appointment-change-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type {
  ClientAppointment,
  ClientAppointmentSummary,
} from "@/shared/api/appointments";
import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";
import { PAYMENT_METHOD_LABELS } from "@/shared/constants/payment-methods";
import { VEHICLE_SIZE_LABELS } from "@/shared/constants/vehicle-sizes";
import { VEHICLE_TYPE_LABELS } from "@/shared/constants/vehicle-types";
import { formatCurrency } from "@/shared/format/currency";
import { formatDateTime } from "@/shared/format/date";
import { formatDuration } from "@/shared/format/duration";
import { formatPercent } from "@/shared/format/percent";
import { formatPlate } from "@/shared/format/plate";

// UC07 (docs/agendamento/meus-agendamentos.md): the whole appointment, read
// when the dialog opens, and the actions of its status.

const APPOINTMENTS_PATH = "/api/me/appointments";

type AppointmentAction = "cancel" | "edit" | "reschedule";

// The actions each status offers. They only guide the screen: the API
// decides (RS008). RN019: the client cancels only a scheduled appointment.
const STATUS_ACTIONS = {
  scheduled: ["edit", "cancel"],
  checked_in: [],
  in_progress: [],
  awaiting_payment: [],
  completed: ["reschedule"],
  cancelled: [],
  rescheduled: [],
} as const satisfies Record<AppointmentStatus, readonly AppointmentAction[]>;

// Rows held while the appointment loads.
const LOADING_ROWS = 6;

const SHOW_CHANGE_NOTICE: Record<AppointmentStatus, boolean> = {
  scheduled: false,
  checked_in: true,
  in_progress: true,
  awaiting_payment: true,
  completed: false,
  cancelled: false,
  rescheduled: false,
};

type AppointmentDetailsDialogProps = {
  appointment: ClientAppointmentSummary;
  onChange: () => void;
};

export function AppointmentDetailsDialog({
  appointment,
  onChange,
}: AppointmentDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // UC07 FA01: once cancelled, both dialogs close and the list is read again.
  function closeChanged() {
    setIsOpen(false);
    onChange();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="secondary"
            className="w-full sm:w-auto sm:self-start"
          />
        }
      >
        Ver detalhes
        {/* Each card has one: the date tells them apart. */}
        <span className="sr-only">
          {" "}
          do agendamento de {formatDateTime(appointment.scheduledAt)}
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do agendamento</DialogTitle>
        </DialogHeader>
        <AppointmentDetails id={appointment.id} onChange={closeChanged} />
      </DialogContent>
    </Dialog>
  );
}

type AppointmentDetailsProps = {
  id: string;
  onChange: () => void;
};

// Mounted with the dialog, so each opening reads the route again.
function AppointmentDetails({ id, onChange }: AppointmentDetailsProps) {
  const { data, error, reload } = useApiQuery<ClientAppointment>(
    `${APPOINTMENTS_PATH}/${id}`,
  );
  if (data !== null) {
    return <AppointmentContent appointment={data} onChange={onChange} />;
  }
  // RNF004: the place of the detail while loading; a failure offers a retry.
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {error.message}
          <Button variant="secondary" onClick={reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div aria-busy className="flex flex-col gap-4">
      <Skeleton className="h-6 w-24" />
      {Array.from({ length: LOADING_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

type AppointmentContentProps = {
  appointment: ClientAppointment;
  onChange: () => void;
};

function AppointmentContent({
  appointment,
  onChange,
}: AppointmentContentProps) {
  const [currentAppointment, setCurrentAppointment] = useState(appointment);
  const {
    id,
    status,
    scheduledAt,
    estimatedEndAt,
    estimatedDurationMinutes,
    vehicle,
    services,
    paymentMethod,
    subtotal,
    feePercent,
    total,
  } = currentAppointment;
  const actions: readonly AppointmentAction[] = STATUS_ACTIONS[status];
  return (
    <>
      <div className="flex flex-col gap-5">
        <StatusBadge status={status} />
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem term="Data e horário">
            {formatDateTime(scheduledAt)}
          </DetailItem>
          <DetailItem term="Previsão de conclusão">
            {formatDateTime(estimatedEndAt)}
          </DetailItem>
          <DetailItem term="Duração estimada">
            {formatDuration(estimatedDurationMinutes)}
          </DetailItem>
          <DetailItem term="Veículo" className="sm:col-span-2">
            <span className="block font-semibold">
              {vehicle.brand} {vehicle.model}
            </span>
            <span className="block">
              Placa {formatPlate(vehicle.plate)} · {vehicle.color} ·{" "}
              {vehicle.year}
            </span>
            <span className="block">
              {VEHICLE_TYPE_LABELS[vehicle.type]} · Porte{" "}
              {VEHICLE_SIZE_LABELS[vehicle.size]}
            </span>
          </DetailItem>
          <DetailItem term="Serviços" className="sm:col-span-2">
            <ul className="flex flex-col gap-1">
              {services.map((service) => (
                <li key={service.id} className="flex justify-between gap-3">
                  <span>{service.name}</span>
                  <span className="shrink-0">
                    {formatCurrency(service.price)}
                  </span>
                </li>
              ))}
            </ul>
          </DetailItem>
          <DetailItem term="Forma de pagamento" className="sm:col-span-2">
            {PAYMENT_METHOD_LABELS[paymentMethod]}
          </DetailItem>
        </dl>
        <div className="flex flex-col gap-1 border-t border-border pt-4">
          <p className="flex justify-between gap-3">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </p>
          {/* RN012: the sign tells a surcharge from a discount. */}
          {feePercent !== 0 && (
            <p>
              {feePercent > 0 ? "Acréscimo" : "Desconto"} de{" "}
              {formatPercent(Math.abs(feePercent))}
            </p>
          )}
          <p className="flex justify-between gap-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </p>
        </div>
      </div>
      {SHOW_CHANGE_NOTICE[status] && (
        <Alert>
          <AlertDescription>
            Este agendamento não pode mais ser alterado por aqui. Para mudar
            algo, fale com a empresa.
          </AlertDescription>
        </Alert>
      )}
      <DialogFooter>
        <AppointmentChangeDialog
          mode="edit"
          appointment={currentAppointment}
          canOpen={actions.includes("edit")}
          onChanged={onChange}
          onReloaded={setCurrentAppointment}
        />
        <AppointmentChangeDialog
          mode="reschedule"
          appointment={currentAppointment}
          canOpen={actions.includes("reschedule")}
          onChanged={onChange}
          onReloaded={setCurrentAppointment}
        />
        {actions.includes("cancel") && (
          <CancelAppointment id={id} onChange={onChange} />
        )}
      </DialogFooter>
    </>
  );
}

type DetailItemProps = {
  term: string;
  className?: string;
  children: ReactNode;
};

function DetailItem({ term, className, children }: DetailItemProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// UC07 FA01 and FE02: the cancellation asks for confirmation; a failure, as
// the INVALID_STATUS of a status that changed, shows inside it.
function CancelAppointment({ id, onChange }: AppointmentDetailsProps) {
  async function cancel() {
    await apiRequest(`${APPOINTMENTS_PATH}/${id}/cancel`, { method: "POST" });
  }
  return (
    <ConfirmDialog
      trigger={<Button variant="destructive">Cancelar agendamento</Button>}
      title="Cancelar este agendamento?"
      description="O agendamento passa a Cancelado e vai para o histórico. Esta ação não pode ser desfeita."
      cancelLabel="Voltar"
      confirmLabel="Cancelar agendamento"
      loadingLabel="Cancelando…"
      isDestructive
      onConfirm={cancel}
      onConfirmed={onChange}
    />
  );
}
