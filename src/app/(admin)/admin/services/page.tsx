import type { Metadata } from "next";
import { CatalogTabs } from "@/components/admin/catalog/catalog-tabs";
import { DemoNotice } from "@/components/shared/demo-notice";
import { PERMISSION_LABELS } from "@/shared/constants/permissions";

export const metadata: Metadata = { title: "Serviços – Glow" };

// UC13 to UC15: the services and the categories of the panel, with the data
// of src/lib/demo/ until the routes exist (decision 0055).
export default function ServicesPage() {
  return (
    <>
      <h1 className="text-h3 font-bold md:text-h2">
        {PERMISSION_LABELS.services}
      </h1>
      <DemoNotice />
      <CatalogTabs />
    </>
  );
}
