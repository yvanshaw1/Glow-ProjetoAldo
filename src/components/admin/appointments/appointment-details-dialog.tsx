"use client";

import { useState, type ReactNode } from "react";
import { AdvanceButton } from "@/components/admin/appointments/advance-button";
import { CompleteAppointmentDialog } from "@/components/admin/appointments/complete-appointment-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormAlert } from "@/components/shared/form-alert";
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
import { apiRequest, toApiError, type ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type {
  AdminAppointment,
  AdminAppointmentSummary,
} from "@/shared/api/appointments";
import {
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "@/shared/constants/appointment-statuses";
import { PAYMENT_METHOD_LABELS } from "@/shared/constants/payment-methods";
import { VEHICLE_SIZE_LABELS } from "@/shared/constants/vehicle-sizes";
import { VEHICLE_TYPE_LABELS } from "@/shared/constants/vehicle-types";
import { formatCurrency } from "@/shared/format/currency";
import { formatDateTime } from "@/shared/format/date";
import { formatDuration } from "@/shared/format/duration";
import { formatPercent } from "@/shared/format/percent";
import { formatPlate } from "@/shared/format/plate";

// UC10 step 4 and UC12 (docs/agendamento/agendamentos-do-painel.md): the whole
// appointment, read when the dialog opens, and the actions of its status.

const APPOINTMENTS_PATH = "/api/admin/appointments";

type AppointmentAction = "advance" | "cancel" | "complete";

// The actions each status offers. They only guide the screen: the API decides
// (RS008). RN017: the sequence; RN019: the staff cancels a scheduled or
// waiting appointment; RN018: the conclusion is from the Finalizado.
const STATUS_ACTIONS = {
  scheduled: ["advance", "cancel"],
  checked_in: ["advance", "cancel"],
  in_progress: ["advance"],
  awaiting_payment: ["complete"],
  completed: [],
  cancelled: [],
  rescheduled: [],
} as const satisfies Record<AppointmentStatus, readonly AppointmentAction[]>;

// RN017: the status each advance reaches.
const NEXT_STATUS: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  scheduled: "checked_in",
  checked_in: "in_progress",
  in_progress: "awaiting_payment",
};

// Rows held while the appointment loads.
const LOADING_ROWS = 6;

type AppointmentDetailsDialogProps = {
  appointment: AdminAppointmentSummary;
  onChange: () => void;
};

export function AppointmentDetailsDialog({
  appointment,
  onChange,
}: AppointmentDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // UC12 step 5: once the status changes, the dialog closes and the list is
  // read again.
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
        {/* Each card has one: the client and the date tell them apart. */}
        <span className="sr-only">
          {" "}
          de {appointment.clientName}, {formatDateTime(appointment.scheduledAt)}
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
  const { data, error, reload } = useApiQuery<AdminAppointment>(
    `${APPOINTMENTS_PATH}/${id}`,
  );
  if (data !== null) {
    return (
      <AppointmentContent
        appointment={data}
        onChange={onChange}
        reload={reload}
      />
    );
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
  appointment: AdminAppointment;
  onChange: () => void;
  reload: () => void;
};

// A new key on every failure, so the notice takes the focus each time.
type Failure = { key: number; error: ApiError };

function AppointmentContent({
  appointment,
  onChange,
  reload,
}: AppointmentContentProps) {
  const [failure, setFailure] = useState<Failure | null>(null);
  const {
    id,
    status,
    clientName,
    scheduledAt,
    estimatedEndAt,
    estimatedDurationMinutes,
    vehicle,
    services,
    paymentMethod,
    subtotal,
    feePercent,
    total,
    paymentOptions,
  } = appointment;
  const actions: readonly AppointmentAction[] = STATUS_ACTIONS[status];
  const nextStatus = NEXT_STATUS[status];

  // UC12 FE01: a status that changed meanwhile is read again, so the label and
  // the actions follow the status it has now.
  function refreshWhenStale(error: ApiError) {
    if (error.code === "INVALID_STATUS") reload();
  }

  function failAdvance(error: ApiError) {
    setFailure((current) => ({ key: (current?.key ?? 0) + 1, error }));
    refreshWhenStale(error);
  }

  async function cancel() {
    try {
      await apiRequest(`${APPOINTMENTS_PATH}/${id}/cancel`, {
        method: "POST",
      });
    } catch (error) {
      refreshWhenStale(toApiError(error));
      throw error;
    }
  }

  return (
    <>
      {failure && (
        <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
      )}
      <div className="flex flex-col gap-5">
        <StatusBadge status={status} />
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem term="Cliente" className="sm:col-span-2">
            {clientName}
          </DetailItem>
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
          {/* RF053: only the Finalizado, as the route worked each one out. */}
          {paymentOptions && (
            <DetailItem
              term="Total por forma de pagamento"
              className="sm:col-span-2"
            >
              <ul className="flex flex-col gap-1">
                {paymentOptions.map((option) => (
                  <li
                    key={option.paymentMethod}
                    className="flex justify-between gap-3"
                  >
                    <span>
                      {PAYMENT_METHOD_LABELS[option.paymentMethod]}
                      <FeeText feePercent={option.feePercent} />
                    </span>
                    <span className="shrink-0">
                      {formatCurrency(option.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </DetailItem>
          )}
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
      <DialogFooter>
        {nextStatus && actions.includes("advance") && (
          <AdvanceButton
            id={id}
            label={`Avançar para ${APPOINTMENT_STATUS_LABELS[nextStatus]}`}
            onAdvanced={onChange}
            onFailed={failAdvance}
          />
        )}
        <CompleteAppointmentDialog
          id={id}
          canOpen={actions.includes("complete")}
          onCompleted={onChange}
          onStale={reload}
        />
        {/* UC12 FA02, RN019: it stays mounted, hidden, if a reload takes the
            action away while its confirmation shows a failure. */}
        <ConfirmDialog
          trigger={
            <Button variant="destructive" hidden={!actions.includes("cancel")}>
              Cancelar agendamento
            </Button>
          }
          title="Cancelar este agendamento?"
          description="O agendamento passa a Cancelado e vai para o histórico. Esta ação não pode ser desfeita."
          cancelLabel="Voltar"
          confirmLabel="Cancelar agendamento"
          loadingLabel="Cancelando…"
          isDestructive
          onConfirm={cancel}
          onConfirmed={onChange}
        />
      </DialogFooter>
    </>
  );
}

// RN012, for the total of a payment method of the list.
function FeeText({ feePercent }: { feePercent: number }) {
  if (feePercent === 0) return null;
  return (
    <span className="block text-sm text-muted-foreground">
      {feePercent > 0 ? "Acréscimo" : "Desconto"} de{" "}
      {formatPercent(Math.abs(feePercent))}
    </span>
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
