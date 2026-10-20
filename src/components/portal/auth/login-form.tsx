"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { withNext } from "@/components/portal/auth/next-param";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useFormFailure } from "@/hooks/use-form-failure";
import { useSession } from "@/hooks/use-session";
import { apiRequest } from "@/lib/api-client";
import type { SessionUser } from "@/shared/api/auth";
import { loginSchema, type LoginInput } from "@/shared/validation/auth";

type LoginFormProps = {
  next: string | null;
  // UC02, step 6: the account was just created.
  isRegistered: boolean;
};

// UC03 and UC08: one login for clients and staff (RN029).
export function LoginForm({ next, isRegistered }: LoginFormProps) {
  const { signIn } = useSession();
  const [isLeaving, setIsLeaving] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);

  async function submit(input: LoginInput) {
    clearFailure();
    try {
      const user = await apiRequest<SessionUser>("/api/auth/login", {
        method: "POST",
        body: input,
      });
      signIn(user);
      setIsLeaving(true);
      // src/proxy.ts sees the new session on this same address and sends to
      // next, to the home of the area or to the password change.
      location.replace(location.href);
    } catch (error) {
      showFailure(error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isRegistered && !failure && (
        <Alert>
          <AlertDescription>
            Conta criada. Agora entre com o seu e-mail e a sua senha.
          </AlertDescription>
        </Alert>
      )}
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
          name="email"
          label="E-mail"
          renderInput={(field) => (
            <Input
              {...field}
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
            />
          )}
        />
        <FormField
          control={control}
          name="password"
          label="Senha"
          renderInput={(field) => (
            <PasswordInput {...field} autoComplete="current-password" />
          )}
        />
        <SubmitButton
          size="lg"
          className="w-full"
          isLoading={formState.isSubmitting || isLeaving}
          loadingLabel="Entrando…"
        >
          Entrar
        </SubmitButton>
      </form>
      {/* UC03 FE01: the sign-up stays in sight after a failure. */}
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href={withNext("/register", next)}
          className="font-semibold text-link underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
