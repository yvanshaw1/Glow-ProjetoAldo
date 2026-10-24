"use client";

import { ImageIcon } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent } from "react";
import { useController } from "react-hook-form";
import type { ServiceFormValues } from "@/components/admin/catalog/service-form-values";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldLabel } from "@/components/ui/field";

// UC13 step 4 and FE02 (docs/catalogo/servicos-do-painel.md): the choice of
// the image with its preview. The type and the size are checked here only to
// guide: the route checks the real file (RS015, #47). Nothing is sent.

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;
const INVALID_MESSAGE = "Use uma imagem JPEG, PNG ou WebP de até 2 MB.";

export function ServiceImageField() {
  const { field } = useController<ServiceFormValues, "image">({
    name: "image",
  });
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  // The image chosen, with the local address of its preview, which the form
  // keeps so that coming back to the step shows it again.
  const image = field.value;

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // The same file can be chosen again after a removal.
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
      setMessage(INVALID_MESSAGE);
      return;
    }
    setMessage(null);
    if (image) URL.revokeObjectURL(image.previewUrl);
    field.onChange({ file, previewUrl: URL.createObjectURL(file) });
  }

  function remove() {
    setMessage(null);
    if (image) URL.revokeObjectURL(image.previewUrl);
    field.onChange(null);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={inputId}>Imagem (opcional)</FieldLabel>
      {/* The input is the keyboard stop; the button below opens its picker. */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={choose}
        onBlur={field.onBlur}
        aria-describedby={message ? `${helpId} ${errorId}` : helpId}
        aria-invalid={message !== null}
        className="block w-full text-sm file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-semibold file:text-secondary-foreground file:shadow-neu-sm"
      />
      <FieldDescription id={helpId}>
        JPEG, PNG ou WebP, até 2 MB.
      </FieldDescription>
      {message && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      {image && (
        <div className="flex flex-col items-start gap-3">
          <div className="aspect-[4/3] w-full max-w-xs overflow-hidden rounded-xl bg-muted shadow-neu-sm">
            {/* A local blob address, which next/image does not optimize. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.previewUrl}
              alt="Prévia da imagem escolhida"
              width={320}
              height={240}
              className="size-full object-cover"
            />
          </div>
          <Button type="button" variant="outline" onClick={remove}>
            <ImageIcon aria-hidden />
            Remover imagem
          </Button>
        </div>
      )}
    </div>
  );
}
