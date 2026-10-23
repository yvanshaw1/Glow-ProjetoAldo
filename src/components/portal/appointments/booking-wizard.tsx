"use client";

import { CircleCheckIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { BookingPaymentStep } from "@/components/portal/appointments/booking-payment-step";
import { BookingScheduleStep } from "@/components/portal/appointments/booking-schedule-step";
import { BookingServicesStep } from "@/components/portal/appointments/booking-services-step";
import { BookingSummary } from "@/components/portal/appointments/booking-summary";
import { BookingVehicleStep } from "@/components/portal/appointments/booking-vehicle-step";
import { FormAlert } from "@/components/shared/form-alert";
import { StepForm, type FormStep } from "@/components/shared/step-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { useFormFailure } from "@/hooks/use-form-failure";
import { apiRequest, toApiError, type ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type {
  AppointmentPreview,
  AppointmentVehicle,
  ClientAppointment,
} from "@/shared/api/appointments";
import type { PaymentMethod } from "@/shared/constants/payment-methods";
import {
  formatCalendarDate,
  formatDateTime,
  formatTime,
  toCompanyInstant,
} from "@/shared/format/date";

// UC06 (docs/agendamento/agendar-servico.md): the booking in four steps, one
// form for all of them (RNF002), with the summary of the order beside it. The
// values come from the preview of the API, never from a sum of the screen.
// With the demo data the form has no validation schema yet (decision 0055):
// "Próximo" only checks that the choice of the step was made.

const APPOINTMENTS_PATH = "/api/me/appointments";
const PREVIEW_PATH = "/api/me/appointments/preview";

// The vehicle as the steps and the summary show it.
export type BookingVehicle = Pick<
  AppointmentVehicle,
  "id" | "plate" | "brand" | "model" | "color"
>;

export type BookingFormValues = {
  vehicle: BookingVehicle | null;
  // RN005: the main and complementary services.
  serviceIds: string[];
  // RN006: the additionals of the checked main services.
  additionalIds: string[];
  // The day (aaaa-mm-dd) and the start time (HH:MM) in the company's time
  // zone; the API takes them as one instant.
  date: string | null;
  time: string | null;
  paymentMethod: PaymentMethod | null;
};

const EMPTY_VALUES: BookingFormValues = {
  vehicle: null,
  serviceIds: [],
  additionalIds: [],
  date: null,
  time: null,
  paymentMethod: null,
};

// docs/agendamento/agendar-servico.md, Etapas: the date before the payment,
// which stays beside the total it changes.
const STEPS: FormStep<BookingFormValues>[] = [
  { title: "Veículo", fields: ["vehicle"] },
  { title: "Serviços", fields: ["serviceIds"] },
  { title: "Data e horário", fields: ["date", "time"] },
  { title: "Pagamento e resumo", fields: ["paymentMethod"] },
];

// The body of POST /api/me/appointments/preview; the fields not chosen yet
// are left out.
type PreviewBody = {
  vehicleId: string;
  serviceIds: string[];
  paymentMethod?: PaymentMethod;
  scheduledAt?: string;
  appointmentId?: string;
};

export type BookingChangeMode = "edit" | "reschedule";

type BookingWizardProps =
  | {
      mode?: "new";
    }
  | {
      mode: BookingChangeMode;
      appointment: ClientAppointment;
      onCancel: () => void;
      onChanged: () => void;
      onReloaded: (appointment: ClientAppointment) => void;
      onSubmittingChange: (isSubmitting: boolean) => void;
    };

const MODES = {
  new: {
    steps: STEPS,
    submitLabel: "Confirmar agendamento",
    loadingLabel: "Agendando…",
    method: "POST",
  },
  edit: {
    steps: STEPS,
    submitLabel: "Salvar alterações",
    loadingLabel: "Salvando…",
    method: "PATCH",
  },
  reschedule: {
    steps: STEPS.slice(2),
    submitLabel: "Confirmar reagendamento",
    loadingLabel: "Reagendando…",
    method: "POST",
  },
} as const;

function initialValues(
  appointment: ClientAppointment | null,
  isEditing: boolean,
): BookingFormValues {
  if (!appointment) return EMPTY_VALUES;
  return {
    vehicle: appointment.vehicle,
    serviceIds: appointment.services
      .filter((item) => item.type !== "additional")
      .map((item) => item.id),
    additionalIds: appointment.services
      .filter((item) => item.type === "additional")
      .map((item) => item.id),
    date: isEditing ? formatCalendarDate(appointment.scheduledAt) : null,
    time: isEditing ? formatTime(appointment.scheduledAt) : null,
    paymentMethod: isEditing ? appointment.paymentMethod : null,
  };
}

export function BookingWizard(props: BookingWizardProps = {}) {
  const mode = props.mode ?? "new";
  const configuration = MODES[mode];
  const change = "appointment" in props ? props : null;
  const [record, setRecord] = useState(change?.appointment ?? null);
  const [needsReload, setNeedsReload] = useState(false);
  const [reloadError, setReloadError] = useState<ApiError | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  // The choice of a step checks it again, so its message leaves as soon as
  // it is made (RNF003).
  const form = useForm<BookingFormValues>({
    defaultValues: initialValues(record, mode === "edit"),
    mode: "onChange",
  });
  const { failure, showFailure, clearFailure } = useFormFailure(form.setError);
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<ClientAppointment | null>(null);
  const [vehicle, serviceIds, additionalIds, date, time, paymentMethod] =
    useWatch({
      control: form.control,
      name: [
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
          paymentMethod: paymentMethod ?? undefined,
          scheduledAt: scheduledAt ?? undefined,
          appointmentId: mode === "edit" ? record?.id : undefined,
        }
      : null;
  const preview = useApiQuery<AppointmentPreview>(
    previewBody ? PREVIEW_PATH : null,
    previewBody ?? undefined,
  );

  const isPreviewReady =
    !preview.isLoading && !preview.error && preview.data !== null;
  const hasAvailableServices =
    preview.data?.services.some((item) => item.type !== "additional") ?? false;
  const isUnavailable =
    mode === "reschedule" && isPreviewReady && !hasAvailableServices;
  const isInvalidStatus = mode === "edit" && record?.status !== "scheduled";
  // UC25 FE02 and RN005 are known only from the preview, so the rescheduling
  // is not confirmed before it answers. Only the send waits: a disabled field
  // would take the focus away from the choice that asked for the new preview
  // (RNF005).
  const isAwaitingPreview = mode === "reschedule" && !isPreviewReady;
  const cancelRef = useRef<HTMLButtonElement>(null);

  // The step form leaves the screen with the focus in it when no service is
  // available, so the focus goes to the "Cancelar" that stays.
  useEffect(() => {
    if (isUnavailable) cancelRef.current?.focus();
  }, [isUnavailable]);

  // RNF011: keep the conflict notice, but replace every value and the version.
  // A failed reload leaves the old version unusable until a successful retry.
  async function reloadAppointment() {
    if (!record || !change) return;
    setIsReloading(true);
    setReloadError(null);
    change.onSubmittingChange(true);
    try {
      const updated = await apiRequest<ClientAppointment>(
        `${APPOINTMENTS_PATH}/${record.id}`,
      );
      form.reset(initialValues(updated, true));
      setRecord(updated);
      change.onReloaded(updated);
      setNeedsReload(false);
    } catch (error) {
      setReloadError(toApiError(error));
    } finally {
      setIsReloading(false);
      change.onSubmittingChange(false);
    }
  }

  async function submit(values: BookingFormValues) {
    if (needsReload || isAwaitingPreview || isUnavailable || isInvalidStatus) {
      return;
    }
    clearFailure();
    if (!values.vehicle || !values.date || !values.time) return;
    const chosenInstant = toCompanyInstant(values.date, values.time);
    // Preserve the original ISO instant exactly when its calendar fields are
    // unchanged (RN033); updatedAt is also opaque text, never reformatted.
    const keptInstant =
      mode === "edit" &&
      record &&
      values.date === formatCalendarDate(record.scheduledAt) &&
      values.time === formatTime(record.scheduledAt)
        ? record.scheduledAt
        : chosenInstant;
    const paths = {
      new: APPOINTMENTS_PATH,
      edit: `${APPOINTMENTS_PATH}/${record?.id}`,
      reschedule: `${APPOINTMENTS_PATH}/${record?.id}/reschedule`,
    };
    const paymentAndSchedule = {
      paymentMethod: values.paymentMethod,
      scheduledAt: keptInstant,
    };
    change?.onSubmittingChange(true);
    try {
      const appointment = await apiRequest<ClientAppointment>(paths[mode], {
        method: configuration.method,
        body:
          mode === "reschedule"
            ? paymentAndSchedule
            : {
                vehicleId: values.vehicle.id,
                serviceIds: [...values.serviceIds, ...values.additionalIds],
                ...paymentAndSchedule,
                ...(mode === "edit" ? { updatedAt: record?.updatedAt } : {}),
              },
      });
      if (change) change.onChanged();
      else setConfirmedAppointment(appointment);
    } catch (error) {
      showFailure(error);
      if (mode === "edit" && toApiError(error).code === "VERSION_CONFLICT") {
        setNeedsReload(true);
        await reloadAppointment();
      }
    } finally {
      change?.onSubmittingChange(false);
    }
  }

  // One step on the screen at a time; the values of the others stay in the
  // form.
  const stepContents: ReactNode[] = [
    <BookingVehicleStep key="vehicle" canAddVehicle={mode === "new"} />,
    <BookingServicesStep key="services" />,
    <BookingScheduleStep
      key="schedule"
      originalScheduledAt={mode === "edit" ? record?.scheduledAt : null}
    />,
    <BookingPaymentStep key="payment" preview={preview} />,
  ];

  if (confirmedAppointment) {
    return <BookingConfirmation appointment={confirmedAppointment} />;
  }
  return (
    <FormProvider {...form}>
      <div
        className={cn(
          "grid min-w-0 gap-8",
          !change && "lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start",
        )}
      >
        <section className="flex min-w-0 flex-col gap-5 rounded-xl bg-background p-5 shadow-neu-md md:p-8">
          {/* The heading between the page title and the h3 of each step. */}
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
          {isInvalidStatus && (
            <Alert>
              <AlertDescription>
                Este agendamento não pode mais ser alterado por aqui. Para mudar
                algo, fale com a empresa.
              </AlertDescription>
            </Alert>
          )}
          {isUnavailable && (
            <Alert>
              <AlertDescription className="flex flex-col items-start gap-3">
                Nenhum serviço principal ou complementar deste agendamento está
                disponível. Para escolher outros serviços, faça um novo
                agendamento.
                <Link
                  href="/booking"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Agendar outro serviço
                </Link>
              </AlertDescription>
            </Alert>
          )}
          {!isUnavailable && !isInvalidStatus && (
            <fieldset
              disabled={needsReload}
              aria-busy={isReloading}
              className="min-w-0"
            >
              <StepForm
                key={record?.updatedAt ?? "new"}
                form={form}
                steps={configuration.steps}
                onSubmit={submit}
                submitLabel={configuration.submitLabel}
                loadingLabel={configuration.loadingLabel}
                isSubmitDisabled={isAwaitingPreview}
                onCancel={change?.onCancel}
              >
                {(stepIndex) =>
                  stepContents[stepIndex + (mode === "reschedule" ? 2 : 0)]
                }
              </StepForm>
            </fieldset>
          )}
          {change && (needsReload || isUnavailable || isInvalidStatus) && (
            <Button
              ref={cancelRef}
              variant="ghost"
              disabled={isReloading}
              onClick={change.onCancel}
            >
              Cancelar
            </Button>
          )}
        </section>
        <BookingSummary
          vehicle={vehicle}
          hasServices={serviceIds.length > 0}
          preview={preview}
          originalServices={
            mode === "reschedule" ? record?.services : undefined
          }
          isInDialog={change !== null}
        />
      </div>
    </FormProvider>
  );
}

// UC06 step 13: the appointment registered, with the focus on its title.
function BookingConfirmation({
  appointment,
}: {
  appointment: ClientAppointment;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  return (
    <section className="flex flex-col items-start gap-5 rounded-xl bg-background p-5 shadow-neu-md md:p-8">
      <CircleCheckIcon aria-hidden className="size-[42px] text-link" />
      <h2 ref={titleRef} tabIndex={-1} className="font-semibold outline-none">
        Agendamento confirmado
      </h2>
      <p>
        O seu agendamento para {formatDateTime(appointment.scheduledAt)} foi
        registrado e já aparece em Meus agendamentos.
      </p>
      <Link href="/appointments" className={buttonVariants()}>
        Ver meus agendamentos
      </Link>
    </section>
  );
}
