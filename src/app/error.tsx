"use client";

import Link from "next/link";
import { BrandLink } from "@/components/shared/brand-link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { ERROR_CATALOG } from "@/shared/errors/catalog";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

// The message of the error is not shown: it may carry internal details.
export default function ErrorPage({ retry }: ErrorPageProps) {
  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-dvh max-w-page flex-col justify-center gap-8 px-6 py-14 lg:px-8"
    >
      <BrandLink className="self-start" />
      <h1 className="text-h3 font-bold md:text-h2">Algo deu errado</h1>
      <Alert variant="destructive">
        <AlertDescription>
          {ERROR_CATALOG.INTERNAL_ERROR.message}
        </AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => retry()}>Tentar novamente</Button>
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          Ir para a página inicial
        </Link>
      </div>
    </main>
  );
}
