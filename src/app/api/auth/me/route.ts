import { requireUser } from "@/server/auth/guards";
import { handleRoute } from "@/server/http/handler";
import { respondOk } from "@/server/http/respond";
import { toSessionUser } from "@/server/services/auth";

// RS004: accepts the pending initial password, so the pages can send the user
// to /set-password.
export const GET = handleRoute(async () => {
  const account = await requireUser({ allowPasswordChange: true });
  return respondOk(toSessionUser(account));
});
