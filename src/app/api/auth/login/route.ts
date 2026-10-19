import { handleRoute } from "@/server/http/handler";
import { respondOk } from "@/server/http/respond";
import { login } from "@/server/services/auth";
import { loginSchema } from "@/shared/validation/auth";

// UC03, UC08: public route; the session goes to the cookies.
export const POST = handleRoute(async ({ body }) => {
  const input = loginSchema.parse(body);
  return respondOk(await login(input));
});
