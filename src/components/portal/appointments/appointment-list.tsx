"use client";

import { CalendarX2Icon } from "lucide-react";
import { AppointmentCard } from "@/components/portal/appointments/appointment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPagination } from "@/components/shared/list-pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePaginatedList,
  type PaginatedList,
} from "@/hooks/use-paginated-list";
import { cn } from "@/lib/utils";
import type {
  AppointmentScope,
  ClientAppointmentSummary,
} from "@/shared/api/appointments";
import { SHORT_LIST_PAGE_SIZE } from "@/shared/constants/pagination";

// UC07 (docs/agendamento/meus-agendamentos.md): the appointments of one
// scope by page, in the order of the route, with the states of
// docs/padroes/componentes.md, Listagem, in the shape of the cards.

const APPOINTMENTS_PATH = "/api/me/appointments";

// Cards held while the first page loads, so the page does not shift.
const LOADING_PLACES = 2;

const GRID_CLASS = "grid gap-8 lg:grid-cols-2";

type AppointmentFilters = {
  scope: AppointmentScope;
};

type AppointmentListState = PaginatedList<
  ClientAppointmentSummary,
  AppointmentFilters
>;

type AppointmentListProps = {
  scope: AppointmentScope;
  emptyTitle: string;
  emptyDescription: string;
};

export function AppointmentList({
  scope,
  emptyTitle,
  emptyDescription,
}: AppointmentListProps) {
  const list = usePaginatedList<ClientAppointmentSummary, AppointmentFilters>({
    path: APPOINTMENTS_PATH,
    pageSize: SHORT_LIST_PAGE_SIZE,
    initialFilters: { scope },
  });

  return (
    <div className="flex flex-col gap-8">
      <AppointmentListContent
        list={list}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
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

type AppointmentListContentProps = Omit<AppointmentListProps, "scope"> & {
  list: AppointmentListState;
};

// RNF004: the first load holds the place of the cards; a new load keeps
// them, in the loading state; a failure offers to try again. UC07 FE01: no
// appointment shows the message of the tab.
function AppointmentListContent({
  list,
  emptyTitle,
  emptyDescription,
}: AppointmentListContentProps) {
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
          <AppointmentCardPlaceholder key={index} />
        ))}
      </div>
    );
  }
  if (list.total === 0 && !list.isLoading) {
    return (
      <div role="status">
        <EmptyState
          icon={CalendarX2Icon}
          title={emptyTitle}
          description={emptyDescription}
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
      {list.items.map((appointment) => (
        <li key={appointment.id}>
          <AppointmentCard appointment={appointment} onChange={list.reload} />
        </li>
      ))}
    </ul>
  );
}

// The shape of a card: the status, the vehicle, the plate, the date, the
// estimated end, the services, the total and the button.
function AppointmentCardPlaceholder() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md"
    >
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-2 h-10 w-full sm:w-28" />
    </div>
  );
}
