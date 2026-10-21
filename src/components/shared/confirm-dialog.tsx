"use client";

import { LoaderCircleIcon } from "lucide-react";
import {
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
} from "react";
import { FormAlert } from "@/components/shared/form-alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toApiError, type ApiError } from "@/lib/api-client";

type ConfirmDialogProps = {
  // The button that opens the dialog; the focus goes back to it.
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  loadingLabel: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void>;
  onConfirmed?: () => void;
  // Where the focus goes when the trigger is gone, like after a deletion.
  finalFocus?: ComponentProps<typeof AlertDialogContent>["finalFocus"];
};

// A new key on every failure, so the notice takes the focus each time.
type Failure = { key: number; error: ApiError };

// docs/padroes/componentes.md, Diálogos: the focus starts on "Cancelar" and
// stays in the dialog until it closes (RNF005); while the action runs, the
// dialog does not close, and a failure shows inside it (RNF003, RNF004).
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  loadingLabel,
  isDestructive = false,
  onConfirm,
  onConfirmed,
  finalFocus,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  function changeOpen(open: boolean) {
    if (isRunning) return;
    setIsOpen(open);
    setFailure(null);
  }

  async function confirm() {
    setIsRunning(true);
    setFailure(null);
    try {
      await onConfirm();
      setIsOpen(false);
      onConfirmed?.();
    } catch (error) {
      setFailure((current) => ({
        key: (current?.key ?? 0) + 1,
        error: toApiError(error),
      }));
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={changeOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent initialFocus={cancelRef} finalFocus={finalFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {failure && (
          <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef} disabled={isRunning}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            disabled={isRunning}
            focusableWhenDisabled
            onClick={() => void confirm()}
            className="aria-disabled:cursor-progress aria-disabled:opacity-70"
          >
            {isRunning && (
              <LoaderCircleIcon
                aria-hidden
                className="animate-spin text-link"
              />
            )}
            {isRunning ? loadingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
