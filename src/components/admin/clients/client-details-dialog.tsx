"use client";

import { useState, type ReactNode } from "react";
import { ClientFormDialog } from "@/components/admin/clients/client-form-dialog";
import { DeleteClientButton } from "@/components/admin/clients/delete-client-button";
import { ClientVehicleList } from "@/components/admin/vehicles/client-vehicle-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import type { AdminClient } from "@/shared/api/clients";
import { formatPhone } from "@/shared/format/phone";

// UC17 steps 4 and 5 (docs/clientes/clientes-do-painel.md): the account and
// the vehicles of the client, read when the dialog opens, and the actions on
// the account.

const CLIENTS_PATH = "/api/admin/clients";

// Rows held while the client loads.
const LOADING_ROWS = 3;

type ClientDetailsDialogProps = {
  client: AdminClient;
  onChange: () => void;
};

export function ClientDetailsDialog({
  client,
  onChange,
}: ClientDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // UC17 FA01: once the account is deleted, the dialog closes and the list
  // is read again.
  function closeChanged() {
    setIsOpen(false);
    onChange();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="secondary"
            className="w-full sm:w-auto sm:self-center"
          />
        }
      >
        Ver detalhes
        {/* Each card has one: the name of the client tells them apart. */}
        <span className="sr-only">
          {" "}
          de {client.firstName} {client.lastName}
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do cliente</DialogTitle>
        </DialogHeader>
        <ClientDetails
          id={client.id}
          onDeleted={closeChanged}
          onChange={onChange}
        />
      </DialogContent>
    </Dialog>
  );
}

type ClientDetailsProps = {
  id: string;
  onDeleted: () => void;
  // The account was edited: the list is read again, the dialog stays.
  onChange: () => void;
};

// Mounted with the dialog, so each opening reads the route again.
function ClientDetails({ id, onDeleted, onChange }: ClientDetailsProps) {
  const { data, error, reload } = useApiQuery<AdminClient>(
    `${CLIENTS_PATH}/${id}`,
  );
  if (data !== null) {
    return (
      <ClientContent
        client={data}
        reload={reload}
        onDeleted={onDeleted}
        onChange={onChange}
      />
    );
  }
  // RNF004: the place of the detail while loading; a failure offers a retry.
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
    <div aria-busy className="flex flex-col gap-4">
      {Array.from({ length: LOADING_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

type ClientContentProps = {
  client: AdminClient;
  reload: () => void;
  onDeleted: () => void;
  onChange: () => void;
};

function ClientContent({
  client,
  reload,
  onDeleted,
  onChange,
}: ClientContentProps) {
  return (
    <>
      <div className="flex flex-col gap-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem term="Nome">
            {client.firstName} {client.lastName}
          </DetailItem>
          <DetailItem term="Telefone">{formatPhone(client.phone)}</DetailItem>
          <DetailItem term="E-mail" className="sm:col-span-2">
            <span className="break-words">{client.email}</span>
          </DetailItem>
        </dl>
        <section
          aria-labelledby="client-vehicles-title"
          className="flex flex-col gap-4"
        >
          <h3 id="client-vehicles-title" className="font-semibold">
            Veículos
          </h3>
          <ClientVehicleList clientId={client.id} />
        </section>
      </div>
      <DialogFooter>
        {/* A nested window, so "Cancelar" and Esc return to the details. */}
        <ClientFormDialog
          trigger={<Button variant="secondary">Editar dados</Button>}
          client={client}
          onSaved={() => {
            reload();
            onChange();
          }}
          onConflict={reload}
        />
        <DeleteClientButton id={client.id} onDeleted={onDeleted} />
      </DialogFooter>
    </>
  );
}

type DetailItemProps = {
  term: string;
  className?: string;
  children: ReactNode;
};

function DetailItem({ term, className, children }: DetailItemProps) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}
