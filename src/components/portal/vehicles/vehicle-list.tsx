"use client";

import { CarFrontIcon } from "lucide-react";
import { AddVehicleDialog } from "@/components/portal/vehicles/add-vehicle-dialog";
import { VehicleCard } from "@/components/portal/vehicles/vehicle-card";
import { EmptyState } from "@/components/shared/empty-state";
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

// UC05 (docs/clientes/area-do-cliente.md): the vehicles of the account by
// page, with no search or filter, and the states of
// docs/padroes/componentes.md, Listagem, in the shape of the cards.

const VEHICLES_PATH = "/api/me/vehicles";
const NO_FILTERS: ListFilters = {};

// Cards held while the first page loads, so the page does not shift.
const LOADING_PLACES = 2;

const GRID_CLASS = "grid gap-8 md:grid-cols-2";

type VehicleListState = PaginatedList<ClientVehicle>;

export function VehicleList() {
  const list = usePaginatedList<ClientVehicle, ListFilters>({
    path: VEHICLES_PATH,
    pageSize: SHORT_LIST_PAGE_SIZE,
    initialFilters: NO_FILTERS,
  });
  // Without vehicles, the button is in the empty state.
  const isEmpty = list.hasLoaded && list.total === 0;

  return (
    <div className="flex flex-col gap-8">
      {!isEmpty && (
        <AddVehicleDialog
          onAdded={list.reload}
          className="w-full sm:w-auto sm:self-end"
        />
      )}
      <VehicleListContent list={list} />
      {list.hasLoaded && list.total > 0 && (
        <ListPagination
          page={list.page}
          pageCount={list.pageCount}
          firstItem={list.firstItem}
          lastItem={list.lastItem}
          total={list.total}
          onPageChange={list.setPage}
        />
      )}
    </div>
  );
}

// RNF004: the first load holds the place of the cards; a new load keeps
// them, in the loading state; a failure offers to try again.
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
      <div aria-busy className={GRID_CLASS}>
        {Array.from({ length: LOADING_PLACES }, (_, index) => (
          <VehicleCardPlaceholder key={index} />
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
          description="Cadastre um veículo para agendar serviços."
          action={<AddVehicleDialog onAdded={list.reload} />}
        />
      </div>
    );
  }
  return (
    <ul
      aria-busy={list.isLoading}
      className={cn(
        GRID_CLASS,
        "transition-opacity",
        list.isLoading && "pointer-events-none opacity-70",
      )}
    >
      {list.items.map((vehicle) => (
        <li key={vehicle.id}>
          <VehicleCard vehicle={vehicle} onChange={list.reload} />
        </li>
      ))}
    </ul>
  );
}

// The shape of a card: the name, the plate line, the type line and the
// button.
function VehicleCardPlaceholder() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md"
    >
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mt-2 h-10 w-full sm:w-20" />
    </div>
  );
}
