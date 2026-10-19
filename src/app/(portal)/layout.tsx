import { SiteFooter } from "@/components/portal/layout/site-footer";
import { SiteHeader } from "@/components/portal/layout/site-header";

export default function PortalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
