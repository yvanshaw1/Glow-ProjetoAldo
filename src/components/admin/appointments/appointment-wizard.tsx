"use client";

import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import type { AppointmentFormValues } from "@/components/admin/appointments/appointment-form-values";
import { BookingClientStep } from "@/components/admin/appointments/booking-client-step";
import { BookingPaymentStep } from "@/components/shared/booking-payment-step";
import { BookingScheduleStep } from "@/components/shared/booking-schedule-step";
import { BookingServicesStep } from "@/components/shared/booking-services-step";
import { BookingSummary } from "@/components/shared/booking-summary";
import { BookingVehicleStep } from "@/components/shared/booking-vehicle-step";
import { FormAlert } from "@/components/shared/form-alert";
import { StepForm, type FormStep } from "@/components/shared/step-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { useFormFailure } from "@/hooks/use-form-failure";
import { apiRequest, toApiError, type ApiError } from "@/lib/api-client";
import type {
  AdminAppointment,
  AppointmentPreview,
} from "@/shared/api/appointments";
import { STAFF_DATE_LIMITS } from "@/shared/constants/appointment-date-limits";
import type { PaymentMethod } from "@/shared/constants/payment-methods";
import {
  formatCalendarDate,
  formatTime,
  toCompanyInstant,
} from "@/shared/format/date";

// UC11 and UC26 FA01 (docs/agendamento/agendamentos-do-painel.md, Novo
// agendamento e Editar): the staff books for a client in five steps, or edits
// an appointment of any status in four, with the client fixed (RN003). One
// form for all the steps (RNF002), with the summary of the order below. The
// values come from the preview of the API, never from a sum of the screen.
// With the demo data the form has no validation schema yet (decision 0055):
// "Próximo" only checks that the choice of the step was made.

const APPOINTMENTS_PATH = "/api/admin/appointments";
const PREVIEW_PATH = "/api/admin/appointments/preview";
const VEHICLES_PATH = "/api/admin/appointments/lookup/vehicles";
const SERVICES_PATH = "/api/admin/appointments/lookup/services";

const EMPTY_VALUES: AppointmentFormValues = {
  client: null,
  vehicle: null,
  serviceIds: [],
  additionalIds: [],
  date: null,
  time: null,
  paymentMethod: null,
};

// The payment stays in the last step, beside the total it changes
// (docs/agendamento/agendar-servico.md, Etapas). The client does not change
// in the edition, so it has no step there.
const STEPS: FormStep<AppointmentFormValues>[] = [
  { title: "Cliente", fields: ["client"] },
  { title: "Veículo", fields: ["vehicle"] },
  { title: "Serviços", fields: ["serviceIds"] },
  { title: "Data e horário", fields: ["date", "time"] },
  { title: "Pagamento e resumo", fields: ["paymentMethod"] },
];
const EDIT_STEPS = STEPS.slice(1);

// The body of POST /api/admin/appointments/preview; the fields not chosen yet
// are left out.
type PreviewBody = {
  vehicleId: string;
  serviceIds: string[];
  paymentMethod?: PaymentMethod;
  scheduledAt?: string;
  appointmentId?: string;
};

type AppointmentWizardProps = {
  // The appointment being edited; without it, a new one.
  appointment?: AdminAppointment;
  onCancel: () => void;
  // The appointment was created or saved.
  onDone: () => void;
  // RNF011: the appointment was read again after a conflict.
  onReloaded?: () => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

// The edition starts from the record: the client is its own (the e-mail is
// not read there), and the date, the time and the payment are the chosen ones.
function initialValues(
  appointment: AdminAppointment | null,
): AppointmentFormValues {
  if (!appointment) return EMPTY_VALUES;
  return {
    client: {
      id: appointment.clientId,
      name: appointment.clientName,
      email: "",
    },
    vehicle: appointment.vehicle,
    serviceIds: appointment.services
      .filter((item) => item.type !== "additional")
      .map((item) => item.id),
    additionalIds: appointment.services
      .filter((item) => item.type === "additional")
      .map((item) => item.id),
    date: formatCalendarDate(appointment.scheduledAt),
    time: formatTime(appointment.scheduledAt),
    paymentMethod: appointment.paymentMethod,
  };
}

export function AppointmentWizard({
  appointment,
  onCancel,
  onDone,
  onReloaded,
  onSubmittingChange,
}: AppointmentWizardProps) {
  const isEditing = appointment !== undefined;
  const [record, setRecord] = useState(appointment ?? null);
  const [needsReload, setNeedsReload] = useState(false);
  const [reloadError, setReloadError] = useState<ApiError | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  // The choice of a step checks it again, so its message leaves as soon as
  // it is made (RNF003).
  const form = useForm<AppointmentFormValues>({
    defaultValues: initialValues(record),
    mode: "onChange",
  });
  const { failure, showFailure, clearFailure } = useFormFailure(form.setError);
  const [client, vehicle, serviceIds, additionalIds, date, time, payment] =
    useWatch({
      control: form.control,
      name: [
        "client",
        "vehicle",
        "serviceIds",
        "additionalIds",
        "date",
        "time",
        "paymentMethod",
      ],
    });
  const scheduledAt = date && time ? toCompanyInstant(date, time) : null;
  // No call without the vehicle and a service.
  const previewBody: PreviewBody | null =
    vehicle && serviceIds.length > 0
      ? {
          vehicleId: vehicle.id,
          serviceIds: [...serviceIds, ...additionalIds],
          paymentMethod: payment ?? undefined,
          scheduledAt: scheduledAt ?? undefined,
          appointmentId: isEditing ? record?.id : undefined,
        }
      : null;
  const preview = useApiQuery<AppointmentPreview>(
    previewBody ? PREVIEW_PATH : null,
    previewBody ?? undefined,
  );
  // Only the send waits: a disabled field would take the focus away from the
  // choice that asked for the new preview (RNF005).
  const isAwaitingPreview =
    !preview.data || preview.isLoading || preview.error !== null;

  // RNF011: keep the conflict notice, but replace every value and the version.
  // A failed reload leaves the old version unusable until a successful retry.
  async function reloadAppointment() {
    if (!record) return;
    setIsReloading(true);
    setReloadError(null);
    onSubmittingChange(true);
    try {
      const updated = await apiRequest<AdminAppointment>(
        `${APPOINTMENTS_PATH}/${record.id}`,
      );
      form.reset(initialValues(updated));
      setRecord(updated);
      onReloaded?.();
      setNeedsReload(false);
    } catch (error) {
      setReloadError(toApiError(error));
    } finally {
      setIsReloading(false);
      onSubmittingChange(false);
    }
  }

  async function submit(values: AppointmentFormValues) {
    if (isAwaitingPreview || needsReload) return;
    clearFailure();
    if (!values.client || !values.vehicle || !values.date || !values.time) {
      return;
    }
    // Preserve the original ISO instant exactly when its calendar fields are
    // unchanged (RN033); updatedAt is also opaque text, never reformatted.
    const keptInstant =
      record &&
      values.date === formatCalendarDate(record.scheduledAt) &&
      values.time === formatTime(record.scheduledAt)
        ? record.scheduledAt
        : toCompanyInstant(values.date, values.time);
    const changes = {
      vehicleId: values.vehicle.id,
      serviceIds: [...values.serviceIds, ...values.additionalIds],
      paymentMethod: values.paymentMethod,
      scheduledAt: keptInstant,
    };
    onSubmittingChange(true);
    try {
      await apiRequest<AdminAppointment>(
        record ? `${APPOINTMENTS_PATH}/${record.id}` : APPOINTMENTS_PATH,
        record
          ? {
              method: "PATCH",
              body: { ...changes, updatedAt: record.updatedAt },
            }
          : {
              method: "POST",
              body: { clientId: values.client.id, ...changes },
            },
      );
      onDone();
    } catch (error) {
      showFailure(error);
      if (record && toApiError(error).code === "VERSION_CONFLICT") {
        setNeedsReload(true);
        await reloadAppointment();
      }
    } finally {
      onSubmittingChange(false);
    }
  }

  // One step on the screen at a time; the values of the others stay in the
  // form.
  const stepContents = [
    <BookingClientStep key="client" />,
    <BookingVehicleStep
      key="vehicle"
      path={VEHICLES_PATH}
      filters={{ clientId: client?.id }}
      legend={`Qual veículo de ${client?.name ?? "o cliente"} será atendido?`}
      emptyDescription="Cadastre o veículo nos detalhes do cliente, em Clientes, e volte para agendar."
      // UC11 FE02: the register is in the clients, not in this form.
      renderAction={({ isInEmptyState }) =>
        isInEmptyState && (
          <Link
            href="/admin/clients"
            className={buttonVariants({ variant: "secondary" })}
          >
            Ir para Clientes
          </Link>
        )
      }
    />,
    <BookingServicesStep
      key="services"
      path={SERVICES_PATH}
      legend="Quais serviços serão feitos?"
    />,
    <BookingScheduleStep
      key="schedule"
      // UC26 FA01, RN033: the staff may also bring the date forward, and the
      // limit follows the status.
      originalScheduledAt={record?.scheduledAt}
      limit={record ? STAFF_DATE_LIMITS[record.status] : undefined}
    />,
    <BookingPaymentStep key="payment" preview={preview} />,
  ];
  // The edition has no step of the client.
  const stepOffset = isEditing ? STEPS.length - EDIT_STEPS.length : 0;

  return (
    <FormProvider {...form}>
      <div className="grid min-w-0 gap-8">
        <section className="flex min-w-0 flex-col gap-5 rounded-xl bg-background p-5 shadow-neu-md md:p-8">
          {/* The heading between the title of the dialog and the h3 of each
              step. */}
          <h2 className="sr-only">Etapas do agendamento</h2>
          {failure && (
            <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
          )}
          {reloadError && (
            <Alert variant="destructive">
              <AlertDescription className="flex flex-col items-start gap-3">
                {reloadError.message}
                <Button
                  variant="secondary"
                  disabled={isReloading}
                  onClick={() => void reloadAppointment()}
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <fieldset
            disabled={needsReload}
            aria-busy={isReloading}
            className="min-w-0"
          >
            <StepForm
              key={record?.updatedAt ?? "new"}
              form={form}
              steps={isEditing ? EDIT_STEPS : STEPS}
              onSubmit={submit}
              submitLabel={
                isEditing ? "Salvar alterações" : "Confirmar agendamento"
              }
              loadingLabel={isEditing ? "Salvando…" : "Agendando…"}
              isSubmitDisabled={isAwaitingPreview}
              onCancel={onCancel}
            >
              {(stepIndex) => stepContents[stepIndex + stepOffset]}
            </StepForm>
          </fieldset>
        </section>
        <BookingSummary
          clientName={client?.name}
          vehicle={vehicle}
          hasServices={serviceIds.length > 0}
          preview={preview}
          isInDialog
        />
      </div>
    </FormProvider>
  );
}
