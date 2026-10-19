// Error codes of docs/padroes/api.md (Erros), with the HTTP status and the
// message shown to the user. A new code enters that table in the same PR.
export const ERROR_CATALOG = {
  VALIDATION_ERROR: {
    status: 400,
    message: "Confira os campos destacados.",
  },
  UNAUTHENTICATED: {
    status: 401,
    message: "Sua sessão expirou. Entre novamente.",
  },
  INVALID_CREDENTIALS: {
    status: 401,
    message: "E-mail ou senha incorretos.",
  },
  FORBIDDEN: {
    status: 403,
    message: "Você não tem permissão para realizar esta ação.",
  },
  ACCOUNT_INACTIVE: {
    status: 403,
    message: "Esta conta está desativada. Procure a administração da empresa.",
  },
  PASSWORD_CHANGE_REQUIRED: {
    status: 403,
    message: "Defina uma nova senha para continuar.",
  },
  NOT_FOUND: {
    status: 404,
    message: "Não encontramos o que você procura.",
  },
  EMAIL_IN_USE: {
    status: 409,
    message:
      "Este e-mail não pode ser usado. Se você já tem conta, entre com ela.",
  },
  INVALID_STATUS: {
    status: 409,
    message:
      "Esta ação não está disponível para a situação atual do agendamento.",
  },
  VERSION_CONFLICT: {
    status: 409,
    message:
      "Estes dados foram alterados por outra pessoa. Atualize a página e tente novamente.",
  },
  NAME_IN_USE: {
    status: 409,
    message: "Já existe um cadastro com este nome.",
  },
  PLATE_IN_USE: {
    status: 409,
    message: "Esta placa já está cadastrada em outro veículo.",
  },
  VEHICLE_ALREADY_LINKED: {
    status: 409,
    message: "Este veículo já está na sua conta.",
  },
  VEHICLE_SHARED: {
    status: 409,
    message:
      "Este veículo também está vinculado a outra conta. Para alterar os dados, procure a empresa.",
  },
  PAYLOAD_TOO_LARGE: {
    status: 413,
    message: "O conteúdo enviado é maior que o permitido.",
  },
  UNSUPPORTED_MEDIA_TYPE: {
    status: 415,
    message: "Formato de envio não aceito.",
  },
  ACCOUNT_LOCKED: {
    status: 429,
    message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  },
  INTERNAL_ERROR: {
    status: 500,
    message:
      "Não foi possível concluir a operação. Tente novamente em instantes.",
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
    message:
      "O serviço está temporariamente indisponível. Tente novamente em instantes.",
  },
} as const satisfies Record<string, { status: number; message: string }>;

export type ErrorCode = keyof typeof ERROR_CATALOG;
