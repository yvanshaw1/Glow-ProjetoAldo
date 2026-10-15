# `src/components/` – Componentes React

Componentes organizados por interface e, dentro dela, por módulo (os mesmos nomes do backend), mais os base do shadcn/ui e os compartilhados.

## Vai aqui

- `ui/` (gerados pelo shadcn), `shared/` (usados pelas duas interfaces), `portal/<módulo>/` e `admin/<módulo>/`

## Não vai aqui

- páginas e layouts de rota (→ `src/app/`)
- chamadas ao Supabase ou imports de `src/server/`: os dados chegam pela API, via `src/lib/api-client.ts`
- regras de negócio, como cálculo de preço (a API devolve o resultado, por exemplo no `preview`)
- hooks reutilizáveis (→ `src/hooks/`) e funções de formatação (→ `src/shared/format/`)

## Referências

- `docs/padroes/frontend.md`
