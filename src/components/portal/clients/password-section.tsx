"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFormFailure } from "@/hooks/use-form-failure";
import { apiRequest } from "@/lib/api-client";
import { changePasswordFormSchema } from "@/shared/validation/auth";

// UC04 FA01: the password change of the account, a real write
// (POST /api/auth/change-password, #24), so the section has no demo notice
// (docs/clientes/area-do-cliente.md).

type ChangePasswordValues = z.output<typeof changePasswordFormSchema>;

const EMPTY_VALUES = {
  currentPassword: "",
  newPassword: "",
  newPasswordConfirmation: "",
};

export function PasswordSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const { control, handleSubmit, setError, reset, formState } = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    mode: "onTouched",
    defaultValues: EMPTY_VALUES,
  });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);

  // docs/padroes/componentes.md, Diálogos: the dialog does not close during
  // the call. The passwords typed never outlive the dialog.
  function changeOpen(open: boolean) {
    if (formState.isSubmitting) return;
    reset(EMPTY_VALUES);
    clearFailure();
    if (open) setIsChanged(false);
    setIsOpen(open);
  }

  // The confirmation is checked only here: the API gets its own fields.
  async function submit({
    currentPassword,
    newPassword,
  }: ChangePasswordValues) {
    clearFailure();
    try {
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
      reset(EMPTY_VALUES);
      setIsOpen(false);
      setIsChanged(true);
    } catch (error) {
      showFailure(error);
    }
  }

  return (
    <section
      aria-labelledby="password-title"
      className="flex flex-col gap-5 rounded-xl bg-background p-5 shadow-neu-md md:p-8"
    >
      <h2 id="password-title" className="font-semibold">
        Senha
      </h2>
      <div>
        <p className="text-muted-foreground">
          Para alterar a senha, informe a senha atual.
        </p>
        {/* RNF004: a polite status, present before the notice appears, so
            the screen reader hears it when the focus goes back to the
            button. */}
        <div role="status">
          {isChanged && (
            <Alert role="none" className="mt-5">
              <CircleCheckIcon aria-hidden />
              <AlertDescription>
                Senha alterada. As sessões abertas em outros aparelhos foram
                encerradas.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={changeOpen}>
        <DialogTrigger
          render={
            <Button
              variant="secondary"
              className="w-full sm:w-auto sm:self-start"
            />
          }
        >
          Alterar senha
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
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
              label="Senha atual"
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
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={formState.isSubmitting}
                  />
                }
              >
                Cancelar
              </DialogClose>
              <SubmitButton
                isLoading={formState.isSubmitting}
                loadingLabel="Salvando…"
              >
                Salvar nova senha
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
