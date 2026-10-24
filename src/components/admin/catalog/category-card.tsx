"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CategoryFormDialog } from "@/components/admin/catalog/category-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import type { AdminCategory } from "@/shared/api/catalog";

// UC15, steps 2 and FA01 to FA03 (docs/catalogo/servicos-do-painel.md): a
// category with its situation, and the edit, deactivation and reactivation,
// the last two confirmed (RN031). A category is never deleted (RN030).

type CategoryCardProps = {
  category: AdminCategory;
  onChange: () => void;
};

export function CategoryCard({ category, onChange }: CategoryCardProps) {
  const { id, name, description, isActive, updatedAt } = category;
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold">{name}</h2>
        <Badge
          variant={isActive ? "secondary" : "outline"}
          className={
            isActive ? "text-link" : "border-input text-muted-foreground"
          }
        >
          {isActive ? "Ativa" : "Inativa"}
        </Badge>
      </div>
      <p className="text-muted-foreground">{description}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <CategoryFormDialog
          category={category}
          onSaved={onChange}
          trigger={<Button variant="outline">Editar</Button>}
        />
        <ConfirmDialog
          trigger={
            <Button variant="outline">
              {isActive ? "Desativar" : "Reativar"}
            </Button>
          }
          title={
            isActive ? "Desativar esta categoria?" : "Reativar esta categoria?"
          }
          description={
            isActive
              ? "Os serviços dela deixam de aparecer no portal e no agendamento, mas continuam no painel. Você pode reativá-la depois."
              : "Os serviços dela voltam a aparecer no portal e no agendamento."
          }
          confirmLabel={isActive ? "Desativar categoria" : "Reativar categoria"}
          loadingLabel={isActive ? "Desativando…" : "Reativando…"}
          cancelLabel="Voltar"
          onConfirm={async () => {
            await apiRequest(`/api/admin/categories/${id}`, {
              method: "PATCH",
              body: { isActive: !isActive, updatedAt },
            });
          }}
          onConfirmed={onChange}
        />
      </div>
    </article>
  );
}
