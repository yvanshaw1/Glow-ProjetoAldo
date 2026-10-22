// The days of the business hours as the screens show them, by the weekday of
// the API: from Sunday (0) to Saturday (6) (docs/configuracoes/rotas.md).
export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

// The head of the columns of the booking calendar, in the same order.
export const WEEKDAY_SHORT_LABELS = [
  "dom",
  "seg",
  "ter",
  "qua",
  "qui",
  "sex",
  "sáb",
] as const;
