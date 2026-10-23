import type { Metadata } from "next";
import { DashboardView } from "@/components/admin/dashboard/dashboard-view";
import { DemoNotice } from "@/components/shared/demo-notice";
import { PERMISSION_LABELS } from "@/shared/constants/permissions";

export const metadata: Metadata = { title: "Dashboard – Glow" };

// UC09: the dashboard, with the data of src/lib/demo/ until the route exists
// (decision 0055).
export default function DashboardPage() {
  return (
    <>
      <h1 className="text-h3 font-bold md:text-h2">
        {PERMISSION_LABELS.dashboard}
      </h1>
      <DemoNotice />
      <DashboardView />
    </>
  );
}
