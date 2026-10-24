"use client";

import { AppointmentList } from "@/components/admin/appointments/appointment-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  APPOINTMENT_VIEW_LABELS,
  APPOINTMENT_VIEWS,
  type AppointmentView,
} from "@/shared/constants/appointment-views";

// UC10, steps 2 to 4 and RF044 (docs/agendamento/agendamentos-do-painel.md):
// the three views of the listing, each with the description of what it holds
// and its message when empty (FE01).

type ViewTexts = {
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

const VIEW_TEXTS = {
  today: {
    description:
      "Agendamentos de hoje e de dias anteriores que ainda não foram concluídos nem cancelados.",
    emptyTitle: "Nenhum agendamento para hoje",
    emptyDescription:
      "Os agendamentos de hoje e os de dias anteriores ainda em aberto aparecem aqui.",
  },
  future: {
    description: "Agendamentos marcados para os próximos dias.",
    emptyTitle: "Nenhum agendamento futuro",
    emptyDescription:
      "Os agendamentos marcados para os próximos dias aparecem aqui.",
  },
  history: {
    description: "Agendamentos concluídos, cancelados e reagendados.",
    emptyTitle: "Nenhum agendamento no histórico",
    emptyDescription:
      "Os agendamentos concluídos, cancelados e reagendados aparecem aqui.",
  },
} as const satisfies Record<AppointmentView, ViewTexts>;

export function AppointmentViews() {
  const [firstView] = APPOINTMENT_VIEWS;
  return (
    <Tabs defaultValue={firstView} className="gap-6">
      <TabsList className="w-full md:w-fit">
        {APPOINTMENT_VIEWS.map((view) => (
          <TabsTrigger key={view} value={view}>
            {APPOINTMENT_VIEW_LABELS[view]}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Each tab mounts its list when chosen, so it reads the route again
          and starts with no search or filter. The cards have their own
          buttons, so the panel takes no focus stop of its own. */}
      {APPOINTMENT_VIEWS.map((view) => (
        <TabsContent
          key={view}
          value={view}
          tabIndex={-1}
          className="flex flex-col gap-5"
        >
          <p className="text-muted-foreground">
            {VIEW_TEXTS[view].description}
          </p>
          <AppointmentList
            view={view}
            emptyTitle={VIEW_TEXTS[view].emptyTitle}
            emptyDescription={VIEW_TEXTS[view].emptyDescription}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
