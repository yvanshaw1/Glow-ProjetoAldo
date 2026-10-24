"use client";

import { useId, type Ref } from "react";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// A choice of one among a few options, as native radio buttons, so the arrow
// keys change the choice, each with its name and a sentence (the type of a
// service and its pricing, docs/catalogo/servicos-do-painel.md).

export type Choice<T extends string> = {
  value: T;
  label: string;
  description: string;
};

type ChoiceGroupProps<T extends string> = {
  legend: string;
  choices: readonly Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  onBlur?: () => void;
  // The first option takes the focus of the field, as on an error.
  firstChoiceRef?: Ref<HTMLInputElement>;
  error?: string;
};

export function ChoiceGroup<T extends string>({
  legend,
  choices,
  value,
  onChange,
  onBlur,
  firstChoiceRef,
  error,
}: ChoiceGroupProps<T>) {
  const groupName = useId();
  const errorId = `${groupName}-error`;
  return (
    <FieldSet aria-describedby={error ? errorId : undefined} className="gap-2">
      <FieldLegend variant="label">{legend}</FieldLegend>
      <div className="flex flex-col gap-3 @md:flex-row">
        {choices.map((choice, index) => {
          const inputId = `${groupName}-${choice.value}`;
          const descriptionId = `${inputId}-description`;
          const isChecked = value === choice.value;
          return (
            <div
              key={choice.value}
              className={cn(
                "relative flex-1 rounded-xl bg-background p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ring",
                isChecked ? "inset-shadow-neu-sm" : "shadow-neu-sm",
              )}
            >
              <input
                ref={index === 0 ? firstChoiceRef : undefined}
                id={inputId}
                type="radio"
                name={groupName}
                value={choice.value}
                checked={isChecked}
                onChange={() => onChange(choice.value)}
                onBlur={onBlur}
                aria-describedby={descriptionId}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={cn(
                  "block cursor-pointer font-semibold after:absolute after:inset-0 after:rounded-xl",
                  isChecked && "text-link",
                )}
              >
                {choice.label}
              </label>
              <p
                id={descriptionId}
                className="mt-1 text-sm text-muted-foreground"
              >
                {choice.description}
              </p>
            </div>
          );
        })}
      </div>
      {error && (
        <FieldDescription id={errorId} className="text-destructive">
          {error}
        </FieldDescription>
      )}
    </FieldSet>
  );
}
