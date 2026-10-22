"use client";

import { useId, type ReactNode } from "react";
import { useController, useWatch } from "react-hook-form";
import type { BookingFormValues } from "@/components/portal/appointments/booking-wizard";
import {
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiQuery } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import type { AppointmentPreview } from "@/shared/api/appointments";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
} from "@/shared/constants/payment-methods";
import { formatCurrency } from "@/shared/format/currency";
import { formatDateTime, toCompanyInstant } from "@/shared/format/date";
import { formatPlate } from "@/shared/format/plate";

// UC06 steps 7, 8, 11 and 12 (docs/agendamento/agendar-servico.md): the
// vehicle and the date chosen, the payment method (RF023, RN011) and the
// total of the preview (RF024, RF026), right above the buttons, so a phone
// user does not confirm without seeing it.

const REQUIRED_MESSAGE = "Escolha a forma de pagamento.";

type BookingPaymentStepProps = {
  preview: ApiQuery<AppointmentPreview>;
};

export function BookingPaymentStep({ preview }: BookingPaymentStepProps) {
  const [vehicle, date, time] = useWatch<
    BookingFormValues,
    ["vehicle", "date", "time"]
  >({ name: ["vehicle", "date", "time"] });
  const { field, fieldState } = useController<
    BookingFormValues,
    "paymentMethod"
  >({
    name: "paymentMethod",
    rules: { validate: (method) => method !== null || REQUIRED_MESSAGE },
  });
  const groupName = useId();
  const descriptionId = `${groupName}-description`;
  const errorId = `${groupName}-error`;
  const estimatedEndAt = preview.data?.estimatedEndAt ?? null;

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid gap-4 @md:grid-cols-2">
        {vehicle && (
          <SummaryItem term="Veículo" className="@md:col-span-2">
            {vehicle.brand} {vehicle.model} · Placa {formatPlate(vehicle.plate)}
          </SummaryItem>
        )}
        {date && time && (
          <SummaryItem term="Data e horário">
            {formatDateTime(toCompanyInstant(date, time))}
          </SummaryItem>
        )}
        {estimatedEndAt && (
          <SummaryItem term="Previsão de conclusão">
            {formatDateTime(estimatedEndAt)}
          </SummaryItem>
        )}
      </dl>
      <FieldSet
        aria-describedby={[descriptionId, fieldState.error && errorId]
          .filter(Boolean)
          .join(" ")}
        className="gap-2"
      >
        <FieldLegend variant="label" className="mb-2">
          Forma de pagamento
        </FieldLegend>
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-input bg-background p-1 inset-shadow-neu-sm @md:grid-cols-4">
          {PAYMENT_METHODS.map((method, index) => {
            const inputId = `${groupName}-${method}`;
            return (
              <div key={method} className="relative">
                <input
                  // The first option takes the focus of the field, as on an
                  // error.
                  ref={index === 0 ? field.ref : undefined}
                  id={inputId}
                  type="radio"
                  name={groupName}
                  value={method}
                  checked={field.value === method}
                  onChange={() => field.onChange(method)}
                  onBlur={field.onBlur}
                  className="peer sr-only"
                />
                <label
                  htmlFor={inputId}
                  className="flex h-10 cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors select-none peer-not-checked:hover:text-foreground peer-checked:bg-background peer-checked:text-link peer-checked:shadow-neu-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring"
                >
                  {PAYMENT_METHOD_LABELS[method]}
                </label>
              </div>
            );
          })}
        </div>
        <FieldDescription id={descriptionId}>
          O pagamento é feito na empresa, no dia do atendimento.
        </FieldDescription>
        <FieldError id={errorId} errors={[fieldState.error]} />
      </FieldSet>
      <PreviewTotal preview={preview} />
    </div>
  );
}

// RN010: the total of the preview, by the payment method chosen; while a new
// preview loads, the previous one stays in the loading state.
function PreviewTotal({ preview }: BookingPaymentStepProps) {
  if (!preview.data) {
    return preview.error ? null : <Skeleton aria-busy className="h-7 w-full" />;
  }
  return (
    <p
      aria-busy={preview.isLoading}
      className={cn(
        "flex justify-between gap-3 border-t border-border pt-4 font-semibold transition-opacity",
        preview.isLoading && "opacity-70",
      )}
    >
      <span>Total</span>
      <span>{formatCurrency(preview.data.total)}</span>
    </p>
  );
}

type SummaryItemProps = {
  term: string;
  className?: string;
  children: ReactNode;
};

function SummaryItem({ term, className, children }: SummaryItemProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}
