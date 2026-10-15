---
id: 0036
titulo: Organização das pastas do código
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seções 3.1 e 4.1
---

# 0036 – Organização das pastas do código

## Decisão

O código segue a árvore de `docs/plataforma/estrutura-de-pastas.md`: regras de negócio puras em `src/server/rules/`, separadas dos serviços; componentes do portal e do painel em subpastas por módulo; enums e rótulos compartilhados em `src/shared/constants/`; todo arquivo de `src/server/` com `import 'server-only'`; dados e scripts do banco em `supabase/`.

## Alternativa descartada

Estrutura clássica com `frontend/`, `backend/`, `database/` e `infrastructure/` separados, ou pastas por funcionalidade (`features/`) na interface.

## Justificativa

A aplicação é uma só (decisões 0001 e 0002), então pastas separadas de front e back só duplicariam configuração. Separar as regras puras dos serviços deixa visível o que é testado com TDD sem banco; as subpastas por módulo ligam o código aos assuntos de `docs/`; e o pacote `server-only` faz o build falhar se um componente de cliente importar código de servidor, onde está a chave de serviço do Supabase.
