import { Suspense } from "react";
import { SiteFooter } from "@/components/portal/layout/site-footer";
import { SiteHeader } from "@/components/portal/layout/site-header";
import { AccessDeniedNotice } from "@/components/shared/access-denied-notice";

export default function PortalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {/* It reads the address, so it renders apart from the static page. */}
        <Suspense fallback={null}>
          <div className="mx-auto max-w-page px-6 pt-8 empty:hidden lg:px-8">
            <AccessDeniedNotice />
          </div>
        </Suspense>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
