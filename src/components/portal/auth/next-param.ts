// The next parameter of the access pages (docs/acesso/protecao-das-paginas.md).
// The screens only pass it on, as it came: src/proxy.ts checks it before any
// redirect.

export function readNextParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

export function withNext(page: string, next: string | null): string {
  return next === null ? page : `${page}?${new URLSearchParams({ next })}`;
}
