"use client";

import { ClientCard } from "@/components/admin/clients/client-card";
import { PaginatedList } from "@/components/shared/paginated-list";
import { usePaginatedList, type ListFilters } from "@/hooks/use-paginated-list";
import type { AdminClient } from "@/shared/api/clients";
import { ADMIN_LIST_PAGE_SIZE } from "@/shared/constants/pagination";

// UC17 steps 2 and 3 (docs/clientes/clientes-do-painel.md): the clients by
// page, with the search by name, e-mail or phone, in the states of
// docs/padroes/componentes.md, Listagem.

const CLIENTS_PATH = "/api/admin/clients";
const NO_FILTERS: ListFilters = {};

export function ClientList() {
  const list = usePaginatedList<AdminClient, ListFilters>({
    path: CLIENTS_PATH,
    pageSize: ADMIN_LIST_PAGE_SIZE,
    initialFilters: NO_FILTERS,
  });

  return (
    <PaginatedList
      list={list}
      searchLabel="Buscar por nome, e-mail ou telefone"
      searchPlaceholder="Nome, e-mail ou telefone"
      // UC17 FE01: the message tells a search without result from no client.
      emptyTitle={
        list.hasActiveFilters
          ? "Nenhum cliente encontrado"
          : "Nenhum cliente cadastrado"
      }
      emptyDescription={
        list.hasActiveFilters
          ? "Não há clientes para o critério informado."
          : "Cadastre um cliente para ele aparecer aqui."
      }
      renderItems={(clients) => (
        <ul className="grid gap-3 xl:grid-cols-2">
          {clients.map((client) => (
            <li key={client.id}>
              <ClientCard client={client} onChange={list.reload} />
            </li>
          ))}
        </ul>
      )}
    />
  );
}
