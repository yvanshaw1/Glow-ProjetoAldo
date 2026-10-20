import Link from "next/link";
import { BrandLink } from "@/components/shared/brand-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ERROR_CATALOG } from "@/shared/errors/catalog";

// Any address without a page, the panel ones included, so it stays out of
// the portal and panel layouts.
export default function NotFound() {
  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-dvh max-w-page flex-col justify-center gap-8 px-6 py-14 lg:px-8"
    >
      <BrandLink className="self-start" />
      <div className="flex flex-col gap-3">
        <h1 className="text-h3 font-bold md:text-h2">Página não encontrada</h1>
        <p className="text-muted-foreground">
          {ERROR_CATALOG.NOT_FOUND.message}
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants(), "self-start")}>
        Ir para a página inicial
      </Link>
    </main>
  );
}
