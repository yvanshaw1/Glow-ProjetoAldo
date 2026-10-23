"use client";

import { CheckIcon } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type {
  FieldPath,
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FormStep<T extends FieldValues> = {
  title: string;
  fields: FieldPath<T>[];
};

type StepFormProps<T extends FieldValues, R extends FieldValues> = {
  // One form for every step: the values of a step that leaves the screen
  // stay in React Hook Form, so going back loses nothing (RNF002).
  form: UseFormReturn<T, unknown, R>;
  steps: FormStep<T>[];
  // Catches the API errors and shows them with useFormFailure.
  onSubmit: SubmitHandler<R>;
  submitLabel: string;
  loadingLabel: string;
  // The last button waits for a reading of the API that follows the choices,
  // while the fields stay enabled and keep the focus (RNF005).
  isSubmitDisabled?: boolean;
  onCancel?: () => void;
  children: (stepIndex: number) => ReactNode;
};

// docs/padroes/componentes.md, Formulário em etapas: "Próximo" checks only
// the fields of the step, "Voltar" checks nothing, and the last button sends
// everything. An error of the API in a field of another step leads to it.
export function StepForm<T extends FieldValues, R extends FieldValues>({
  form,
  steps,
  onSubmit,
  submitLabel,
  loadingLabel,
  isSubmitDisabled = false,
  onCancel,
  children,
}: StepFormProps<T, R>) {
  const [stepIndex, setStepIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMovedRef = useRef(false);
  const isLastStep = stepIndex === steps.length - 1;
  const isSubmitting = form.formState.isSubmitting;

  // RNF005: after a step change, the focus goes to the title of the new
  // step, so a screen reader user hears where they are.
  useEffect(() => {
    if (hasMovedRef.current) headingRef.current?.focus();
  }, [stepIndex]);

  function goToStep(index: number) {
    hasMovedRef.current = true;
    setStepIndex(index);
  }

  async function goNext() {
    const isValid = await form.trigger(steps[stepIndex].fields, {
      shouldFocus: true,
    });
    if (isValid) goToStep(stepIndex + 1);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    // Enter in a field before the last step works as "Próximo".
    if (!isLastStep) {
      event.preventDefault();
      await goNext();
      return;
    }
    await form.handleSubmit(onSubmit)(event);
    const invalidStep = steps.findIndex((step) =>
      step.fields.some((field) => form.getFieldState(field).invalid),
    );
    if (invalidStep !== -1 && invalidStep !== stepIndex) goToStep(invalidStep);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void submit(event)}
      className="@container flex flex-col gap-6"
    >
      <StepIndicator steps={steps} stepIndex={stepIndex} />
      <h3 ref={headingRef} tabIndex={-1} className="sr-only">
        Etapa {stepIndex + 1} de {steps.length}: {steps[stepIndex].title}
      </h3>
      {children(stepIndex)}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {stepIndex > 0 && (
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => goToStep(stepIndex - 1)}
          >
            Voltar
          </Button>
        )}
        {stepIndex === 0 && onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        {isLastStep ? (
          <SubmitButton
            isLoading={isSubmitting}
            loadingLabel={loadingLabel}
            isDisabled={isSubmitDisabled}
            className="sm:ml-auto"
          >
            {submitLabel}
          </SubmitButton>
        ) : (
          <Button
            type="button"
            className="sm:ml-auto"
            onClick={() => void goNext()}
          >
            Próximo
          </Button>
        )}
      </div>
    </form>
  );
}

type StepIndicatorProps<T extends FieldValues> = {
  steps: FormStep<T>[];
  stepIndex: number;
};

// RNF002: the number of each step, the current one with aria-current and its
// title. The other titles show when the form is 448 px wide or more, and
// shrink with an ellipsis instead of overflowing. The current step takes the
// width of its title, which also shrinks with an ellipsis when the form is
// narrow; the others keep their number and the line to the next one.
function StepIndicator<T extends FieldValues>({
  steps,
  stepIndex,
}: StepIndicatorProps<T>) {
  return (
    <ol aria-label="Etapas" className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCurrent = index === stepIndex;
        const isDone = index < stepIndex;
        return (
          <li
            key={step.title}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "flex min-w-0 items-center gap-2",
              isCurrent && "flex-auto",
              !isCurrent && index < steps.length - 1 && "min-w-13 flex-1",
              !isCurrent && index === steps.length - 1 && "min-w-7",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                isCurrent && "bg-primary text-primary-foreground",
                isDone && "text-link shadow-neu-sm",
                !isCurrent &&
                  !isDone &&
                  "text-muted-foreground inset-shadow-neu-sm",
              )}
            >
              {isDone ? <CheckIcon className="size-4" /> : index + 1}
            </span>
            {isCurrent ? (
              <span className="min-w-0 truncate text-sm font-semibold">
                {step.title}
              </span>
            ) : (
              <>
                <span className="sr-only">
                  {step.title}
                  {isDone && " (concluída)"}
                </span>
                <span
                  aria-hidden
                  className="hidden min-w-0 truncate text-sm text-muted-foreground @md:block"
                >
                  {step.title}
                </span>
              </>
            )}
            {index < steps.length - 1 && (
              <span aria-hidden className="h-px min-w-4 flex-1 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
