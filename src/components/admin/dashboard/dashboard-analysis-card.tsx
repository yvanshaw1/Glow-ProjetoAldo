"use client";

import { LoaderCircleIcon, SparklesIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { Period } from "@/components/admin/dashboard/dashboard-period";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, toApiError } from "@/lib/api-client";
import type { DashboardAnalysis } from "@/shared/api/dashboard";
import { DASHBOARD_INDICATOR_LABELS } from "@/shared/constants/dashboard-indicators";
import { formatDateTime } from "@/shared/format/date";

const ANALYSIS_PATH = "/api/admin/dashboard/analysis";
// Places held for the text while the analysis is made, as three lines.
const LOADING_LINES = 3;

type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; analysis: DashboardAnalysis }
  | { status: "failed"; message: string };

type DashboardAnalysisCardProps = {
  // The period on the screen, which the analysis is about (UC27).
  period: Period;
  // False in a period with no appointments, which is not analysed (UC27 FE01).
  hasAppointments: boolean;
};

// UC27, RF089, RF090: the analysis of the period written by an AI service
// (docs/agendamento/dashboard-do-painel.md). The screen that shows it keys it
// by period, so another period takes it back to the start (UC27 FA02). It is
// asked for by the click and not by an effect, because it costs a call to the
// service: nothing asks for it twice. The button waits with aria-disabled and
// keeps the focus (docs/padroes/componentes.md, RNF005).
export function DashboardAnalysisCard({
  period,
  hasAppointments,
}: DashboardAnalysisCardProps) {
  const titleId = useId();
  const noDataId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  // The status region says when the analysis is ready.
  const [announcement, setAnnouncement] = useState("");

  // Leaving the screen, or the period, cancels the call on the way.
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function generate() {
    if (state.status === "loading") return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: "loading" });
    setAnnouncement("");
    // "Tentar novamente" goes away with the failure: the focus goes to the
    // button, which is already the one that has it when it was the one used.
    buttonRef.current?.focus();
    try {
      const analysis = await apiRequest<DashboardAnalysis>(ANALYSIS_PATH, {
        method: "POST",
        body: period,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setState({ status: "done", analysis });
      setAnnouncement("Análise gerada.");
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({ status: "failed", message: toApiError(error).message });
    }
  }

  const isLoading = state.status === "loading";
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-xl bg-background p-5 shadow-neu-md"
    >
      <div className="flex flex-col gap-1">
        <h2 id={titleId} className="flex items-center gap-2 font-semibold">
          <SparklesIcon aria-hidden className="text-link" />
          Análise do período
        </h2>
        <p className="text-sm text-muted-foreground">
          Um resumo em texto dos indicadores deste período, escrito por
          inteligência artificial a partir dos números do sistema.
        </p>
      </div>
      <div className="flex flex-col items-start gap-2">
        <Button
          ref={buttonRef}
          type="button"
          onClick={generate}
          disabled={isLoading || !hasAppointments}
          focusableWhenDisabled
          aria-describedby={hasAppointments ? undefined : noDataId}
        >
          {isLoading && (
            <LoaderCircleIcon aria-hidden className="animate-spin text-link" />
          )}
          {buttonLabel(state)}
        </Button>
        {!hasAppointments && (
          <p id={noDataId} className="text-sm text-muted-foreground">
            Não há dados suficientes no período para gerar a análise.
          </p>
        )}
      </div>
      <AnalysisContent state={state} onRetry={generate} />
      <div role="status" className="sr-only">
        {announcement}
      </div>
    </section>
  );
}

function buttonLabel(state: AnalysisState): string {
  if (state.status === "loading") return "Gerando análise…";
  return state.status === "done" ? "Gerar novamente" : "Gerar análise";
}

function AnalysisContent({
  state,
  onRetry,
}: {
  state: AnalysisState;
  onRetry: () => void;
}) {
  if (state.status === "loading") {
    return (
      <div aria-busy className="flex flex-col gap-2">
        {Array.from({ length: LOADING_LINES }, (_, index) => (
          <Skeleton key={index} className="h-5 rounded-md" />
        ))}
      </div>
    );
  }
  if (state.status === "failed") {
    // UC27 FE02: the indicators go on, and the analysis may be asked again.
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {state.message}
          <Button variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (state.status === "idle") return null;
  const { analysis } = state;
  // RS020: the text of the service is shown as text, never as HTML.
  return (
    <div className="flex flex-col gap-4">
      <p>{analysis.summary}</p>
      <ul className="flex flex-col gap-2">
        {analysis.highlights.map(({ indicator, comment }, index) => (
          <li key={`${indicator}-${index}`}>
            <span className="font-semibold">
              {DASHBOARD_INDICATOR_LABELS[indicator]}:
            </span>{" "}
            {comment}
          </li>
        ))}
      </ul>
      {/* UC27 FA03 */}
      {!analysis.hasComparison && (
        <p className="text-sm text-muted-foreground">
          O período anterior não tem agendamentos: a análise não compara os
          períodos.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Gerado por inteligência artificial em{" "}
        {formatDateTime(analysis.generatedAt)}. Pode conter imprecisões: os
        números oficiais são os dos indicadores.
      </p>
    </div>
  );
}
