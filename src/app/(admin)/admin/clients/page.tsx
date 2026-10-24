import type { Metadata } from "next";
import { ClientList } from "@/components/admin/clients/client-list";
import { DemoNotice } from "@/components/shared/demo-notice";
import { PERMISSION_LABELS } from "@/shared/constants/permissions";

export const metadata: Metadata = { title: "Clientes – Glow" };

// UC17: the clients and their vehicles in the panel, with the data of
// src/lib/demo/ until the routes exist (decision 0055).
export default function ClientsPage() {
  return (
    <>
      <h1 className="text-h3 font-bold md:text-h2">
        {PERMISSION_LABELS.clients}
      </h1>
      <DemoNotice />
      <ClientList />
    </>
  );
}
