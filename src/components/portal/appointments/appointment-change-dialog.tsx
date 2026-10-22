"use client";

import { useRef, useState } from "react";
import {
  BookingWizard,
  type BookingChangeMode,
} from "@/components/portal/appointments/booking-wizard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ClientAppointment } from "@/shared/api/appointments";

const LABELS = {
  edit: { action: "Editar", title: "Editar agendamento" },
  reschedule: { action: "Reagendar", title: "Reagendar serviço" },
};

type AppointmentChangeDialogProps = {
  mode: BookingChangeMode;
  appointment: ClientAppointment;
  canOpen: boolean;
  onChanged: () => void;
  onReloaded: (appointment: ClientAppointment) => void;
};

// UC25/UC26: a nested dialog, so cancel returns to the detail. Keep the
// dialog mounted when a conflict reload changes the status and hides its
// trigger: the client must still read the notice and close it.
export function AppointmentChangeDialog({
  mode,
  appointment,
  canOpen,
  onChanged,
  onReloaded,
}: AppointmentChangeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const labels = LABELS[mode];

  function changeOpen(open: boolean) {
    if (isSubmitting || (open && !canOpen)) return;
    setIsOpen(open);
  }

  function changed() {
    setIsOpen(false);
    onChanged();
  }

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button variant="secondary" hidden={!canOpen} />}>
        {labels.action}
      </DialogTrigger>
      <DialogContent
        ref={popupRef}
        className="sm:w-[calc(100%-3rem)] sm:max-w-3xl"
        showCloseButton={!isSubmitting}
        initialFocus={() =>
          Array.from(popupRef.current?.querySelectorAll("button") ?? []).find(
            (button) => button.textContent === "Cancelar" && !button.disabled,
          ) ?? popupRef.current
        }
      >
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
        </DialogHeader>
        <BookingWizard
          mode={mode}
          appointment={appointment}
          onCancel={() => changeOpen(false)}
          onChanged={changed}
          onReloaded={onReloaded}
          onSubmittingChange={setIsSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
