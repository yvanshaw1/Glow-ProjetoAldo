"use client";

import { useRef, useState, type ReactElement, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// The window of the form of the panel, new or edited (docs/agendamento/
// agendamentos-do-painel.md): it does not close while the request runs, and
// the focus starts in "Cancelar" of the first step and returns to the button
// that opened it (RNF005).

type FormControls = {
  // "Cancelar" of the first step and the end of a send.
  close: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
};

type AppointmentFormDialogProps = {
  // The button that opens the window, as the `render` of the trigger.
  trigger: ReactElement;
  title: string;
  children: (controls: FormControls) => ReactNode;
};

export function AppointmentFormDialog({
  trigger,
  title,
  children,
}: AppointmentFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  function changeOpen(open: boolean) {
    if (isSubmitting) return;
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent
        ref={popupRef}
        className="sm:w-[calc(100%-3rem)] sm:max-w-3xl"
        showCloseButton={!isSubmitting}
        // The first step has "Cancelar", where the focus starts.
        initialFocus={() =>
          Array.from(popupRef.current?.querySelectorAll("button") ?? []).find(
            (button) => button.textContent === "Cancelar" && !button.disabled,
          ) ?? popupRef.current
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children({
          // Also after a send, which is still marked running when it ends.
          close: () => setIsOpen(false),
          setSubmitting: setIsSubmitting,
        })}
      </DialogContent>
    </Dialog>
  );
}
