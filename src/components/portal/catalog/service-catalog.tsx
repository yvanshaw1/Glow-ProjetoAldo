"use client";

import { CategoryFilter } from "@/components/portal/catalog/category-filter";
import { ServiceCard } from "@/components/portal/catalog/service-card";
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
import type { PublicService } from "@/shared/api/catalog";
import { CATALOG_PAGE_SIZE } from "@/shared/constants/pagination";

// docs/catalogo/paginas-publicas.md, Catálogo (UC01, steps 3 and 4): the
// active services by page, with the category filter and the states of
// docs/padroes/componentes.md, Listagem, in the shape of the grid. The
// catalog has no search.

const SERVICES_PATH = "/api/public/services";

// Cards held while the first page loads, so the page does not shift.
const LOADING_PLACES = 3;

const GRID_CLASS = "grid gap-8 md:grid-cols-2 lg:grid-cols-3";

type CatalogFilters = {
  categoryId: string | undefined;
};

type CatalogList = PaginatedList<PublicService, CatalogFilters>;

export function ServiceCatalog() {
  const list = usePaginatedList<PublicService, CatalogFilters>({
    path: SERVICES_PATH,
    pageSize: CATALOG_PAGE_SIZE,
    initialFilters: { categoryId: undefined },
  });

  return (
    <div className="flex flex-col gap-8">
      <CategoryFilter
        categoryId={list.filters.categoryId}
        onChange={(categoryId) => list.setFilter("categoryId", categoryId)}
      />
      <CatalogContent list={list} />
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
// them, in the loading state; a failure offers to try again (UC01 FE02).
function CatalogContent({ list }: { list: CatalogList }) {
  if (list.error) {
    return (
      <Alert variant="destructive" className="self-start">
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
          <ServiceCardPlaceholder key={index} />
        ))}
      </div>
    );
  }
  if (list.total === 0 && !list.isLoading) {
    // UC01 FE01
    return (
      <div role="status">
        <EmptyState title="Não há serviços disponíveis no momento." />
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
      {list.items.map((service) => (
        <li key={service.id}>
          <ServiceCard service={service} />
        </li>
      ))}
    </ul>
  );
}

// The shape of a card: the image, the category, the name, two lines of
// description and the duration.
function ServiceCardPlaceholder() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-5 rounded-xl bg-background p-5 shadow-neu-md"
    >
      <Skeleton className="aspect-[1.618] w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4.5 w-24" />
        <Skeleton className="h-6.5 w-3/4" />
        <Skeleton className="h-13 w-full" />
        <Skeleton className="h-5 w-40" />
      </div>
    </div>
  );
}
