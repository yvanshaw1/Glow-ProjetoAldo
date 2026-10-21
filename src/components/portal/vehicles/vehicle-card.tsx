import { InfoIcon } from "lucide-react";
import { EditVehicleDialog } from "@/components/portal/vehicles/edit-vehicle-dialog";
import type { ClientVehicle } from "@/shared/api/vehicles";
import { VEHICLE_SIZE_LABELS } from "@/shared/constants/vehicle-sizes";
import { VEHICLE_TYPE_LABELS } from "@/shared/constants/vehicle-types";
import { ERROR_CATALOG } from "@/shared/errors/catalog";
import { formatPlate } from "@/shared/format/plate";

// UC05 (docs/clientes/area-do-cliente.md): a vehicle of the account, with
// the type and the size of RN002. A vehicle also linked to another account
// is changed only by the company, so its card offers no edit (FE03, RN036).

type VehicleCardProps = {
  vehicle: ClientVehicle;
  onChange: () => void;
};

export function VehicleCard({ vehicle, onChange }: VehicleCardProps) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md">
      <h2 className="font-semibold">
        {vehicle.brand} {vehicle.model}
      </h2>
      <p className="text-muted-foreground">
        Placa {formatPlate(vehicle.plate)} · {vehicle.color} · {vehicle.year}
      </p>
      <p>
        {VEHICLE_TYPE_LABELS[vehicle.type]} · Porte{" "}
        {VEHICLE_SIZE_LABELS[vehicle.size]}
      </p>
      <div className="mt-auto flex flex-col pt-2">
        {vehicle.isShared ? (
          <p className="flex gap-2 text-muted-foreground">
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            {ERROR_CATALOG.VEHICLE_SHARED.message}
          </p>
        ) : (
          <EditVehicleDialog
            vehicle={vehicle}
            onSaved={onChange}
            onConflict={onChange}
          />
        )}
      </div>
    </article>
  );
}
