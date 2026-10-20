"use client";

import { useId, type ReactNode } from "react";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

// The props of the input of one field: its value has the type of that field.
export type FieldInputProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
> = ControllerRenderProps<T, N> & {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

type FormFieldProps<
  T extends FieldValues,
  N extends FieldPath<T>,
  R extends FieldValues,
> = {
  control: Control<T, unknown, R>;
  name: N;
  label: string;
  description?: string;
  renderInput: (props: FieldInputProps<T, N>) => ReactNode;
};

// One form field: the label, the input, the description and
// the message of the field, tied to the input (RNF003, RNF005).
export function FormField<
  T extends FieldValues,
  N extends FieldPath<T>,
  R extends FieldValues = T,
>({ control, name, label, description, renderInput }: FormFieldProps<T, N, R>) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const describedBy = [
          description && descriptionId,
          fieldState.error && errorId,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {renderInput({
              ...field,
              id,
              "aria-invalid": fieldState.invalid,
              "aria-describedby": describedBy || undefined,
            })}
            {description && (
              <FieldDescription id={descriptionId}>
                {description}
              </FieldDescription>
            )}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
