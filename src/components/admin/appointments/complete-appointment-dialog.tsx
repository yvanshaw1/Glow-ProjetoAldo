"use client";

import { CheckIcon } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { FormAlert } from "@/components/shared/form-alert";
import { SubmitButton } from "@/components/shared/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiRequest, toApiError, type ApiError } from "@/lib/api-client";
import type {
  AdminAppointment,
  PaymentOption,
} from "@/shared/api/appointments";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/shared/constants/payment-methods";
import { ERROR_CATALOG } from "@/shared/errors/catalog";
import { formatCurrency } from "@/shared/format/currency";
import { formatPercent } from "@/shared/format/percent";
import { formatPlate } from "@/shared/format/plate";

// UC12 FA01 (docs/agendamento/agendamentos-do-painel.md): the summary of the
// service done and the payment method used, with the total of each one as the
// route worked it out (RF053, RN010, RN012); the screen never sums them.

const APPOINTMENTS_PATH = "/api/admin/appointments";

// Rows held while the appointment loads.
const LOADING_ROWS = 4;

type CompleteAppointmentDialogProps = {
  id: string;
  canOpen: boolean;
  onCompleted: () => void;
  // The route said the appointment is no longer Finalizado (UC12 FE01).
  onStale: () => void;
};

// A nested dialog, so "Cancelar" returns to the detail. It stays mounted when
// a conflict reload hides its trigger: the notice must still be read.
export function CompleteAppointmentDialog({
  id,
  canOpen,
  onCompleted,
  onStale,
}: CompleteAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function changeOpen(open: boolean) {
    if (isSubmitting || (open && !canOpen)) return;
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button hidden={!canOpen} />}>
        Concluir
      </DialogTrigger>
      <DialogContent showCloseButton={!isSubmitting} initialFocus={cancelRef}>
        <DialogHeader>
          <DialogTitle>Concluir agendamento</DialogTitle>
          <DialogDescription>
            Confira o resumo do atendimento e a forma de pagamento usada pelo
            cliente. Receba o pagamento na empresa antes de confirmar.
          </DialogDescription>
        </DialogHeader>
        <CompletionForm
          id={id}
          cancelRef={cancelRef}
          onCancel={() => changeOpen(false)}
          onCompleted={onCompleted}
          onStale={onStale}
          onSubmittingChange={setIsSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

type CompletionFormProps = Pick<
  CompleteAppointmentDialogProps,
  "id" | "onCompleted" | "onStale"
> & {
  cancelRef: RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

// A new key on every failure, so the notice takes the focus each time.
type Failure = { key: number; error: ApiError };

// Mounted with the dialog, so each opening reads the appointment again.
function CompletionForm({
  id,
  cancelRef,
  onCancel,
  onCompleted,
  onStale,
  onSubmittingChange,
}: CompletionFormProps) {
  const { data, error, reload } = useApiQuery<AdminAppointment>(
    `${APPOINTMENTS_PATH}/${id}`,
  );
  const [chosenMethod, setChosenMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const options = data?.paymentOptions ?? null;
  // It starts on the method chosen in the appointment (UC12 FA01 step 3).
  const method = chosenMethod ?? data?.paymentMethod ?? null;
  const selected =
    options?.find(({ paymentMethod }) => paymentMethod === method) ?? null;
  const isFinalized = data?.status === "awaiting_payment" && options !== null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || isSubmitting) return;
    setIsSubmitting(true);
    onSubmittingChange(true);
    setFailure(null);
    try {
      await apiRequest(`${APPOINTMENTS_PATH}/${id}/complete`, {
        method: "POST",
        body: { paymentMethod: selected.paymentMethod },
      });
      onCompleted();
    } catch (caught) {
      const apiError = toApiError(caught);
      setFailure((current) => ({
        key: (current?.key ?? 0) + 1,
        error: apiError,
      }));
      if (apiError.code === "INVALID_STATUS") {
        reload();
        onStale();
      }
    } finally {
      setIsSubmitting(false);
      onSubmittingChange(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="contents">
      {failure && (
        <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
      )}
      <CompletionContent
        data={data}
        error={error}
        reload={reload}
        isFinalized={isFinalized}
        options={options}
        method={method}
        selected={selected}
        onChoose={setChosenMethod}
      />
      <DialogFooter>
        <Button
          ref={cancelRef}
          type="button"
          variant="ghost"
          disabled={isSubmitting}
          focusableWhenDisabled
          onClick={onCancel}
        >
          Cancelar
        </Button>
        {isFinalized && (
          <SubmitButton isLoading={isSubmitting} loadingLabel="Concluindo…">
            Confirmar conclusão
          </SubmitButton>
        )}
      </DialogFooter>
    </form>
  );
}

type CompletionContentProps = {
  data: AdminAppointment | null;
  error: ApiError | null;
  reload: () => void;
  isFinalized: boolean;
  options: PaymentOption[] | null;
  method: PaymentMethod | null;
  selected: PaymentOption | null;
  onChoose: (method: PaymentMethod) => void;
};

// RNF004: the place of the summary while loading; a failure offers a retry.
function CompletionContent({
  data,
  error,
  reload,
  isFinalized,
  options,
  method,
  selected,
  onChoose,
}: CompletionContentProps) {
  const groupName = useId();
  if (!data) {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-3">
            {error.message}
            <Button type="button" variant="secondary" onClick={reload}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <div aria-busy className="flex flex-col gap-4">
        {Array.from({ length: LOADING_ROWS }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  // UC12 FE01: the appointment is not Finalizado any more.
  if (!isFinalized || !options || !selected) {
    return (
      <Alert>
        <AlertDescription>
          {ERROR_CATALOG.INVALID_STATUS.message}
        </AlertDescription>
      </Alert>
    );
  }
  const { vehicle, services, subtotal, clientName } = data;
  return (
    <div className="flex flex-col gap-5">
      <dl className="grid gap-4">
        <SummaryItem term="Cliente">{clientName}</SummaryItem>
        <SummaryItem term="Veículo">
          {vehicle.brand} {vehicle.model} · Placa {formatPlate(vehicle.plate)}
        </SummaryItem>
        <SummaryItem term="Serviços">
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
        </SummaryItem>
      </dl>
      <FieldSet className="gap-2">
        <FieldLegend variant="label" className="mb-2">
          Forma de pagamento
        </FieldLegend>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => {
            const inputId = `${groupName}-${option.paymentMethod}`;
            return (
              <div key={option.paymentMethod} className="relative">
                <input
                  id={inputId}
                  type="radio"
                  name={groupName}
                  value={option.paymentMethod}
                  checked={method === option.paymentMethod}
                  onChange={() => onChoose(option.paymentMethod)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={inputId}
                  className="relative flex min-h-16 cursor-pointer flex-col justify-center gap-0.5 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-neu-sm transition-colors select-none peer-checked:border-link peer-checked:shadow-none peer-checked:inset-shadow-neu-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring"
                >
                  {/* The choice is also told by the mark, not by the color. */}
                  {method === option.paymentMethod && (
                    <CheckIcon
                      aria-hidden
                      className="absolute top-2 right-2 size-4 text-link"
                    />
                  )}
                  <span className="font-semibold text-link">
                    {PAYMENT_METHOD_LABELS[option.paymentMethod]}
                  </span>
                  <span>{formatCurrency(option.total)}</span>
                  <FeeText feePercent={option.feePercent} />
                </label>
              </div>
            );
          })}
        </div>
      </FieldSet>
      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <p className="flex justify-between gap-3">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </p>
        <FeeText feePercent={selected.feePercent} />
        <p className="flex justify-between gap-3 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(selected.total)}</span>
        </p>
      </div>
    </div>
  );
}

// RN012: the sign tells a surcharge from a discount; none, nothing to say.
function FeeText({ feePercent }: { feePercent: number }) {
  if (feePercent === 0) return null;
  return (
    <span className="text-xs text-muted-foreground">
      {feePercent > 0 ? "Acréscimo" : "Desconto"} de{" "}
      {formatPercent(Math.abs(feePercent))}
    </span>
  );
}

function SummaryItem({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}
