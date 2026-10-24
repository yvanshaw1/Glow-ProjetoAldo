"use client";

import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormFailure } from "@/hooks/use-form-failure";
import { apiRequest } from "@/lib/api-client";
import type { AdminCategory } from "@/shared/api/catalog";

// UC15, steps 3 to 6 and FA01 (docs/catalogo/servicos-do-painel.md): the
// window of a new or edited category, with its name and description. It does
// not close while the request runs (RNF005), and a failure, like the
// NOT_IMPLEMENTED of the demo, shows at its top with the focus (RNF003).

const CATEGORIES_PATH = "/api/admin/categories";
const REQUIRED_MESSAGE = "Preencha este campo.";

type CategoryFormValues = { name: string; description: string };

type CategoryFormDialogProps = {
  // The button that opens the window, as the `render` of the trigger.
  trigger: ReactElement;
  // The category being edited; none for a new one.
  category?: AdminCategory;
  onSaved: () => void;
};

export function CategoryFormDialog({
  trigger,
  category,
  onSaved,
}: CategoryFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, setError, reset } =
    useForm<CategoryFormValues>({
      mode: "onTouched",
      defaultValues: {
        name: category?.name ?? "",
        description: category?.description ?? "",
      },
    });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);

  function changeOpen(open: boolean) {
    if (isSubmitting) return;
    setIsOpen(open);
    if (!open) {
      // The window opens again with the data of the category, not with what
      // was typed and discarded.
      reset();
      clearFailure();
    }
  }

  async function submit(values: CategoryFormValues) {
    clearFailure();
    setIsSubmitting(true);
    try {
      await apiRequest(
        category ? `${CATEGORIES_PATH}/${category.id}` : CATEGORIES_PATH,
        {
          method: category ? "PATCH" : "POST",
          body: category
            ? { ...values, updatedAt: category.updatedAt }
            : values,
        },
      );
      setIsOpen(false);
      onSaved();
    } catch (error) {
      showFailure(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar categoria" : "Nova categoria"}
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
          <FormField
            control={control}
            name="name"
            label="Nome"
            rules={{
              validate: (name) => name.trim() !== "" || REQUIRED_MESSAGE,
            }}
            renderInput={(field) => (
              <Input {...field} placeholder="Ex.: Lavagem" autoComplete="off" />
            )}
          />
          <FormField
            control={control}
            name="description"
            label="Descrição"
            rules={{
              validate: (description) =>
                description.trim() !== "" || REQUIRED_MESSAGE,
            }}
            renderInput={(field) => (
              <Textarea {...field} placeholder="Descrição da categoria" />
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              focusableWhenDisabled
              onClick={() => changeOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton isLoading={isSubmitting} loadingLabel="Salvando…">
              Salvar
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
