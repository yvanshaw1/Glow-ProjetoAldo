---
id: 0005
titulo: Autorização na API, com o banco fechado ao navegador
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: []
---

# 0005 – Autorização na API, com o banco fechado ao navegador

## Decisão

Autorização na API, com o banco fechado ao navegador.

## Alternativa descartada

Políticas de acesso por tabela no banco e permissões gravadas no token.

## Justificativa

Concentra as regras de acesso em um só lugar, no mesmo idioma do restante do código, e faz desativações e mudanças de cargo valerem de imediato.
