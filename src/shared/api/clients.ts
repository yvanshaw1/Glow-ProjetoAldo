// Bodies of the client routes of docs/clientes/rotas.md (UC04). An empty
// optional field is null (docs/padroes/api.md).

// GET /api/me/profile: the account data of the client of the session (RS009).
export type ClientProfile = {
  firstName: string;
  lastName: string;
  email: string;
  // The 11 digits of the mobile phone, without the mask.
  phone: string;
  // RNF011: sent back on the PATCH as it came, treated as text.
  updatedAt: string;
};
