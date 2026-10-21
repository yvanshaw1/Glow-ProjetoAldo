import type { Metadata } from "next";
import { ServiceCatalog } from "@/components/portal/catalog/service-catalog";
import { DemoNotice } from "@/components/shared/demo-notice";

export const metadata: Metadata = { title: "Serviços – Glow" };

// UC01, steps 3 and 4: the catalog of active services, with the demo data
// until #48 builds its routes (decision 0055).
export default function ServicesPage() {
  return (
    <div className="mx-auto flex max-w-page flex-col gap-8 px-6 py-14 lg:px-8">
      <div className="flex flex-col gap-5">
        <h1 className="text-h3 font-bold md:text-h2">Serviços</h1>
        <DemoNotice />
        <p className="text-muted-foreground">
          Conheça os serviços disponíveis e filtre por categoria.
        </p>
      </div>
      <ServiceCatalog />
    </div>
  );
}
