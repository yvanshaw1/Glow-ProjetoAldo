import type { Metadata } from "next";
import { BookingWizard } from "@/components/portal/appointments/booking-wizard";
import { DemoNotice } from "@/components/shared/demo-notice";

export const metadata: Metadata = { title: "Agendar serviço – Glow" };

// UC06: the booking in steps (docs/agendamento/agendar-servico.md). The whole
// page has demo data (decision 0055).
export default function BookingPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14 lg:px-8">
      <div className="flex flex-col gap-5">
        <h1 className="text-h3 font-bold md:text-h2">Agendar serviço</h1>
        <DemoNotice />
      </div>
      <BookingWizard />
    </div>
  );
}
