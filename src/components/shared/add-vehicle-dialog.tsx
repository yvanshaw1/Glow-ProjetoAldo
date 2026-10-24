"use client";

import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import {
  PlateField,
  VehicleDetailFields,
  VehicleTypeField,
  type VehicleFormValues,
} from "@/components/shared/vehicle-fields";
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
import { apiRequest, withQuery } from "@/lib/api-client";
import type { ClientVehicle, VehicleLookup } from "@/shared/api/vehicles";
import { VEHICLE_TYPE_LABELS } from "@/shared/constants/vehicle-types";

// UC05 (docs/clientes/area-do-cliente.md) and UC18 (docs/clientes/
// clientes-do-painel.md): the register starts with the
// plate, and "Continuar" looks it up (RN036). A registered plate shows its
// vehicle without editing, and the submit sends only the plate (FA01); a new
// plate asks for the type and the data. A single form, so going back to the
// plate keeps what was typed. The client area, the booking and the panel use
// this dialog, each with its own routes.

const EMPTY_VALUES: VehicleFormValues = {
  plate: "",
  type: null,
  brand: "",
  model: "",
  color: "",
  year: "",
};

type Step =
  | { name: "plate" }
  | { name: "registered"; vehicle: VehicleLookup }
  | { name: "new" };

const PLATE_STEP: Step = { name: "plate" };

const SUBMIT_LABELS = {
  plate: { label: "Continuar", loadingLabel: "Consultando…" },
  registered: { label: "Adicionar à minha conta", loadingLabel: "Salvando…" },
  new: { label: "Cadastrar veículo", loadingLabel: "Salvando…" },
} as const satisfies Record<
  Step["name"],
  { label: string; loadingLabel: string }
>;

type AddVehicleDialogProps = {
  // The route of the register and the one of the plate lookup.
  createPath: string;
  lookupPath: string;
  // The button of a registered plate: whose account it goes to.
  linkLabel: string;
  onAdded: () => void;
  // The place of the button that opens the dialog.
  className?: string;
};

export function AddVehicleDialog({
  createPath,
  lookupPath,
  linkLabel,
  onAdded,
  className,
}: AddVehicleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(PLATE_STEP);
  const { control, handleSubmit, setError, setFocus, reset, formState } =
    useForm<VehicleFormValues>({ defaultValues: EMPTY_VALUES });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);

  // docs/padroes/componentes.md, Diálogos: the dialog does not close during
  // the call. Each opening starts a new register, at the plate.
  function changeOpen(open: boolean) {
    if (formState.isSubmitting) return;
    if (open) {
      reset(EMPTY_VALUES);
      clearFailure();
      setStep(PLATE_STEP);
    }
    setIsOpen(open);
  }

  async function submit(values: VehicleFormValues) {
    clearFailure();
    try {
      if (step.name === "plate") await lookUpPlate(values.plate);
      else await addVehicle(values);
    } catch (error) {
      showFailure(error);
    }
  }

  // The button that had the focus gives place to the next step: the
  // registered vehicle takes the focus to its notice when it appears, and a
  // new plate takes it to the type.
  async function lookUpPlate(plate: string) {
    const vehicle = await apiRequest<VehicleLookup | null>(
      withQuery(lookupPath, { plate }),
    );
    if (vehicle) {
      setStep({ name: "registered", vehicle });
      return;
    }
    flushSync(() => setStep({ name: "new" }));
    setFocus("type");
  }

  async function addVehicle({
    plate,
    type,
    brand,
    model,
    color,
    year,
  }: VehicleFormValues) {
    // FA01: the registered vehicle is linked by its plate alone.
    const body =
      step.name === "registered"
        ? { plate }
        : { plate, type, brand, model, color, year };
    await apiRequest<ClientVehicle>(createPath, { method: "POST", body });
    setIsOpen(false);
    onAdded();
  }

  function goBackToPlate() {
    clearFailure();
    setStep(PLATE_STEP);
    setFocus("plate");
  }

  const { label, loadingLabel } =
    step.name === "registered"
      ? { ...SUBMIT_LABELS.registered, label: linkLabel }
      : SUBMIT_LABELS[step.name];
  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button className={className} />}>
        <PlusIcon aria-hidden />
        Cadastrar veículo
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar veículo</DialogTitle>
        </DialogHeader>
        {failure && (
          <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
        )}
        <form
          noValidate
          onSubmit={handleSubmit(submit)}
          className="flex flex-col gap-5"
        >
          <PlateField control={control} isReadOnly={step.name !== "plate"} />
          {step.name === "registered" && (
            <RegisteredVehicle vehicle={step.vehicle} />
          )}
          {step.name === "new" && (
            <>
              <VehicleTypeField control={control} />
              <VehicleDetailFields control={control} />
            </>
          )}
          <DialogFooter>
            {step.name === "plate" ? (
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
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={formState.isSubmitting}
                onClick={goBackToPlate}
                className="sm:mr-auto"
              >
                <ChevronLeftIcon aria-hidden />
                Voltar
              </Button>
            )}
            <SubmitButton
              isLoading={formState.isSubmitting}
              loadingLabel={loadingLabel}
            >
              {label}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// UC05 FA01: the data of the registered vehicle, filled in and without
// editing. The notice takes the focus when it appears, as the form notices
// do (RNF005).
function RegisteredVehicle({ vehicle }: { vehicle: VehicleLookup }) {
  const noticeRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    noticeRef.current?.focus();
  }, []);
  const details = [
    ["Tipo", VEHICLE_TYPE_LABELS[vehicle.type]],
    ["Marca", vehicle.brand],
    ["Modelo", vehicle.model],
    ["Cor", vehicle.color],
    ["Ano", String(vehicle.year)],
  ];
  return (
    <div className="flex flex-col gap-3">
      <p ref={noticeRef} tabIndex={-1} className="outline-none">
        Esta placa já está cadastrada. Confira os dados do veículo.
      </p>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
        {details.map(([term, value]) => (
          <div key={term}>
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
