import { requireUser } from "@/server/auth/guards";
import { handleRoute } from "@/server/http/handler";
import { respondNoContent } from "@/server/http/respond";
import { changePassword } from "@/server/services/auth";
import { changePasswordSchema } from "@/shared/validation/auth";

// RS004: the only route besides GET /api/auth/me that accepts the pending
// initial password.
export const POST = handleRoute(async ({ body }) => {
  const account = await requireUser({ allowPasswordChange: true });
  const input = changePasswordSchema.parse(body);
  await changePassword(account, input);
  return respondNoContent();
});
