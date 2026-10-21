"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  PlateField,
  VehicleDetailFields,
  VehicleTypeField,
  type VehicleFormValues,
} from "@/components/portal/vehicles/vehicle-fields";
import { FormAlert } from "@/components/shared/form-alert";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFormFailure } from "@/hooks/use-form-failure";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { ClientVehicle } from "@/shared/api/vehicles";
import { formatPlate } from "@/shared/format/plate";

// UC05 FA02 (docs/clientes/area-do-cliente.md): the edit of a vehicle of the
// account. The card offers it only when no other account has the vehicle
// (FE03, RN036).

const VEHICLES_PATH = "/api/me/vehicles";

function toFormValues({
  plate,
  type,
  brand,
  model,
  color,
  year,
}: ClientVehicle): VehicleFormValues {
  return {
    plate: formatPlate(plate),
    type,
    brand,
    model,
    color,
    year: String(year),
  };
}

type EditVehicleDialogProps = {
  vehicle: ClientVehicle;
  onSaved: () => void;
  onConflict: () => void;
};

export function EditVehicleDialog({
  vehicle,
  onSaved,
  onConflict,
}: EditVehicleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { control, handleSubmit, setError, reset, formState } =
    useForm<VehicleFormValues>({ defaultValues: toFormValues(vehicle) });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);

  // RNF011: after a version conflict the list is read again, and the
  // current data of the vehicle replaces what was typed.
  useEffect(() => {
    reset(toFormValues(vehicle));
  }, [vehicle, reset]);

  // docs/padroes/componentes.md, Diálogos: the dialog does not close during
  // the call. Each opening starts from the data of the vehicle.
  function changeOpen(open: boolean) {
    if (formState.isSubmitting) return;
    if (open) {
      reset(toFormValues(vehicle));
      clearFailure();
    }
    setIsOpen(open);
  }

  async function submit({
    type,
    plate,
    brand,
    model,
    color,
    year,
  }: VehicleFormValues) {
    clearFailure();
    try {
      await apiRequest<ClientVehicle>(`${VEHICLES_PATH}/${vehicle.id}`, {
        method: "PATCH",
        body: {
          type,
          plate,
          brand,
          model,
          color,
          year,
          updatedAt: vehicle.updatedAt,
        },
      });
      setIsOpen(false);
      onSaved();
    } catch (error) {
      showFailure(error);
      if (error instanceof ApiError && error.code === "VERSION_CONFLICT") {
        onConflict();
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger
        render={
          <Button
            variant="secondary"
            className="w-full sm:w-auto sm:self-start"
          />
        }
      >
        Editar
        {/* Each card has one: the name tells them apart. */}
        <span className="sr-only">
          {" "}
          {vehicle.brand} {vehicle.model}
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar veículo</DialogTitle>
        </DialogHeader>
        {failure && (
          <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
        )}
        <form
          noValidate
          onSubmit={handleSubmit(submit)}
          className="flex flex-col gap-5"
        >
          <VehicleTypeField control={control} />
          <PlateField control={control} />
          <VehicleDetailFields control={control} />
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  disabled={formState.isSubmitting}
                />
              }
            >
              Cancelar
            </DialogClose>
            <SubmitButton
              isLoading={formState.isSubmitting}
              loadingLabel="Salvando…"
            >
              Salvar alterações
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
