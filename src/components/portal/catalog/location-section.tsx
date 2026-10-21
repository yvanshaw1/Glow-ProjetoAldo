import { CompanyLocation } from "@/components/portal/catalog/company-location";

// docs/catalogo/paginas-publicas.md, Localização: the title stays a server
// component; the address and the hours come from the API (RN028).
export function LocationSection() {
  return (
    <section
      aria-labelledby="home-location-title"
      className="mx-auto flex max-w-page flex-col gap-8 px-6 py-14 lg:px-8"
    >
      <h2 id="home-location-title" className="text-h3 font-bold md:text-h2">
        Onde estamos
      </h2>
      <CompanyLocation />
    </section>
  );
}
