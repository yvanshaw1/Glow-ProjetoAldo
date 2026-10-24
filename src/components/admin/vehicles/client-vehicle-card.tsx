import { InfoIcon } from "lucide-react";
import type { ClientVehicle } from "@/shared/api/vehicles";
import { VEHICLE_SIZE_LABELS } from "@/shared/constants/vehicle-sizes";
import { VEHICLE_TYPE_LABELS } from "@/shared/constants/vehicle-types";
import { formatPlate } from "@/shared/format/plate";

// UC17 step 5 and UC18 (docs/clientes/clientes-do-painel.md): a vehicle of
// the client, with the type and the size of RN002. A vehicle also linked to
// another account says so (RN036).

type ClientVehicleCardProps = {
  vehicle: ClientVehicle;
};

export function ClientVehicleCard({ vehicle }: ClientVehicleCardProps) {
  return (
    <article className="flex h-full flex-col gap-2 rounded-xl bg-background p-4 shadow-neu-sm">
      <h4 className="font-semibold">
        {vehicle.brand} {vehicle.model}
      </h4>
      <p className="text-muted-foreground">
        Placa {formatPlate(vehicle.plate)} · {vehicle.color} · {vehicle.year}
      </p>
      <p>
        {VEHICLE_TYPE_LABELS[vehicle.type]} · Porte{" "}
        {VEHICLE_SIZE_LABELS[vehicle.size]}
      </p>
      {vehicle.isShared && (
        <p className="flex gap-2 text-muted-foreground">
          <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          Também vinculado a outra conta
        </p>
      )}
    </article>
  );
}
