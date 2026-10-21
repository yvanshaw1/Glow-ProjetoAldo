"use client";

import { useId } from "react";
import { Controller, type Control } from "react-hook-form";
import { FormField } from "@/components/shared/form-field";
import {
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  VEHICLE_TYPE_LABELS,
  VEHICLE_TYPES,
  type VehicleType,
} from "@/shared/constants/vehicle-types";
import { formatPlate } from "@/shared/format/plate";

// The fields of the vehicle forms (docs/clientes/area-do-cliente.md), shared
// by the register and the edit dialogs. With the demo data, the forms have no
// validation schema yet (decision 0055), so the values go as typed.

export type VehicleFormValues = {
  // With the mask, as typed (RN035).
  plate: string;
  // None checked in a new register.
  type: VehicleType | null;
  brand: string;
  model: string;
  color: string;
  year: string;
};

type VehicleFieldsProps = {
  control: Control<VehicleFormValues>;
};

const YEAR_LENGTH = 4;

export function PlateField({
  control,
  isReadOnly = false,
}: VehicleFieldsProps & { isReadOnly?: boolean }) {
  return (
    <FormField
      control={control}
      name="plate"
      label="Placa"
      description="Como ABC1D23 ou ABC-1234."
      renderInput={(field) => (
        <Input
          {...field}
          readOnly={isReadOnly}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          onChange={(event) => field.onChange(formatPlate(event.target.value))}
          className={cn(isReadOnly && "text-muted-foreground")}
        />
      )}
    />
  );
}

// RN002: the client picks the type; the size comes from it. Native radio
// buttons, so the arrow keys change the option, with the look of the tabs of
// docs/padroes/design.md and the 3:1 border of a field.
export function VehicleTypeField({ control }: VehicleFieldsProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  return (
    <Controller
      control={control}
      name="type"
      render={({ field, fieldState }) => (
        <FieldSet
          aria-describedby={[descriptionId, fieldState.error && errorId]
            .filter(Boolean)
            .join(" ")}
          data-invalid={fieldState.invalid}
          className="gap-2 data-[invalid=true]:text-destructive"
        >
          <FieldLegend variant="label" className="mb-2">
            Tipo
          </FieldLegend>
          <div
            className={cn(
              "grid grid-cols-4 gap-1 rounded-xl border border-input bg-background p-1 inset-shadow-neu-sm",
              fieldState.invalid && "border-destructive",
            )}
          >
            {VEHICLE_TYPES.map((type, index) => {
              const inputId = `${id}-${type}`;
              return (
                <div key={type} className="relative">
                  <input
                    // The first option takes the focus of the field, as on
                    // an error of the submit.
                    ref={index === 0 ? field.ref : undefined}
                    id={inputId}
                    type="radio"
                    name={id}
                    value={type}
                    checked={field.value === type}
                    onChange={() => field.onChange(type)}
                    onBlur={field.onBlur}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={inputId}
                    className="flex h-10 cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors select-none peer-not-checked:hover:text-foreground peer-checked:bg-background peer-checked:text-link peer-checked:shadow-neu-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring"
                  >
                    {VEHICLE_TYPE_LABELS[type]}
                  </label>
                </div>
              );
            })}
          </div>
          <FieldDescription id={descriptionId}>
            O porte é definido pelo tipo.
          </FieldDescription>
          <FieldError id={errorId} errors={[fieldState.error]} />
        </FieldSet>
      )}
    />
  );
}

// The brand, the model, the color and the year, two by line as in the
// wireframe.
export function VehicleDetailFields({ control }: VehicleFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <FormField
        control={control}
        name="brand"
        label="Marca"
        renderInput={(field) => <Input {...field} autoComplete="off" />}
      />
      <FormField
        control={control}
        name="model"
        label="Modelo"
        renderInput={(field) => <Input {...field} autoComplete="off" />}
      />
      <FormField
        control={control}
        name="color"
        label="Cor"
        renderInput={(field) => <Input {...field} autoComplete="off" />}
      />
      <FormField
        control={control}
        name="year"
        label="Ano"
        renderInput={(field) => (
          <Input
            {...field}
            inputMode="numeric"
            maxLength={YEAR_LENGTH}
            autoComplete="off"
          />
        )}
      />
    </div>
  );
}
