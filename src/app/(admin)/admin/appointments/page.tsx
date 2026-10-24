import type { Metadata } from "next";
import { AppointmentViews } from "@/components/admin/appointments/appointment-views";
import { DemoNotice } from "@/components/shared/demo-notice";
import { PERMISSION_LABELS } from "@/shared/constants/permissions";

export const metadata: Metadata = { title: "Agendamentos – Glow" };

// UC10: the appointments of the panel, with the data of src/lib/demo/ until
// the routes exist (decision 0055).
export default function AppointmentsPage() {
  return (
    <>
      <h1 className="text-h3 font-bold md:text-h2">
        {PERMISSION_LABELS.appointments}
      </h1>
      <DemoNotice />
      <AppointmentViews />
    </>
  );
}
