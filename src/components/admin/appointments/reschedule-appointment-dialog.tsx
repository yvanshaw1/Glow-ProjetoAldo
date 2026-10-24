"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { BookingPaymentStep } from "@/components/shared/booking-payment-step";
import { BookingScheduleStep } from "@/components/shared/booking-schedule-step";
import { BookingSummary } from "@/components/shared/booking-summary";
import type { BookingFormValues } from "@/components/shared/booking-form-values";
import { FormAlert } from "@/components/shared/form-alert";
import { StepForm, type FormStep } from "@/components/shared/step-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApiQuery } from "@/hooks/use-api-query";
import { useFormFailure } from "@/hooks/use-form-failure";
import { apiRequest } from "@/lib/api-client";
import type {
  AdminAppointment,
  AppointmentPreview,
} from "@/shared/api/appointments";
import type { PaymentMethod } from "@/shared/constants/payment-methods";
import { toCompanyInstant } from "@/shared/format/date";

// UC25 FA01 (docs/agendamento/agendamentos-do-painel.md): the staff reschedules
// a Concluído from the history, as the client does: a new date and time and a
// payment method, for the same vehicle and services, with the values of the
// preview by the current catalog (RN020). With the demo data the form has no
// validation schema yet (decision 0055): "Próximo" only checks the choice.

const APPOINTMENTS_PATH = "/api/admin/appointments";
const PREVIEW_PATH = "/api/admin/appointments/preview";

// docs/agendamento/agendar-servico.md, Edição e reagendamento: the vehicle and
// the services are the original ones, so only these two steps.
const STEPS: FormStep<BookingFormValues>[] = [
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

type RescheduleAppointmentDialogProps = {
  appointment: AdminAppointment;
  canOpen: boolean;
  onRescheduled: () => void;
};

// A nested dialog, so "Cancelar" and Esc return to the detail; it does not
// close while the request runs.
export function RescheduleAppointmentDialog({
  appointment,
  canOpen,
  onRescheduled,
}: RescheduleAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  function changeOpen(open: boolean) {
    if (isSubmitting || (open && !canOpen)) return;
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button hidden={!canOpen} />}>
        Reagendar
      </DialogTrigger>
      <DialogContent
        ref={popupRef}
        className="sm:w-[calc(100%-3rem)] sm:max-w-3xl"
        showCloseButton={!isSubmitting}
        // The first step has "Cancelar", where the focus starts (RNF005).
        initialFocus={() =>
          Array.from(popupRef.current?.querySelectorAll("button") ?? []).find(
            (button) => button.textContent === "Cancelar" && !button.disabled,
          ) ?? popupRef.current
        }
      >
        <DialogHeader>
          <DialogTitle>Reagendar serviço</DialogTitle>
        </DialogHeader>
        <RescheduleForm
          appointment={appointment}
          onCancel={() => changeOpen(false)}
          onRescheduled={onRescheduled}
          onSubmittingChange={setIsSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

type RescheduleFormProps = {
  appointment: AdminAppointment;
  onCancel: () => void;
  onRescheduled: () => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

function RescheduleForm({
  appointment,
  onCancel,
  onRescheduled,
  onSubmittingChange,
}: RescheduleFormProps) {
  const { id, vehicle, services } = appointment;
  const form = useForm<BookingFormValues>({
    defaultValues: {
      vehicle,
      serviceIds: [],
      additionalIds: [],
      date: null,
      time: null,
      paymentMethod: null,
    },
    mode: "onChange",
  });
  const { failure, showFailure, clearFailure } = useFormFailure(form.setError);
  const [date, time, paymentMethod] = useWatch({
    control: form.control,
    name: ["date", "time", "paymentMethod"],
  });
  const scheduledAt = date && time ? toCompanyInstant(date, time) : null;
  const cancelRef = useRef<HTMLButtonElement>(null);
  // The services of the original, the main, complementary and additional ones
  // (RN020); the preview leaves out what can no longer be booked (RN008).
  const previewBody: PreviewBody = {
    vehicleId: vehicle.id,
    serviceIds: services.map((service) => service.id),
    paymentMethod: paymentMethod ?? undefined,
    scheduledAt: scheduledAt ?? undefined,
  };
  const preview = useApiQuery<AppointmentPreview>(PREVIEW_PATH, previewBody);

  const isPreviewReady =
    !preview.isLoading && !preview.error && preview.data !== null;
  const hasAvailableServices =
    preview.data?.services.some((item) => item.type !== "additional") ?? false;
  // RN005, UC25 FE02: known only from the preview, so the rescheduling is not
  // confirmed before it answers. Only the send waits: a disabled field would
  // take the focus away from the choice that asked for the new preview.
  const isUnavailable = isPreviewReady && !hasAvailableServices;
  const isAwaitingPreview = !isPreviewReady;

  // The step form leaves the screen with the focus in it when no service is
  // available, so the focus goes to the "Cancelar" that stays.
  useEffect(() => {
    if (isUnavailable) cancelRef.current?.focus();
  }, [isUnavailable]);

  async function submit(values: BookingFormValues) {
    if (isAwaitingPreview || isUnavailable) return;
    clearFailure();
    if (!values.date || !values.time) return;
    onSubmittingChange(true);
    try {
      await apiRequest<AdminAppointment>(
        `${APPOINTMENTS_PATH}/${id}/reschedule`,
        {
          method: "POST",
          body: {
            paymentMethod: values.paymentMethod,
            scheduledAt: toCompanyInstant(values.date, values.time),
          },
        },
      );
      onRescheduled();
    } catch (error) {
      showFailure(error);
    } finally {
      onSubmittingChange(false);
    }
  }

  return (
    <FormProvider {...form}>
      <div className="grid min-w-0 gap-8">
        <section className="flex min-w-0 flex-col gap-5 rounded-xl bg-background p-5 shadow-neu-md md:p-8">
          {/* The heading between the title of the dialog and the h3 of each
              step. */}
          <h2 className="sr-only">Etapas do reagendamento</h2>
          {failure && (
            <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
          )}
          {isUnavailable ? (
            <>
              <Alert>
                <AlertDescription>
                  Nenhum serviço principal ou complementar deste agendamento
                  está disponível. Para escolher outros serviços, faça um novo
                  agendamento.
                </AlertDescription>
              </Alert>
              <Button ref={cancelRef} variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
            </>
          ) : (
            <StepForm
              form={form}
              steps={STEPS}
              onSubmit={submit}
              submitLabel="Confirmar reagendamento"
              loadingLabel="Reagendando…"
              isSubmitDisabled={isAwaitingPreview}
              onCancel={onCancel}
            >
              {(stepIndex) =>
                stepIndex === 0 ? (
                  <BookingScheduleStep />
                ) : (
                  <BookingPaymentStep preview={preview} />
                )
              }
            </StepForm>
          )}
        </section>
        <BookingSummary
          vehicle={vehicle}
          hasServices
          preview={preview}
          originalServices={services}
          isInDialog
        />
      </div>
    </FormProvider>
  );
}
