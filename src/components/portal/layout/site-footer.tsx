import Link from "next/link";
import { CompanyFooterInfo } from "@/components/portal/layout/company-footer-info";
import { BrandLink } from "@/components/shared/brand-link";

// Footer of the portal (docs/padroes/layouts.md): the brand and the quick
// access are fixed; contact, address, social networks and the company name
// come from GET /api/public/company (RN028).
const QUICK_LINKS = [
  { href: "/services", label: "Serviços" },
  { href: "/booking", label: "Agendar" },
];

export function SiteFooter() {
  return (
    <footer className="bg-background shadow-neu-md">
      <CompanyFooterInfo
        brand={<BrandLink className="self-start" />}
        quickLinks={<QuickLinks />}
      />
    </footer>
  );
}

function QuickLinks() {
  return (
    <nav aria-labelledby="footer-quick-links">
      <h2
        id="footer-quick-links"
        className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase"
      >
        Acesso rápido
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {QUICK_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="rounded-lg text-link underline-offset-4 hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
