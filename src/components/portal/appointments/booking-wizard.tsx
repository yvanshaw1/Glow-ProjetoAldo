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
import { buttonVariants } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { useFormFailure } from "@/hooks/use-form-failure";
import { apiRequest } from "@/lib/api-client";
import type {
  AppointmentPreview,
  AppointmentVehicle,
  ClientAppointment,
} from "@/shared/api/appointments";
import type { PaymentMethod } from "@/shared/constants/payment-methods";
import { formatDateTime, toCompanyInstant } from "@/shared/format/date";

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

// L2 of the plan: the date before the payment, which stays beside the total
// it changes.
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
};

export function BookingWizard() {
  // The choice of a step checks it again, so its message leaves as soon as
  // it is made (RNF003).
  const form = useForm<BookingFormValues>({
    defaultValues: EMPTY_VALUES,
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
        }
      : null;
  const preview = useApiQuery<AppointmentPreview>(
    previewBody ? PREVIEW_PATH : null,
    previewBody ?? undefined,
  );

  async function submit(values: BookingFormValues) {
    clearFailure();
    if (!values.vehicle || !values.date || !values.time) return;
    try {
      const appointment = await apiRequest<ClientAppointment>(
        APPOINTMENTS_PATH,
        {
          method: "POST",
          body: {
            vehicleId: values.vehicle.id,
            serviceIds: [...values.serviceIds, ...values.additionalIds],
            paymentMethod: values.paymentMethod,
            scheduledAt: toCompanyInstant(values.date, values.time),
          },
        },
      );
      setConfirmedAppointment(appointment);
    } catch (error) {
      showFailure(error);
    }
  }

  // One step on the screen at a time; the values of the others stay in the
  // form.
  const stepContents: ReactNode[] = [
    <BookingVehicleStep key="vehicle" canAddVehicle />,
    <BookingServicesStep key="services" />,
    <BookingScheduleStep key="schedule" />,
    <BookingPaymentStep key="payment" preview={preview} />,
  ];

  if (confirmedAppointment) {
    return <BookingConfirmation appointment={confirmedAppointment} />;
  }
  return (
    <FormProvider {...form}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="flex min-w-0 flex-col gap-5 rounded-xl bg-background p-5 shadow-neu-md md:p-8">
          {/* The heading between the page title and the h3 of each step. */}
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
          >
            {(stepIndex) => stepContents[stepIndex]}
          </StepForm>
        </section>
        <BookingSummary
          vehicle={vehicle}
          hasServices={serviceIds.length > 0}
          preview={preview}
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
