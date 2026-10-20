"use client";

import { useEffect, useState } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { withQuery, type ApiError } from "@/lib/api-client";
import type { Page } from "@/shared/api/pagination";

// docs/padroes/componentes.md, Listagem (RNF008): the page, the search and
// the filters live in the component, not in the address.

const FIRST_PAGE = 1;
// The search runs this long after the last key, not on every key.
const SEARCH_DELAY_MS = 300;

export type ListFilters = Record<string, string | boolean | undefined>;

type ListCriteria<F extends ListFilters> = {
  page: number;
  search: string;
  filters: F;
};

type PaginatedListOptions<F extends ListFilters> = {
  path: string;
  pageSize: number;
  initialFilters: F;
};

export type PaginatedList<T, F extends ListFilters = ListFilters> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasLoaded: boolean;
  isLoading: boolean;
  error: ApiError | null;
  searchText: string;
  filters: F;
  hasActiveFilters: boolean;
  setPage: (page: number) => void;
  setSearchText: (text: string) => void;
  setFilter: <K extends keyof F>(name: K, value: F[K]) => void;
  clearFilters: () => void;
  reload: () => void;
};

export function usePaginatedList<T, F extends ListFilters>({
  path,
  pageSize,
  initialFilters,
}: PaginatedListOptions<F>): PaginatedList<T, F> {
  const [defaultFilters] = useState(initialFilters);
  const [searchText, setSearchText] = useState("");
  const [criteria, setCriteria] = useState<ListCriteria<F>>({
    page: FIRST_PAGE,
    search: "",
    filters: defaultFilters,
  });
  const query = useApiQuery<Page<T>>(
    withQuery(path, {
      page: criteria.page,
      pageSize,
      search: criteria.search,
      ...criteria.filters,
    }),
  );

  // A new search goes back to the first page; the same search, with other
  // spaces around it, keeps the page.
  useEffect(() => {
    const timer = setTimeout(() => {
      const search = searchText.trim();
      setCriteria((current) =>
        current.search === search
          ? current
          : { ...current, search, page: FIRST_PAGE },
      );
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const result = query.data;
  const pageCount = result
    ? Math.max(1, Math.ceil(result.total / result.pageSize))
    : 1;
  // A deletion that empties the last page leads to the last page with items.
  if (result && result.data.length === 0 && criteria.page > pageCount) {
    setCriteria({ ...criteria, page: pageCount });
  }

  return {
    items: result?.data ?? [],
    total: result?.total ?? 0,
    page: criteria.page,
    pageSize: result?.pageSize ?? pageSize,
    pageCount,
    hasLoaded: result !== null,
    isLoading: query.isLoading,
    error: query.error,
    searchText,
    filters: criteria.filters,
    hasActiveFilters:
      criteria.search !== "" ||
      Object.keys(criteria.filters).some(
        (name) => criteria.filters[name] !== defaultFilters[name],
      ),
    setPage: (newPage) => setCriteria({ ...criteria, page: newPage }),
    setSearchText,
    setFilter: (name, value) =>
      setCriteria({
        ...criteria,
        page: FIRST_PAGE,
        filters: { ...criteria.filters, [name]: value },
      }),
    clearFilters: () => {
      setSearchText("");
      setCriteria({ page: FIRST_PAGE, search: "", filters: defaultFilters });
    },
    reload: query.reload,
  };
}
