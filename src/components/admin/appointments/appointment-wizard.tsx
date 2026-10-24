"use client";

import Link from "next/link";
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
import { buttonVariants } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { useFormFailure } from "@/hooks/use-form-failure";
import { apiRequest } from "@/lib/api-client";
import type {
  AdminAppointment,
  AppointmentPreview,
} from "@/shared/api/appointments";
import type { PaymentMethod } from "@/shared/constants/payment-methods";
import { toCompanyInstant } from "@/shared/format/date";

// UC11 (docs/agendamento/agendamentos-do-painel.md, Novo agendamento): the
// staff books for a client in five steps, one form for all of them (RNF002),
// with the summary of the order below. The values come from the preview of
// the API, never from a sum of the screen. With the demo data the form has no
// validation schema yet (decision 0055): "Próximo" only checks that the
// choice of the step was made.

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
// (docs/agendamento/agendar-servico.md, Etapas).
const STEPS: FormStep<AppointmentFormValues>[] = [
  { title: "Cliente", fields: ["client"] },
  { title: "Veículo", fields: ["vehicle"] },
  { title: "Serviços", fields: ["serviceIds"] },
  { title: "Data e horário", fields: ["date", "time"] },
  { title: "Pagamento e resumo", fields: ["paymentMethod"] },
];

// The body of POST /api/admin/appointments/preview; the fields not chosen yet
// are left out.
type PreviewBody = {
  vehicleId: string;
  serviceIds: string[];
  paymentMethod?: PaymentMethod;
  scheduledAt?: string;
};

type AppointmentWizardProps = {
  onCancel: () => void;
  onCreated: () => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

export function AppointmentWizard({
  onCancel,
  onCreated,
  onSubmittingChange,
}: AppointmentWizardProps) {
  // The choice of a step checks it again, so its message leaves as soon as
  // it is made (RNF003).
  const form = useForm<AppointmentFormValues>({
    defaultValues: EMPTY_VALUES,
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

  async function submit(values: AppointmentFormValues) {
    if (isAwaitingPreview) return;
    clearFailure();
    if (!values.client || !values.vehicle || !values.date || !values.time) {
      return;
    }
    onSubmittingChange(true);
    try {
      await apiRequest<AdminAppointment>(APPOINTMENTS_PATH, {
        method: "POST",
        body: {
          clientId: values.client.id,
          vehicleId: values.vehicle.id,
          serviceIds: [...values.serviceIds, ...values.additionalIds],
          paymentMethod: values.paymentMethod,
          scheduledAt: toCompanyInstant(values.date, values.time),
        },
      });
      onCreated();
    } catch (error) {
      showFailure(error);
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
    <BookingScheduleStep key="schedule" />,
    <BookingPaymentStep key="payment" preview={preview} />,
  ];

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
          <StepForm
            form={form}
            steps={STEPS}
            onSubmit={submit}
            submitLabel="Confirmar agendamento"
            loadingLabel="Agendando…"
            isSubmitDisabled={isAwaitingPreview}
            onCancel={onCancel}
          >
            {(stepIndex) => stepContents[stepIndex]}
          </StepForm>
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
