---
id: 0020
titulo: Tabelas separadas para clientes e para funcionários
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: []
---

# 0020 – Tabelas separadas para clientes e para funcionários

## Decisão

Tabelas separadas para clientes e para funcionários.

## Alternativa descartada

Tabela única de usuários, com uma coluna de perfil.

## Justificativa

Cada tabela tem apenas as colunas do seu perfil, com a obrigatoriedade garantida pelo banco, e as chaves estrangeiras apontam para o tipo certo de conta. O login continua único porque a autenticação é feita no Supabase Auth, e não nessas tabelas.
