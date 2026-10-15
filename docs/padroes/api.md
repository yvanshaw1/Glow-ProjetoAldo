---
titulo: Padrões da API
origem: Documentação de Arquitetura de Software, seção 6 e Apêndice A
relacionados: [RNF008, RNF011, RN035, RS013, RS014, RS017]
---

# Padrões da API

As rotas de cada assunto estão em `docs/<assunto>/rotas.md`. Aqui fica o que vale para todas.

## Desenho

- REST sobre HTTPS e JSON, tudo sob `/api`, no mesmo domínio. Recursos em inglês e no plural.
- `GET` consulta; `POST` cria ou executa uma ação; `PATCH` altera parte; `PUT` substitui uma configuração; `DELETE` exclui (lógico).
- `GET` nunca altera dados; `PUT` e `DELETE` são idempotentes. `POST` e `PATCH` nunca são repetidos automaticamente.
- Ações que não são simples alteração de dados viram rota própria com `POST` (`/advance`, `/complete`, `/cancel`, `/reschedule`), para a regra ficar no servidor.
- JSON em `camelCase`; datas e horários ISO 8601 com fuso; dinheiro como número com duas casas.
- Autenticação só pelo cookie de sessão; não há chave de API nem token enviado pela página.
- Sucesso: 200, 201 (criado) e 204 (sem corpo).
- API interna, sem versão no caminho. Mudanças de contrato aditivas (campo novo e opcional); remover ou renomear um campo só quando nenhuma página o usa mais.
- O contrato de um módulo é definido antes da implementação. A especificação OpenAPI fica em `docs/plataforma/openapi.yaml` (criada na primeira tarefa de API) e muda no mesmo PR que a rota, junto com o `rotas.md` do assunto.

## Validação (RN035, RS013)

- Toda entrada passa pelos esquemas Zod de `src/shared/validation`, que normalizam (espaços, caixa, máscaras) e depois validam tipo, formato e tamanho. Os mesmos esquemas servem aos formulários.
- Campos não previstos são descartados; valores calculados pelo sistema (preços, totais, porte, status, previsão, cópias do agendamento) nunca são aceitos na entrada.
- Id no caminho deve ser UUID válido; id inválido responde o mesmo 404 de registro inexistente.
- Filtros, ordenação e paginação só aceitam os valores previstos.
- Gravação só com `application/json` (exceto envio de imagem); outro formato → 415. Corpo JSON até 100 KB e imagem até 2 MB; acima → 413.
- Dinheiro calculado no servidor em centavos inteiros.
- Proteção contra CSRF: cookies `SameSite=Lax`, gravação só com JSON e conferência do cabeçalho `Origin` contra `APP_URL` (ou `VERCEL_URL` na pré-visualização) (RS014).

## Paginação (RNF008)

Toda listagem aceita `page` e `pageSize` (máximo 50; acima disso vale 50) e responde:

```
{ "data": [ ... ], "page": 1, "pageSize": 20, "total": 134 }
```

| Listagem | Itens por página |
|---|---|
| Catálogo público e serviços para agendar | 12 |
| Veículos do cliente, agendamentos do cliente, busca de clientes no novo agendamento, agenda do dia | 10 |
| Agendamentos do painel, serviços, categorias, clientes, funcionários e cargos | 20 |

Não paginam só as listas de tamanho fixo: sete dias da semana, quatro formas de pagamento e serviços de um agendamento.

## Erros (RFC 9457, RS017)

Toda resposta de erro é Problem Details, com `Content-Type: application/problem+json`, gerada pelo tratamento único. `type` é `about:blank`; o erro é identificado por `code`. A mensagem (`detail`) diz o que aconteceu e o que o usuário pode fazer, sem nada interno.

```
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Confira os campos destacados.",
  "instance": "/api/me/vehicles",
  "code": "VALIDATION_ERROR",
  "fields": { "plate": "Informe uma placa válida." },
  "requestId": "7f3c9a1e"
}
```

| HTTP | `code` | Mensagem |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Confira os campos destacados. (cada campo com a sua mensagem em `fields`) |
| 401 | `UNAUTHENTICATED` | Sua sessão expirou. Entre novamente. |
| 401 | `INVALID_CREDENTIALS` | E-mail ou senha incorretos. |
| 403 | `FORBIDDEN` | Você não tem permissão para realizar esta ação. |
| 403 | `ACCOUNT_INACTIVE` | Esta conta está desativada. Procure a administração da empresa. |
| 403 | `PASSWORD_CHANGE_REQUIRED` | Defina uma nova senha para continuar. |
| 404 | `NOT_FOUND` | Não encontramos o que você procura. |
| 409 | `EMAIL_IN_USE` | Este e-mail não pode ser usado. Se você já tem conta, entre com ela. |
| 409 | `INVALID_STATUS` | Esta ação não está disponível para a situação atual do agendamento. |
| 409 | `VERSION_CONFLICT` | Estes dados foram alterados por outra pessoa. Atualize a página e tente novamente. |
| 409 | `NAME_IN_USE` | Já existe um cadastro com este nome. |
| 409 | `PLATE_IN_USE` | Esta placa já está cadastrada em outro veículo. |
| 409 | `VEHICLE_ALREADY_LINKED` | Este veículo já está na sua conta. |
| 409 | `VEHICLE_SHARED` | Este veículo também está vinculado a outra conta. Para alterar os dados, procure a empresa. |
| 413 | `PAYLOAD_TOO_LARGE` | O conteúdo enviado é maior que o permitido. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Formato de envio não aceito. |
| 429 | `ACCOUNT_LOCKED` | Muitas tentativas. Aguarde alguns minutos e tente novamente. (com `Retry-After`) |
| 500 | `INTERNAL_ERROR` | Não foi possível concluir a operação. Tente novamente em instantes. |
| 503 | `SERVICE_UNAVAILABLE` | O serviço está temporariamente indisponível. Tente novamente em instantes. |

Os códigos e as mensagens ficam em `src/shared/errors`, usados pelo backend para responder e pelo frontend para exibir. Código novo entra nesta tabela no mesmo PR.

## Concorrência (RNF011)

Toda leitura de registro editável devolve `updatedAt`. `PATCH` e `PUT` exigem esse valor de volta, e a gravação só acontece se o registro ainda tiver o mesmo `updatedAt`, numa única instrução; senão nada é gravado e a resposta é 409 `VERSION_CONFLICT`. Em configurações gravadas em lista (disponibilidade, formas de pagamento), vale o `updatedAt` mais recente da lista. O frontend trata o valor como texto, sem convertê-lo em data. O valor só detecta conflito; permissões e regras continuam decididas pelo servidor.
