"use client";

import { useId, type ReactNode } from "react";
import type { BookingVehicle } from "@/components/shared/booking-form-values";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiQuery } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import type {
  AppointmentPreview,
  AppointmentService,
} from "@/shared/api/appointments";
import { formatCurrency } from "@/shared/format/currency";
import { formatDateTime } from "@/shared/format/date";
import { formatDuration } from "@/shared/format/duration";
import { formatPercent } from "@/shared/format/percent";
import { formatPlate } from "@/shared/format/plate";

// RF021, RF024 and RF026 (docs/agendamento/agendar-servico.md): the order as
// chosen so far, with the values of the preview by the current catalog
// (README of this folder: the screen does not add them up). Beside the
// steps from 1024 px, below them on a phone.

// Lines held while the first preview loads.
const LOADING_LINES = 4;

type BookingSummaryProps = {
  vehicle: BookingVehicle | null;
  hasServices: boolean;
  preview: ApiQuery<AppointmentPreview>;
  originalServices?: AppointmentService[];
  isInDialog?: boolean;
};

export function BookingSummary({
  vehicle,
  hasServices,
  preview,
  originalServices,
  isInDialog = false,
}: BookingSummaryProps) {
  const titleId = useId();
  // UC25 FE02: only the answer to the current choices identifies removals.
  const unavailable =
    originalServices && preview.data && !preview.isLoading && !preview.error
      ? originalServices.filter(
          (service) =>
            !preview.data?.services.some((item) => item.id === service.id),
        )
      : [];
  return (
    <aside
      aria-labelledby={titleId}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl bg-background p-5 shadow-neu-md",
        !isInDialog && "lg:sticky lg:top-24",
      )}
    >
      <h2 id={titleId} className="font-semibold">
        Resumo do pedido
      </h2>
      {vehicle && (
        <p className="text-sm">
          <span className="block font-semibold">
            {vehicle.brand} {vehicle.model}
          </span>
          <span className="block text-muted-foreground">
            Placa {formatPlate(vehicle.plate)} · {vehicle.color}
          </span>
        </p>
      )}
      {hasServices ? (
        <PreviewContent preview={preview} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum serviço escolhido.
        </p>
      )}
      {unavailable.length > 0 && (
        <Alert>
          <AlertDescription>
            Não estão mais disponíveis e ficaram de fora:{" "}
            {unavailable.map((service) => service.name).join(", ")}.
          </AlertDescription>
        </Alert>
      )}
    </aside>
  );
}

// RNF004: the place of the values while the first preview loads; a new one
// keeps the previous values in the loading state; a failure offers to try
// again.
function PreviewContent({
  preview,
}: {
  preview: ApiQuery<AppointmentPreview>;
}) {
  if (preview.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {preview.error.message}
          <Button variant="secondary" onClick={preview.reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!preview.data) {
    return (
      <div aria-busy className="flex flex-col gap-3">
        {Array.from({ length: LOADING_LINES }, (_, index) => (
          <Skeleton key={index} className="h-5 w-full" />
        ))}
      </div>
    );
  }
  const {
    services,
    subtotal,
    feePercent,
    total,
    estimatedDurationMinutes,
    estimatedEndAt,
  } = preview.data;
  return (
    <div
      aria-busy={preview.isLoading}
      className={cn(
        "flex flex-col gap-4 text-sm transition-opacity",
        preview.isLoading && "opacity-70",
      )}
    >
      <ul className="flex flex-col gap-2">
        {services.map((service) => (
          <li key={service.id} className="flex justify-between gap-3">
            <span>{service.name}</span>
            <span className="shrink-0">{formatCurrency(service.price)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <SummaryLine term="Subtotal">{formatCurrency(subtotal)}</SummaryLine>
        {/* RN012: the sign tells a surcharge from a discount. */}
        {feePercent !== null && feePercent !== 0 && (
          <SummaryLine
            term={`${feePercent > 0 ? "Acréscimo" : "Desconto"} de ${formatPercent(Math.abs(feePercent))}`}
          />
        )}
        <SummaryLine term="Total" className="text-base font-semibold">
          {formatCurrency(total)}
        </SummaryLine>
        <SummaryLine term="Duração estimada">
          {formatDuration(estimatedDurationMinutes)}
        </SummaryLine>
        {estimatedEndAt && (
          <SummaryLine term="Previsão de conclusão">
            {formatDateTime(estimatedEndAt)}
          </SummaryLine>
        )}
      </div>
    </div>
  );
}

type SummaryLineProps = {
  term: string;
  className?: string;
  children?: ReactNode;
};

function SummaryLine({ term, className, children }: SummaryLineProps) {
  return (
    <p className={cn("flex justify-between gap-3", className)}>
      <span>{term}</span>
      {children && <span className="shrink-0 text-right">{children}</span>}
    </p>
  );
}
