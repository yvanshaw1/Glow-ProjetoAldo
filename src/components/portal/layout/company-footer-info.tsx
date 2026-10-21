"use client";

import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import type { PublicCompany } from "@/shared/api/settings";
import { formatYear } from "@/shared/format/date";
import {
  formatPhone,
  formatPhoneLink,
  formatWhatsAppLink,
} from "@/shared/format/phone";

// The company data of the portal footer (docs/padroes/layouts.md), always the
// one saved on the panel (RN028). An empty field is not shown, nor a block
// without any field. The brand and the quick access stay server components.

const COMPANY_PATH = "/api/public/company";

const HEADING_CLASS =
  "text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase";
const LINK_CLASS = "rounded-lg text-link underline-offset-4 hover:underline";
const ICON_LINK_CLASS = `${LINK_CLASS} flex items-center gap-1`;

type CompanyFooterInfoProps = {
  brand: ReactNode;
  quickLinks: ReactNode;
};

export function CompanyFooterInfo({
  brand,
  quickLinks,
}: CompanyFooterInfoProps) {
  const {
    data: company,
    error,
    reload,
  } = useApiQuery<PublicCompany>(COMPANY_PATH);
  return (
    <div className="mx-auto flex max-w-page flex-col gap-8 px-6 py-22 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {brand}
        {error ? (
          // UC01 FE02: the message and a new try in place of the data.
          <Alert variant="destructive" className="self-start lg:col-span-2">
            <AlertDescription className="flex flex-col items-start gap-3">
              {error.message}
              <Button variant="secondary" onClick={reload}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        ) : company ? (
          <>
            <ContactBlock company={company} />
            <SocialBlock company={company} />
          </>
        ) : (
          <>
            <BlockPlaceholder />
            <BlockPlaceholder />
          </>
        )}
        {quickLinks}
      </div>
      {!error && (
        <div className="border-t border-border pt-8">
          {company ? (
            <p className="text-xs text-muted-foreground">
              © {formatYear(new Date().toISOString())} {company.companyName}.
              Todos os direitos reservados.
            </p>
          ) : (
            <Skeleton aria-hidden className="h-4.5 w-72 max-w-full" />
          )}
        </div>
      )}
    </div>
  );
}

// RNF006: the place of a block while the data loads, so the footer does not
// move when it arrives.
function BlockPlaceholder() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      <Skeleton className="h-4.5 w-24" />
      <Skeleton className="h-5 w-48 max-w-full" />
      <Skeleton className="h-5 w-40 max-w-full" />
      <Skeleton className="h-5 w-44 max-w-full" />
    </div>
  );
}

function ContactBlock({ company }: { company: PublicCompany }) {
  const { address, phone, email } = company;
  if (address === null && phone === null && email === null) return null;
  return (
    <div>
      <h2 className={HEADING_CLASS}>Contato</h2>
      <address className="mt-3 flex flex-col items-start gap-2 not-italic">
        {address !== null && (
          <p className="flex gap-1 wrap-anywhere">
            <MapPinIcon aria-hidden className="mt-1.25 size-4 shrink-0" />
            {address}
          </p>
        )}
        {phone !== null && (
          <a href={formatPhoneLink(phone)} className={ICON_LINK_CLASS}>
            <PhoneIcon aria-hidden className="size-4 shrink-0" />
            {formatPhone(phone)}
          </a>
        )}
        {email !== null && (
          <a
            href={`mailto:${email}`}
            className={`${ICON_LINK_CLASS} wrap-anywhere`}
          >
            <MailIcon aria-hidden className="size-4 shrink-0" />
            {email}
          </a>
        )}
      </address>
    </div>
  );
}

// docs/padroes/design-midia.md: Lucide has no brand icons, so the social
// networks are text links.
function SocialBlock({ company }: { company: PublicCompany }) {
  const links = [
    { label: "Instagram", href: company.instagramUrl },
    { label: "Facebook", href: company.facebookUrl },
    {
      label: "WhatsApp",
      href: company.whatsapp && formatWhatsAppLink(company.whatsapp),
    },
  ].filter((link): link is { label: string; href: string } =>
    Boolean(link.href),
  );
  if (links.length === 0) return null;
  return (
    <div>
      <h2 className={HEADING_CLASS}>Redes sociais</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a href={href} className={LINK_CLASS}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
