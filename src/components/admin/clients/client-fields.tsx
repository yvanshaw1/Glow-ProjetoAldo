"use client";

import type { Control } from "react-hook-form";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/shared/format/phone";

// The fields of the client forms (docs/clientes/clientes-do-painel.md), shared
// by the new and the edit windows. With the demo data the forms have no
// validation schema yet (decision 0055), so only the empty fields are
// checked.

export type ClientFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  // With the mask, as typed (RN035).
  phone: string;
  // Only in the register: the account of the edit keeps its password.
  password: string;
};

type ClientFieldsProps = {
  control: Control<ClientFormValues>;
};

const REQUIRED_MESSAGE = "Preencha este campo.";

function isFilled(value: string): true | string {
  return value.trim() !== "" || REQUIRED_MESSAGE;
}

// UC17 step 6: the e-mail is shown, not edited.
export function EmailField({
  control,
  isReadOnly = false,
}: ClientFieldsProps & { isReadOnly?: boolean }) {
  return (
    <FormField
      control={control}
      name="email"
      label="E-mail"
      description={
        isReadOnly ? "O e-mail de acesso não pode ser alterado." : undefined
      }
      rules={{ validate: isFilled }}
      renderInput={(field) => (
        <Input
          {...field}
          type="email"
          readOnly={isReadOnly}
          autoComplete="off"
          spellCheck={false}
          className={isReadOnly ? "text-muted-foreground" : undefined}
        />
      )}
    />
  );
}

// The names two by line, as the fields of the vehicle.
export function NameFields({ control }: ClientFieldsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField
        control={control}
        name="firstName"
        label="Nome"
        rules={{ validate: isFilled }}
        renderInput={(field) => <Input {...field} autoComplete="off" />}
      />
      <FormField
        control={control}
        name="lastName"
        label="Sobrenome"
        rules={{ validate: isFilled }}
        renderInput={(field) => <Input {...field} autoComplete="off" />}
      />
    </div>
  );
}

export function PhoneField({ control }: ClientFieldsProps) {
  return (
    <FormField
      control={control}
      name="phone"
      label="Celular"
      description="Com DDD, como (82) 99999-8888."
      rules={{ validate: isFilled }}
      renderInput={(field) => (
        <Input
          {...field}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          onChange={(event) => field.onChange(formatPhone(event.target.value))}
        />
      )}
    />
  );
}

// UC16 step 3 and RN023: the password the client signs in with, changed at
// the first access.
export function InitialPasswordField({ control }: ClientFieldsProps) {
  return (
    <FormField
      control={control}
      name="password"
      label="Senha inicial"
      description="De 8 a 72 caracteres, com letra maiúscula, número e caractere especial. O cliente troca a senha no primeiro acesso."
      rules={{ validate: isFilled }}
      renderInput={(field) => (
        <PasswordInput {...field} autoComplete="new-password" />
      )}
    />
  );
}
