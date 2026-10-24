"use client";

import { CategoryCard } from "@/components/admin/catalog/category-card";
import { InactiveSwitch } from "@/components/admin/catalog/inactive-switch";
import { PaginatedList } from "@/components/shared/paginated-list";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { AdminCategory } from "@/shared/api/catalog";
import { ADMIN_LIST_PAGE_SIZE } from "@/shared/constants/pagination";

// UC15 (docs/catalogo/servicos-do-painel.md): the categories by page, with
// the inactive ones on request, in the states of docs/padroes/componentes.md,
// Listagem.

type CategoryFilters = { includeInactive: boolean };

export function CategoryList() {
  const list = usePaginatedList<AdminCategory, CategoryFilters>({
    path: "/api/admin/categories",
    pageSize: ADMIN_LIST_PAGE_SIZE,
    initialFilters: { includeInactive: false },
  });
  return (
    <PaginatedList
      list={list}
      hasClearButton={false}
      filters={
        <InactiveSwitch
          checked={list.filters.includeInactive}
          onCheckedChange={(checked) =>
            list.setFilter("includeInactive", checked)
          }
        />
      }
      emptyTitle="Nenhuma categoria cadastrada"
      emptyDescription="As categorias dos serviços aparecem aqui."
      renderItems={(categories) => (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryCard category={category} onChange={list.reload} />
            </li>
          ))}
        </ul>
      )}
    />
  );
}
