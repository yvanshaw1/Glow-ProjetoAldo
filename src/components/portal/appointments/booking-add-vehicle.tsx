"use client";

import type { FormEvent } from "react";
import { PORTAL_ADD_VEHICLE_PROPS } from "@/components/portal/vehicles/vehicle-paths";
import { AddVehicleDialog } from "@/components/shared/add-vehicle-dialog";
import type { VehicleActionProps } from "@/components/shared/booking-vehicle-step";
import { cn } from "@/lib/utils";

// UC06 FE01 (docs/agendamento/agendar-servico.md): the register of the client
// area, above the vehicles and in the empty state.

// The dialog has its own form, rendered in a portal: React still bubbles its
// submit up to the form of the steps, so it stops here.
export function BookingAddVehicle({
  onAdded,
  isInEmptyState,
}: VehicleActionProps) {
  return (
    <div
      onSubmit={(event: FormEvent) => event.stopPropagation()}
      className={cn(!isInEmptyState && "flex sm:justify-start")}
    >
      <AddVehicleDialog
        {...PORTAL_ADD_VEHICLE_PROPS}
        onAdded={onAdded}
        className={cn(!isInEmptyState && "w-full sm:w-auto")}
      />
    </div>
  );
}
