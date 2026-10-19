import { handleRoute } from "@/server/http/handler";
import { respondNoContent } from "@/server/http/respond";
import { logout } from "@/server/services/auth";

// No guard: answers 204 even without a session, with a deactivated account or
// with the initial password pending (docs/acesso/autenticacao.md).
export const POST = handleRoute(async () => {
  await logout();
  return respondNoContent();
});
