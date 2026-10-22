"use client";

import { AppointmentList } from "@/components/portal/appointments/appointment-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppointmentScope } from "@/shared/api/appointments";

// UC07, steps 2 to 4 (docs/agendamento/meus-agendamentos.md): the current
// appointments and the history, each with its message when empty (FE01).

type AppointmentTab = {
  scope: AppointmentScope;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
};

const APPOINTMENT_TABS: AppointmentTab[] = [
  {
    scope: "current",
    label: "Atuais",
    emptyTitle: "Nenhum agendamento atual",
    emptyDescription: "Os seus próximos agendamentos aparecem aqui.",
  },
  {
    scope: "history",
    label: "Histórico",
    emptyTitle: "Nenhum agendamento no histórico",
    emptyDescription:
      "Os agendamentos concluídos, cancelados e reagendados aparecem aqui.",
  },
];

export function AppointmentTabs() {
  const [firstTab] = APPOINTMENT_TABS;
  return (
    <Tabs defaultValue={firstTab.scope} className="gap-6">
      <TabsList className="w-full">
        {APPOINTMENT_TABS.map(({ scope, label }) => (
          <TabsTrigger key={scope} value={scope}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Each tab mounts its list when chosen, so it reads the route again:
          a cancelled appointment shows in the history. The cards have their
          own buttons, so the panel takes no focus stop of its own. */}
      {APPOINTMENT_TABS.map(({ scope, emptyTitle, emptyDescription }) => (
        <TabsContent key={scope} value={scope} tabIndex={-1}>
          <AppointmentList
            scope={scope}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
