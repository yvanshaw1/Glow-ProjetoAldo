import { ClientDetailsDialog } from "@/components/admin/clients/client-details-dialog";
import type { AdminClient } from "@/shared/api/clients";
import { formatPhone } from "@/shared/format/phone";

// UC17 step 3 (docs/clientes/clientes-do-painel.md): the name, the e-mail and
// the phone of a client, and the button of the details.

type ClientCardProps = {
  client: AdminClient;
  onChange: () => void;
};

export function ClientCard({ client, onChange }: ClientCardProps) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="font-semibold">
          {client.firstName} {client.lastName}
        </h2>
        <p className="break-words text-muted-foreground">{client.email}</p>
        <p className="text-muted-foreground">{formatPhone(client.phone)}</p>
      </div>
      <ClientDetailsDialog client={client} onChange={onChange} />
    </article>
  );
}
