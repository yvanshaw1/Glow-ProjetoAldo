import type { Metadata } from "next";
import { AppointmentTabs } from "@/components/portal/appointments/appointment-tabs";
import { DemoNotice } from "@/components/shared/demo-notice";

export const metadata: Metadata = { title: "Meus agendamentos – Glow" };

// UC07: the current appointments and the history of the client, in tabs
// (docs/agendamento/meus-agendamentos.md). The whole page has demo data
// (decision 0055).
export default function AppointmentsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-14 lg:px-8">
      <div className="flex flex-col gap-5">
        <h1 className="text-h3 font-bold md:text-h2">Meus agendamentos</h1>
        <DemoNotice />
      </div>
      <AppointmentTabs />
    </div>
  );
}
