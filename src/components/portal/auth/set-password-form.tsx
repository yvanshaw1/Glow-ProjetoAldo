"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { useFormFailure } from "@/hooks/use-form-failure";
import { apiRequest } from "@/lib/api-client";
import { changePasswordFormSchema } from "@/shared/validation/auth";

type SetPasswordFormValues = z.output<typeof changePasswordFormSchema>;

// UC03 FA03 and UC08 FA01: the initial password is changed on the first
// access (RN023, RS004).
export function SetPasswordForm() {
  const [isLeaving, setIsLeaving] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);

  // The confirmation is checked only here: the API gets its own fields.
  async function submit({
    currentPassword,
    newPassword,
  }: SetPasswordFormValues) {
    clearFailure();
    try {
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
      setIsLeaving(true);
      // Decision 0048: the session goes on, renewed. src/proxy.ts, with no
      // pending change, sends to next or to the home of the area.
      location.replace(location.href);
    } catch (error) {
      showFailure(error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {failure && (
        <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
      )}
      <form
        noValidate
        onSubmit={handleSubmit(submit, clearFailure)}
        className="flex flex-col gap-5"
      >
        <FormField
          control={control}
          name="currentPassword"
          label="Senha inicial"
          renderInput={(field) => (
            <PasswordInput {...field} autoComplete="current-password" />
          )}
        />
        <FormField
          control={control}
          name="newPassword"
          label="Nova senha"
          description="De 8 a 72 caracteres, com letra maiúscula, número e caractere especial."
          renderInput={(field) => (
            <PasswordInput {...field} autoComplete="new-password" />
          )}
        />
        <FormField
          control={control}
          name="newPasswordConfirmation"
          label="Confirmar nova senha"
          renderInput={(field) => (
            <PasswordInput {...field} autoComplete="new-password" />
          )}
        />
        <SubmitButton
          size="lg"
          className="w-full"
          isLoading={formState.isSubmitting || isLeaving}
          loadingLabel="Salvando…"
        >
          Salvar nova senha
        </SubmitButton>
      </form>
    </div>
  );
}
