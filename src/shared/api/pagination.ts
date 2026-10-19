// Body of every listing (docs/padroes/api.md, Paginação; RNF008).
export type Page<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};
