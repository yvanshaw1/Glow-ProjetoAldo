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

export type FieldInputProps<T extends FieldValues> = ControllerRenderProps<
  T,
  FieldPath<T>
> & {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  renderInput: (props: FieldInputProps<T>) => ReactNode;
};

// One form field: the label, the input, the description and
// the message of the field, tied to the input (RNF003, RNF005).
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  renderInput,
}: FormFieldProps<T>) {
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
