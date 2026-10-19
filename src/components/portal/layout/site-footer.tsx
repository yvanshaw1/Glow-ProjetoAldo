import Link from "next/link";
import { BrandLink } from "@/components/shared/brand-link";

// Contact, address, social networks and the company name come from
// GET /api/public/company (RN028), with the task of that route (UC01).
const QUICK_LINKS = [
  { href: "/services", label: "Serviços" },
  { href: "/booking", label: "Agendar" },
];

export function SiteFooter() {
  return (
    <footer className="bg-background shadow-neu-md">
      <div className="mx-auto flex max-w-page flex-col gap-8 px-6 py-22 md:flex-row md:justify-between lg:px-8">
        <BrandLink className="self-start" />
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
      </div>
    </footer>
  );
}
