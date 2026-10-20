"use client";

import { SearchIcon } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPagination } from "@/components/shared/list-pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ListFilters,
  PaginatedList as ListState,
} from "@/hooks/use-paginated-list";
import { cn } from "@/lib/utils";
import { SEARCH_TERM_MAX_LENGTH } from "@/shared/validation/formats";

type PaginatedListProps<T, F extends ListFilters> = {
  list: ListState<T, F>;
  searchLabel: string;
  searchPlaceholder: string;
  filters?: ReactNode;
  actions?: ReactNode;
  emptyTitle: string;
  emptyDescription?: string;
  renderItems: (items: T[]) => ReactNode;
};

// Places held while the first page loads, so the page does not shift.
const LOADING_PLACES = 3;

// docs/padroes/componentes.md, Listagem (RNF008): the search, the filters and
// the actions of the screen, the items drawn by the screen, and the
// pagination. The screen calls usePaginatedList and passes the result here.
export function PaginatedList<T, F extends ListFilters>({
  list,
  searchLabel,
  searchPlaceholder,
  filters,
  actions,
  emptyTitle,
  emptyDescription,
  renderItems,
}: PaginatedListProps<T, F>) {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  // The button goes away with the filters: the focus goes to the search.
  function clearFilters() {
    list.clearFilters();
    searchRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <div className="relative w-full md:max-w-sm">
          <Label htmlFor={searchId} className="sr-only">
            {searchLabel}
          </Label>
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={searchRef}
            id={searchId}
            type="search"
            value={list.searchText}
            onChange={(event) => list.setSearchText(event.target.value)}
            placeholder={searchPlaceholder}
            maxLength={SEARCH_TERM_MAX_LENGTH}
            enterKeyHint="search"
            autoComplete="off"
            className="pl-9"
          />
        </div>
        {filters}
        {/* RF048: the search and the filters go away in a single action. */}
        {list.hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
        {actions && (
          <div className="flex flex-wrap gap-3 md:ml-auto">{actions}</div>
        )}
      </div>
      <ListContent
        list={list}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        renderItems={renderItems}
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

type ListContentProps<T, F extends ListFilters> = Pick<
  PaginatedListProps<T, F>,
  "list" | "emptyTitle" | "emptyDescription" | "renderItems"
>;

// RNF004: the first load holds the place of the items; a new load keeps
// them, in the loading state; a failure offers to try again.
function ListContent<T, F extends ListFilters>({
  list,
  emptyTitle,
  emptyDescription,
  renderItems,
}: ListContentProps<T, F>) {
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
      <div aria-busy className="flex flex-col gap-3">
        {Array.from({ length: LOADING_PLACES }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }
  if (list.total === 0 && !list.isLoading) {
    return (
      <div role="status">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }
  return (
    <div
      aria-busy={list.isLoading}
      className={cn(
        "transition-opacity",
        list.isLoading && "pointer-events-none opacity-70",
      )}
    >
      {renderItems(list.items)}
    </div>
  );
}
