"use client";

import { AddVehicleDialog } from "@/components/shared/add-vehicle-dialog";
import { ClientVehicleCard } from "@/components/admin/vehicles/client-vehicle-card";
import { ListPagination } from "@/components/shared/list-pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePaginatedList,
  type ListFilters,
  type PaginatedList,
} from "@/hooks/use-paginated-list";
import { cn } from "@/lib/utils";
import type { ClientVehicle } from "@/shared/api/vehicles";
import { SHORT_LIST_PAGE_SIZE } from "@/shared/constants/pagination";

// UC17 step 5 (docs/clientes/clientes-do-painel.md): the vehicles of the
// client by page, in the order they were linked, with the states of
// docs/padroes/componentes.md, Listagem, in the shape of the cards.

const NO_FILTERS: ListFilters = {};
const LOOKUP_PATH = "/api/admin/vehicles/lookup";

// Cards held while the first page loads, so the dialog does not shift.
const LOADING_PLACES = 2;

type VehicleListState = PaginatedList<ClientVehicle>;

type ClientVehicleListProps = {
  clientId: string;
};

export function ClientVehicleList({ clientId }: ClientVehicleListProps) {
  const list = usePaginatedList<ClientVehicle, ListFilters>({
    path: `/api/admin/clients/${clientId}/vehicles`,
    pageSize: SHORT_LIST_PAGE_SIZE,
    initialFilters: NO_FILTERS,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* UC18 step 1: a new vehicle makes the list be read again. */}
      <AddVehicleDialog
        createPath={`/api/admin/clients/${clientId}/vehicles`}
        lookupPath={LOOKUP_PATH}
        linkLabel="Adicionar à conta"
        onAdded={list.reload}
        className="w-full sm:w-auto sm:self-end"
      />
      <VehicleListContent list={list} />
    </div>
  );
}

function VehicleListContent({ list }: { list: VehicleListState }) {
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
      <div aria-busy className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: LOADING_PLACES }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }
  if (list.total === 0 && !list.isLoading) {
    return (
      <p role="status" className="text-muted-foreground">
        Nenhum veículo cadastrado.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <ul
        aria-busy={list.isLoading}
        className={cn(
          "grid gap-3 transition-opacity sm:grid-cols-2",
          list.isLoading && "pointer-events-none opacity-70",
        )}
      >
        {list.items.map((vehicle) => (
          <li key={vehicle.id}>
            <ClientVehicleCard vehicle={vehicle} onChange={list.reload} />
          </li>
        ))}
      </ul>
      <ListPagination
        page={list.page}
        pageCount={list.pageCount}
        firstItem={list.firstItem}
        lastItem={list.lastItem}
        total={list.total}
        onPageChange={list.setPage}
      />
    </div>
  );
}
