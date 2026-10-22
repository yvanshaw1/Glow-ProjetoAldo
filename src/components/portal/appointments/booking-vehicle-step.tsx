"use client";

import { CarFrontIcon } from "lucide-react";
import { useId, type FormEvent, type ReactNode, type Ref } from "react";
import { useController } from "react-hook-form";
import type {
  BookingFormValues,
  BookingVehicle,
} from "@/components/portal/appointments/booking-wizard";
import { AddVehicleDialog } from "@/components/portal/vehicles/add-vehicle-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPagination } from "@/components/shared/list-pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePaginatedList,
  type ListFilters,
  type PaginatedList,
} from "@/hooks/use-paginated-list";
import { cn } from "@/lib/utils";
import type { ClientVehicle } from "@/shared/api/vehicles";
import { SHORT_LIST_PAGE_SIZE } from "@/shared/constants/pagination";
import { VEHICLE_SIZE_LABELS } from "@/shared/constants/vehicle-sizes";
import { VEHICLE_TYPE_LABELS } from "@/shared/constants/vehicle-types";
import { formatPlate } from "@/shared/format/plate";

// UC06 steps 2 and 3 (docs/agendamento/agendar-servico.md): the vehicles of
// the account by page, as native radio buttons, so the arrow keys change the
// choice (RF019, RN003, RN004). Without vehicles, the register of the client
// area (UC05, FE01).

const VEHICLES_PATH = "/api/me/vehicles";
const NO_FILTERS: ListFilters = {};
const REQUIRED_MESSAGE = "Escolha o veículo.";

// Options held while the first page loads.
const LOADING_PLACES = 2;

type BookingVehicleStepProps = {
  // Only the page offers the register: in a dialog it would open a third one.
  canAddVehicle: boolean;
};

export function BookingVehicleStep({ canAddVehicle }: BookingVehicleStepProps) {
  const list = usePaginatedList<ClientVehicle, ListFilters>({
    path: VEHICLES_PATH,
    pageSize: SHORT_LIST_PAGE_SIZE,
    initialFilters: NO_FILTERS,
  });
  const { field, fieldState } = useController<BookingFormValues, "vehicle">({
    name: "vehicle",
    rules: { validate: (vehicle) => vehicle !== null || REQUIRED_MESSAGE },
  });
  const groupName = useId();
  const errorId = `${groupName}-error`;
  const isEmpty = list.hasLoaded && list.total === 0;
  const addVehicle = canAddVehicle && (
    <AddVehicle onAdded={list.reload} isInEmptyState={isEmpty} />
  );

  return (
    <FieldSet
      aria-describedby={fieldState.error ? errorId : undefined}
      className="gap-5"
    >
      <FieldLegend>Qual veículo será atendido?</FieldLegend>
      {!isEmpty && addVehicle}
      <VehicleOptions
        list={list}
        groupName={groupName}
        chosenId={field.value?.id ?? null}
        onChoose={(vehicle) => field.onChange(toBookingVehicle(vehicle))}
        onBlur={field.onBlur}
        firstOptionRef={field.ref}
        emptyAction={addVehicle}
      />
      {list.pageCount > 1 && (
        <ListPagination
          page={list.page}
          pageCount={list.pageCount}
          firstItem={list.firstItem}
          lastItem={list.lastItem}
          total={list.total}
          onPageChange={list.setPage}
        />
      )}
      <FieldError id={errorId} errors={[fieldState.error]} />
    </FieldSet>
  );
}

function toBookingVehicle({
  id,
  plate,
  brand,
  model,
  color,
}: ClientVehicle): BookingVehicle {
  return { id, plate, brand, model, color };
}

type AddVehicleProps = {
  onAdded: () => void;
  isInEmptyState: boolean;
};

// The dialog has its own form, rendered in a portal: React still bubbles its
// submit up to the form of the steps, so it stops here.
function AddVehicle({ onAdded, isInEmptyState }: AddVehicleProps) {
  return (
    <div
      onSubmit={(event: FormEvent) => event.stopPropagation()}
      className={cn(!isInEmptyState && "flex sm:justify-start")}
    >
      <AddVehicleDialog
        onAdded={onAdded}
        className={cn(!isInEmptyState && "w-full sm:w-auto")}
      />
    </div>
  );
}

type VehicleOptionsProps = {
  list: PaginatedList<ClientVehicle>;
  groupName: string;
  chosenId: string | null;
  onChoose: (vehicle: ClientVehicle) => void;
  onBlur: () => void;
  firstOptionRef: Ref<HTMLInputElement>;
  emptyAction: ReactNode;
};

// RNF004: the first load holds the place of the options; a new load keeps
// them, in the loading state; a failure offers to try again.
function VehicleOptions({
  list,
  groupName,
  chosenId,
  onChoose,
  onBlur,
  firstOptionRef,
  emptyAction,
}: VehicleOptionsProps) {
  if (list.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {list.error.message}
          <Button variant="secondary" onClick={list.reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!list.hasLoaded) {
    return (
      <div aria-busy className="flex flex-col gap-3">
        {Array.from({ length: LOADING_PLACES }, (_, index) => (
          <Skeleton key={index} className="h-[5.5rem] w-full rounded-xl" />
        ))}
      </div>
    );
  }
  if (list.total === 0 && !list.isLoading) {
    return (
      <div role="status">
        <EmptyState
          icon={CarFrontIcon}
          title="Nenhum veículo cadastrado"
          description="Para agendar um serviço, cadastre um veículo na sua conta."
          action={emptyAction || undefined}
        />
      </div>
    );
  }
  return (
    <ul
      aria-busy={list.isLoading}
      className={cn(
        "flex flex-col gap-3 transition-opacity",
        list.isLoading && "pointer-events-none opacity-70",
      )}
    >
      {list.items.map((vehicle, index) => (
        <VehicleOption
          key={vehicle.id}
          vehicle={vehicle}
          groupName={groupName}
          isChecked={vehicle.id === chosenId}
          onChoose={() => onChoose(vehicle)}
          onBlur={onBlur}
          // The first option takes the focus of the field, as on an error.
          inputRef={index === 0 ? firstOptionRef : undefined}
        />
      ))}
    </ul>
  );
}

type VehicleOptionProps = {
  vehicle: ClientVehicle;
  groupName: string;
  isChecked: boolean;
  onChoose: () => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement> | undefined;
};

// A raised card, pressed in when chosen, with the mark of the radio button
// (docs/padroes/design.md); the whole card is the label.
function VehicleOption({
  vehicle,
  groupName,
  isChecked,
  onChoose,
  onBlur,
  inputRef,
}: VehicleOptionProps) {
  const inputId = `${groupName}-${vehicle.id}`;
  const detailsId = `${inputId}-details`;
  return (
    <li
      className={cn(
        "relative flex items-start gap-3 rounded-xl bg-background p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ring",
        isChecked ? "inset-shadow-neu-sm" : "shadow-neu-sm",
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="radio"
        name={groupName}
        value={vehicle.id}
        checked={isChecked}
        onChange={onChoose}
        onBlur={onBlur}
        aria-describedby={detailsId}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background inset-shadow-neu-sm after:size-2 after:rounded-full after:bg-primary-foreground after:opacity-0 peer-checked:bg-primary peer-checked:inset-shadow-none peer-checked:after:opacity-100"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <label
          htmlFor={inputId}
          className={cn(
            "cursor-pointer font-semibold after:absolute after:inset-0 after:rounded-xl",
            isChecked && "text-link",
          )}
        >
          {vehicle.brand} {vehicle.model}
        </label>
        <p id={detailsId} className="text-sm text-muted-foreground">
          <span className="block">
            Placa {formatPlate(vehicle.plate)} · {vehicle.color}
          </span>
          <span className="block">
            {VEHICLE_TYPE_LABELS[vehicle.type]} · Porte{" "}
            {VEHICLE_SIZE_LABELS[vehicle.size]}
          </span>
        </p>
      </div>
    </li>
  );
}
