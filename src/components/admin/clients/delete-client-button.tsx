"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

// UC17 FA01 (docs/clientes/clientes-do-painel.md): the account is deleted
// after a confirmation; the vehicles and the appointments are kept (RN030).

type DeleteClientButtonProps = {
  id: string;
  onDeleted: () => void;
};

export function DeleteClientButton({ id, onDeleted }: DeleteClientButtonProps) {
  return (
    <ConfirmDialog
      trigger={<Button variant="destructive">Excluir conta</Button>}
      title="Excluir esta conta?"
      description="A conta deixa de ser exibida e perde o acesso ao sistema. Os veículos e os agendamentos do cliente são preservados."
      confirmLabel="Excluir conta"
      loadingLabel="Excluindo…"
      cancelLabel="Voltar"
      isDestructive
      onConfirm={async () => {
        await apiRequest(`/api/admin/clients/${id}`, { method: "DELETE" });
      }}
      onConfirmed={onDeleted}
    />
  );
}
