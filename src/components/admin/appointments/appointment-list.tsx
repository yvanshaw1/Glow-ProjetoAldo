"use client";

import { RefreshCwIcon } from "lucide-react";
import { AppointmentCard } from "@/components/admin/appointments/appointment-card";
import { PaginatedList } from "@/components/shared/paginated-list";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { AdminAppointmentSummary } from "@/shared/api/appointments";
import {
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "@/shared/constants/appointment-statuses";
import {
  APPOINTMENT_SORT_LABELS,
  APPOINTMENT_SORTS,
  APPOINTMENT_VIEW_STATUSES,
  type AppointmentSort,
  type AppointmentView,
} from "@/shared/constants/appointment-views";
import { ADMIN_LIST_PAGE_SIZE } from "@/shared/constants/pagination";

// UC10 (docs/agendamento/agendamentos-do-painel.md): the appointments of one
// view by page, with the search, the status filter, the sorting and the
// refresh, in the states of docs/padroes/componentes.md, Listagem.

const APPOINTMENTS_PATH = "/api/admin/appointments";

// The option that takes the filter off; the query sends no status for it.
const ALL_STATUSES = "all";

type AppointmentFilters = {
  view: AppointmentView;
  status: AppointmentStatus | "";
  sort: AppointmentSort;
};

type Option = { value: string; label: string };

const SORT_OPTIONS: Option[] = APPOINTMENT_SORTS.map((sort) => ({
  value: sort,
  label: `Ordenar por ${APPOINTMENT_SORT_LABELS[sort].toLowerCase()}`,
}));

type AppointmentListProps = {
  view: AppointmentView;
  emptyTitle: string;
  emptyDescription: string;
};

export function AppointmentList({
  view,
  emptyTitle,
  emptyDescription,
}: AppointmentListProps) {
  const list = usePaginatedList<AdminAppointmentSummary, AppointmentFilters>({
    path: APPOINTMENTS_PATH,
    pageSize: ADMIN_LIST_PAGE_SIZE,
    initialFilters: { view, status: "", sort: "time" },
  });
  // RF046: only the statuses the view can hold.
  const statusOptions: Option[] = [
    { value: ALL_STATUSES, label: "Todos os status" },
    ...APPOINTMENT_VIEW_STATUSES[view].map((status) => ({
      value: status,
      label: APPOINTMENT_STATUS_LABELS[status],
    })),
  ];
  const status = list.filters.status || ALL_STATUSES;
  const statusLabel = statusOptions.find(
    ({ value }) => value === status,
  )?.label;
  const sortLabel = SORT_OPTIONS.find(
    ({ value }) => value === list.filters.sort,
  )?.label;

  return (
    <PaginatedList
      list={list}
      searchLabel="Buscar por cliente ou veículo"
      searchPlaceholder="Cliente, placa, marca ou modelo"
      filters={
        <>
          <OptionSelect
            value={status}
            options={statusOptions}
            // A combobox takes its name from the label, not from its text: it
            // holds the visible text, and for the status adds the filter.
            ariaLabel={`Filtrar por status: ${statusLabel}`}
            onChange={(value) =>
              list.setFilter(
                "status",
                value === ALL_STATUSES ? "" : (value as AppointmentStatus),
              )
            }
          />
          <OptionSelect
            value={list.filters.sort}
            options={SORT_OPTIONS}
            ariaLabel={sortLabel}
            onChange={(value) =>
              list.setFilter("sort", value as AppointmentSort)
            }
          />
        </>
      }
      actions={
        // RF049: nothing is disabled, so the focus stays on the button.
        <Button variant="secondary" onClick={list.reload}>
          <RefreshCwIcon aria-hidden />
          Atualizar
        </Button>
      }
      emptyTitle={
        list.hasActiveFilters ? "Nenhum agendamento encontrado" : emptyTitle
      }
      emptyDescription={
        list.hasActiveFilters
          ? "Não há agendamentos para os critérios selecionados."
          : emptyDescription
      }
      renderItems={(appointments) => (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <AppointmentCard
                appointment={appointment}
                onChange={list.reload}
              />
            </li>
          ))}
        </ul>
      )}
    />
  );
}

type OptionSelectProps = {
  value: string;
  options: Option[];
  ariaLabel: string | undefined;
  onChange: (value: string) => void;
};

function OptionSelect({
  value,
  options,
  ariaLabel,
  onChange,
}: OptionSelectProps) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <SelectTrigger aria-label={ariaLabel} className="w-full md:w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
