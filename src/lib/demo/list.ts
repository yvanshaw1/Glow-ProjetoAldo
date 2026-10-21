import type { Page } from "@/shared/api/pagination";
import { paginationSchema } from "@/shared/validation/params";

const SEARCH_LOCALE = "pt-BR";

type DemoPageOptions<T> = {
  // The page size of the listing in docs/padroes/api.md (RNF008).
  pageSize: number;
  // The texts of an item the screen searches.
  searchIn?: (item: T) => (string | null)[];
  // One reader per filter of the query, compared by equality.
  filters?: Record<string, (item: T) => string | boolean | null>;
};

// docs/padroes/componentes.md, Telas de demonstração: a page of the fixed
// list, with the search and the filters of the query, in the order of the
// list. A filter that is not an equality, and the sorting, are applied by the
// data module before this.
export function demoPage<T>(
  items: readonly T[],
  query: URLSearchParams,
  { pageSize: defaultPageSize, searchIn, filters = {} }: DemoPageOptions<T>,
): Page<T> {
  // The same page and page size the routes take, unknown parameters left out.
  const { page, pageSize } = paginationSchema(defaultPageSize).parse(
    Object.fromEntries(query),
  );
  const term = (query.get("search") ?? "")
    .trim()
    .toLocaleLowerCase(SEARCH_LOCALE);
  const matchingItems = items.filter(
    (item) =>
      hasSearchTerm(item, term, searchIn) &&
      matchesFilters(item, query, filters),
  );
  const start = (page - 1) * pageSize;
  return {
    data: matchingItems.slice(start, start + pageSize),
    page,
    pageSize,
    total: matchingItems.length,
  };
}

// The term contained in one of the texts, ignoring case.
function hasSearchTerm<T>(
  item: T,
  term: string,
  searchIn: DemoPageOptions<T>["searchIn"],
): boolean {
  if (term === "" || !searchIn) return true;
  return searchIn(item).some(
    (text) =>
      text !== null && text.toLocaleLowerCase(SEARCH_LOCALE).includes(term),
  );
}

// A filter absent from the query, or empty, does not filter; the value is
// compared as text, as withQuery writes it (true and false included).
function matchesFilters<T>(
  item: T,
  query: URLSearchParams,
  filters: NonNullable<DemoPageOptions<T>["filters"]>,
): boolean {
  return Object.entries(filters).every(([name, readValue]) => {
    const value = query.get(name);
    return value === null || value === "" || String(readValue(item)) === value;
  });
}
