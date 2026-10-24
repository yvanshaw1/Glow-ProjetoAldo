"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ServiceActiveButton } from "@/components/admin/catalog/service-active-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest, type ApiError } from "@/lib/api-client";
import type { AdminServiceSummary } from "@/shared/api/catalog";
import { SERVICE_TYPE_LABELS } from "@/shared/constants/service-types";
import { formatCurrency } from "@/shared/format/currency";
import { formatDuration } from "@/shared/format/duration";

// UC14, steps 2 and 3 (docs/catalogo/servicos-do-painel.md): a service with
// its type, situation, duration and price, and the actions on it. A service
// of an inactive category stays on the panel, with a notice (RN031).

type ServiceCardProps = {
  service: AdminServiceSummary;
  onChange: () => void;
  onFailed: (error: ApiError) => void;
};

export function ServiceCard({ service, onChange, onFailed }: ServiceCardProps) {
  const { id, name, type, description, category, isActive } = service;
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-link">
          {SERVICE_TYPE_LABELS[type]}
        </Badge>
        {!isActive && (
          <Badge
            variant="outline"
            className="border-input text-muted-foreground"
          >
            Inativo
          </Badge>
        )}
      </div>
      <div>
        <h2 className="font-semibold">{name}</h2>
        {category && <p className="text-muted-foreground">{category.name}</p>}
      </div>
      {description && <p>{description}</p>}
      {service.isCategoryActive === false && (
        <p className="text-muted-foreground">
          Categoria inativa: oculto para o cliente
        </p>
      )}
      <p>
        <span className="text-muted-foreground">Duração:</span>{" "}
        {formatDuration(service.avgDurationMinutes)}
      </p>
      <p className="font-semibold">{formatPrice(service)}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <ServiceActiveButton
          id={id}
          isActive={isActive}
          updatedAt={service.updatedAt}
          onChanged={onChange}
          onFailed={onFailed}
        />
        <ConfirmDialog
          trigger={<Button variant="destructive">Excluir</Button>}
          title="Excluir este serviço?"
          description="O serviço deixa de ser exibido e não pode ser desfeito pelo painel. Os agendamentos em que ele consta são preservados."
          confirmLabel="Excluir serviço"
          loadingLabel="Excluindo…"
          cancelLabel="Voltar"
          isDestructive
          onConfirm={async () => {
            await apiRequest(`/api/admin/services/${id}`, {
              method: "DELETE",
            });
          }}
          onConfirmed={onChange}
        />
      </div>
    </article>
  );
}

// RN009: the fixed price, or the lowest of the prices by size.
function formatPrice({
  fixedPrice,
  startingPrice,
}: AdminServiceSummary): string {
  if (fixedPrice !== null) return formatCurrency(fixedPrice);
  if (startingPrice !== null) {
    return `A partir de ${formatCurrency(startingPrice)}`;
  }
  return "";
}
