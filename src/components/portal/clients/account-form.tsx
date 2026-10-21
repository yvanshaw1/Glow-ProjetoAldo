"use client";

import { CircleCheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DemoNotice } from "@/components/shared/demo-notice";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { useFormFailure } from "@/hooks/use-form-failure";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { ClientProfile } from "@/shared/api/clients";
import { formatPhone } from "@/shared/format/phone";

// UC04: the account data of the client (docs/clientes/area-do-cliente.md).
// The e-mail is shown, but the route does not take it. With the demo data,
// the form has no validation schema yet (decision 0055).

const PROFILE_PATH = "/api/me/profile";
const FIELD_COUNT = 4;

type AccountFormValues = Omit<ClientProfile, "phone"> & {
  // With the mask, as typed.
  phone: string;
};

function toFormValues(profile: ClientProfile): AccountFormValues {
  return { ...profile, phone: formatPhone(profile.phone) };
}

export function AccountSection() {
  return (
    <section
      aria-labelledby="account-title"
      className="flex flex-col gap-5 rounded-xl bg-background p-5 shadow-neu-md md:p-8"
    >
      <h2 id="account-title" className="font-semibold">
        Dados da conta
      </h2>
      <DemoNotice />
      <AccountData />
    </section>
  );
}

function AccountData() {
  const { data, error, reload } = useApiQuery<ClientProfile>(PROFILE_PATH);
  if (data !== null) {
    return <AccountForm profile={data} onConflict={reload} />;
  }
  // RNF004: the place of the fields while loading; a failure offers a retry.
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {error.message}
          <Button variant="secondary" onClick={reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div aria-busy className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: FIELD_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-17 rounded-xl" />
      ))}
    </div>
  );
}

type AccountFormProps = {
  profile: ClientProfile;
  onConflict: () => void;
};

function AccountForm({ profile, onConflict }: AccountFormProps) {
  const { control, handleSubmit, setError, reset, formState } =
    useForm<AccountFormValues>({ defaultValues: toFormValues(profile) });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);
  const [isSaved, setIsSaved] = useState(false);

  // RNF011: after a version conflict the record is read again, and its
  // current data replaces what was typed.
  useEffect(() => {
    reset(toFormValues(profile));
  }, [profile, reset]);

  function clearNotices() {
    clearFailure();
    setIsSaved(false);
  }

  async function submit({
    firstName,
    lastName,
    phone,
    updatedAt,
  }: AccountFormValues) {
    clearNotices();
    try {
      const saved = await apiRequest<ClientProfile>(PROFILE_PATH, {
        method: "PATCH",
        body: { firstName, lastName, phone, updatedAt },
      });
      reset(toFormValues(saved));
      setIsSaved(true);
    } catch (error) {
      showFailure(error);
      if (error instanceof ApiError && error.code === "VERSION_CONFLICT") {
        onConflict();
      }
    }
  }

  return (
    <div>
      {/* RNF004: a polite status, present before the notice appears, so the
          screen reader hears it without the focus leaving the button. */}
      <div role="status">
        {isSaved && (
          <Alert role="none" className="mb-6">
            <CircleCheckIcon aria-hidden />
            <AlertDescription>Dados da conta salvos.</AlertDescription>
          </Alert>
        )}
      </div>
      {failure && (
        <div className="mb-6">
          <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
        </div>
      )}
      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        onChange={() => setIsSaved(false)}
        className="flex flex-col gap-5"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={control}
            name="firstName"
            label="Nome"
            renderInput={(field) => (
              <Input {...field} autoComplete="given-name" />
            )}
          />
          <FormField
            control={control}
            name="lastName"
            label="Sobrenome"
            renderInput={(field) => (
              <Input {...field} autoComplete="family-name" />
            )}
          />
          <FormField
            control={control}
            name="email"
            label="E-mail"
            description="O e-mail de acesso não pode ser alterado."
            renderInput={(field) => (
              <Input
                {...field}
                type="email"
                readOnly
                className="text-muted-foreground"
              />
            )}
          />
          <FormField
            control={control}
            name="phone"
            label="Celular"
            description="Com DDD, como (82) 99999-8888."
            renderInput={(field) => (
              <Input
                {...field}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                onChange={(event) =>
                  field.onChange(formatPhone(event.target.value))
                }
              />
            )}
          />
        </div>
        <SubmitButton
          isLoading={formState.isSubmitting}
          loadingLabel="Salvando…"
          className="w-full sm:w-auto sm:self-end"
        >
          Salvar alterações
        </SubmitButton>
      </form>
    </div>
  );
}
