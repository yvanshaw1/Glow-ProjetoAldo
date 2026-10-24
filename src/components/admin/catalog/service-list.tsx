"use client";

import { useState } from "react";
import { InactiveSwitch } from "@/components/admin/catalog/inactive-switch";
import { ServiceCard } from "@/components/admin/catalog/service-card";
import { ServiceTypeFilter } from "@/components/admin/catalog/service-type-filter";
import { FormAlert } from "@/components/shared/form-alert";
import { PaginatedList } from "@/components/shared/paginated-list";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { ApiError } from "@/lib/api-client";
import type { AdminServiceSummary } from "@/shared/api/catalog";
import { ADMIN_LIST_PAGE_SIZE } from "@/shared/constants/pagination";
import type { ServiceType } from "@/shared/constants/service-types";

// UC14, steps 2 and 3, and RF058 and RF059 (docs/catalogo/servicos-do-painel.md):
// the services by page, with the search by name, the filter by type and the
// inactive ones on request, in the states of docs/padroes/componentes.md,
// Listagem.

type ServiceFilters = {
  type: ServiceType | "";
  includeInactive: boolean;
};

// A new key on every failure, so the notice takes the focus each time.
type Failure = { key: number; error: ApiError };

type ServiceListProps = {
  onGoToCategories: () => void;
};

export function ServiceList({ onGoToCategories }: ServiceListProps) {
  const list = usePaginatedList<AdminServiceSummary, ServiceFilters>({
    path: "/api/admin/services",
    pageSize: ADMIN_LIST_PAGE_SIZE,
    initialFilters: { type: "", includeInactive: false },
  });
  const [failure, setFailure] = useState<Failure | null>(null);

  function changed() {
    setFailure(null);
    list.reload();
  }

  return (
    <div className="flex flex-col gap-5">
      {failure && (
        <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
      )}
      <PaginatedList
        list={list}
        searchLabel="Buscar por nome"
        searchPlaceholder="Buscar por nome..."
        filters={
          <>
            <ServiceTypeFilter
              value={list.filters.type}
              onChange={(type) => list.setFilter("type", type)}
            />
            <InactiveSwitch
              checked={list.filters.includeInactive}
              onCheckedChange={(checked) =>
                list.setFilter("includeInactive", checked)
              }
            />
          </>
        }
        emptyTitle={
          list.hasActiveFilters
            ? "Nenhum serviço encontrado"
            : "Nenhum serviço cadastrado"
        }
        emptyDescription={
          list.hasActiveFilters
            ? "Não há serviços para os critérios selecionados."
            : "Os serviços cadastrados aparecem aqui."
        }
        renderItems={(services) => (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <li key={service.id}>
                <ServiceCard
                  service={service}
                  onChange={changed}
                  onGoToCategories={onGoToCategories}
                  onFailed={(error) =>
                    setFailure((current) => ({
                      key: (current?.key ?? 0) + 1,
                      error,
                    }))
                  }
                />
              </li>
            ))}
          </ul>
        )}
      />
    </div>
  );
}
