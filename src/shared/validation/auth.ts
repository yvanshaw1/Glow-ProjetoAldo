import { z } from "zod";
import {
  emailSchema,
  mobilePhoneSchema,
  passwordSchema,
  personNameSchema,
  signInPasswordSchema,
} from "@/shared/validation/formats";

// Bodies of the routes of /api/auth (docs/acesso/rotas.md). Unknown fields
// are discarded (RS013).

const SAME_PASSWORD_MESSAGE = "A nova senha precisa ser diferente da atual.";

export const loginSchema = z.object({
  email: emailSchema,
  password: signInPasswordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

// UC02: the account is born without a pending password change.
export const registerSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  email: emailSchema,
  phone: mobilePhoneSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

// The current password, the initial one on the first access, is checked by
// the service like a login, so it follows the login rules (RS005).
export const changePasswordSchema = z
  .object({
    currentPassword: signInPasswordSchema,
    newPassword: passwordSchema,
  })
  // RN023, RS004: compared as typed, as passwords are stored (RN035).
  .refine(
    ({ currentPassword, newPassword }) => newPassword !== currentPassword,
    { error: SAME_PASSWORD_MESSAGE, path: ["newPassword"] },
  );

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
