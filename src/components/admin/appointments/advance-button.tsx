"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest, toApiError, type ApiError } from "@/lib/api-client";

// UC12, steps 2 to 5 (docs/agendamento/agendamentos-do-painel.md): the move to
// the next status, with no confirmation. The button keeps the focus while the
// call runs (RNF004, RNF005), and a failure goes to the dialog that holds it.

const APPOINTMENTS_PATH = "/api/admin/appointments";

type AdvanceButtonProps = {
  id: string;
  label: string;
  onAdvanced: () => void;
  onFailed: (error: ApiError) => void;
};

export function AdvanceButton({
  id,
  label,
  onAdvanced,
  onFailed,
}: AdvanceButtonProps) {
  const [isRunning, setIsRunning] = useState(false);

  async function advance() {
    setIsRunning(true);
    try {
      await apiRequest(`${APPOINTMENTS_PATH}/${id}/advance`, {
        method: "POST",
      });
      onAdvanced();
    } catch (error) {
      onFailed(toApiError(error));
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Button
      disabled={isRunning}
      focusableWhenDisabled
      onClick={() => void advance()}
      className="aria-disabled:cursor-progress aria-disabled:opacity-70"
    >
      {isRunning && (
        <LoaderCircleIcon aria-hidden className="animate-spin text-link" />
      )}
      {isRunning ? "Avançando…" : label}
    </Button>
  );
}
