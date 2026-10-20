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

// Forms of /register and /set-password: the bodies above plus the password
// confirmation, checked only on the screen and never sent to the API
// (docs/padroes/frontend.md).

const PASSWORD_MISMATCH_MESSAGE = "As senhas não conferem.";

// The confirmation is only required, like the password typed at the login;
// whether it matches is the refinement below.
const passwordConfirmationSchema = signInPasswordSchema;

// RN035: compared as typed. It runs as soon as the password and its
// confirmation are valid, even when another field is not, so the message
// shows while the form is filled.
function whenFieldsAreValid(...fields: string[]) {
  return ({ issues }: z.core.ParsePayload) =>
    !issues.some(({ path = [] }) => fields.includes(String(path[0])));
}

export const registerFormSchema = registerSchema
  .extend({ passwordConfirmation: passwordConfirmationSchema })
  .refine(
    ({ password, passwordConfirmation }) => password === passwordConfirmation,
    {
      error: PASSWORD_MISMATCH_MESSAGE,
      path: ["passwordConfirmation"],
      when: whenFieldsAreValid("password", "passwordConfirmation"),
    },
  );

export type RegisterFormInput = z.input<typeof registerFormSchema>;

export const changePasswordFormSchema = changePasswordSchema
  .safeExtend({ newPasswordConfirmation: passwordConfirmationSchema })
  .refine(
    ({ newPassword, newPasswordConfirmation }) =>
      newPassword === newPasswordConfirmation,
    {
      error: PASSWORD_MISMATCH_MESSAGE,
      path: ["newPasswordConfirmation"],
      when: whenFieldsAreValid("newPassword", "newPasswordConfirmation"),
    },
  );

export type ChangePasswordFormInput = z.input<typeof changePasswordFormSchema>;
