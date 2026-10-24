"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import {
  EmailField,
  InitialPasswordField,
  NameFields,
  PhoneField,
  type ClientFormValues,
} from "@/components/admin/clients/client-fields";
import { FormAlert } from "@/components/shared/form-alert";
import { SubmitButton } from "@/components/shared/submit-button";
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
import { ApiError, apiRequest } from "@/lib/api-client";
import type { AdminClient } from "@/shared/api/clients";
import { formatPhone } from "@/shared/format/phone";

// UC16 and UC17 steps 6 and 7 (docs/clientes/clientes-do-painel.md): the
// window of a new or edited client. It does not close while the request runs
// (RNF005), and a failure, like the NOT_IMPLEMENTED of the demo, shows at its
// top with the focus (RNF003).

const CLIENTS_PATH = "/api/admin/clients";

const EMPTY_VALUES: ClientFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
};

function toFormValues(client?: AdminClient): ClientFormValues {
  if (!client) return EMPTY_VALUES;
  const { email, firstName, lastName, phone } = client;
  return {
    email,
    firstName,
    lastName,
    phone: formatPhone(phone),
    password: "",
  };
}

type ClientFormDialogProps = {
  // The button that opens the window, as the `render` of the trigger.
  trigger: ReactElement;
  // The client being edited; none for a new one.
  client?: AdminClient;
  onSaved: () => void;
  // RNF011: the client changed meanwhile, so it is read again.
  onConflict?: () => void;
};

export function ClientFormDialog({
  trigger,
  client,
  onSaved,
  onConflict,
}: ClientFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { control, handleSubmit, setError, reset, formState } =
    useForm<ClientFormValues>({
      mode: "onTouched",
      defaultValues: toFormValues(client),
    });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);

  // After a version conflict the client is read again, and its current data
  // replaces what was typed.
  useEffect(() => {
    reset(toFormValues(client));
  }, [client, reset]);

  // docs/padroes/componentes.md, Diálogos: the dialog does not close during
  // the call. Each opening starts from the data of the client.
  function changeOpen(open: boolean) {
    if (formState.isSubmitting) return;
    if (open) {
      reset(toFormValues(client));
      clearFailure();
    }
    setIsOpen(open);
  }

  async function submit({
    email,
    firstName,
    lastName,
    phone,
    password,
  }: ClientFormValues) {
    clearFailure();
    try {
      if (client) {
        await apiRequest<AdminClient>(`${CLIENTS_PATH}/${client.id}`, {
          method: "PATCH",
          body: { firstName, lastName, phone, updatedAt: client.updatedAt },
        });
      } else {
        await apiRequest<AdminClient>(CLIENTS_PATH, {
          method: "POST",
          body: { email, firstName, lastName, phone, password },
        });
      }
      setIsOpen(false);
      onSaved();
    } catch (error) {
      showFailure(error);
      if (error instanceof ApiError && error.code === "VERSION_CONFLICT") {
        onConflict?.();
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent showCloseButton={!formState.isSubmitting}>
        <DialogHeader>
          <DialogTitle>
            {client ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
        </DialogHeader>
        {failure && (
          <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
        )}
        <form
          noValidate
          onSubmit={handleSubmit(submit, clearFailure)}
          className="flex flex-col gap-5"
        >
          <EmailField control={control} isReadOnly={client !== undefined} />
          <NameFields control={control} />
          <PhoneField control={control} />
          {!client && <InitialPasswordField control={control} />}
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
              loadingLabel={client ? "Salvando…" : "Cadastrando…"}
            >
              {client ? "Salvar alterações" : "Cadastrar cliente"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
