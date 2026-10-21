import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// docs/catalogo/paginas-publicas.md, Destaque: the text and the shortcuts to
// create an account and to sign in (RF002), with the image beside them from
// 1024 px and below them on a phone. The fixed texts name no company data
// (RN028). It is the only image of the page loaded in advance (RNF006).

const HERO_IMAGE = {
  src: "/images/home-hero.webp",
  width: 1600,
  height: 989,
};

// The width of the image column: the page content (max-w-page) less the
// margins, in two columns from 1024 px.
const HERO_IMAGE_SIZES =
  "(min-width: 1240px) 572px, (min-width: 1024px) calc(50vw - 48px), calc(100vw - 48px)";

export function HeroSection() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="mx-auto grid max-w-page gap-8 px-6 py-14 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-22"
    >
      <div className="flex flex-col items-start gap-5">
        <p className="text-xs font-semibold tracking-[0.08em] text-link uppercase">
          Estética automotiva
        </p>
        <h1 id="home-hero-title" className="text-h2 font-bold md:text-h1">
          Cuidado completo para o seu carro
        </h1>
        <p className="text-muted-foreground">
          Escolha o serviço, o dia e o horário pelo site e acompanhe cada etapa
          até a conclusão.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Criar conta
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            Entrar
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl shadow-neu-md">
        <Image
          {...HERO_IMAGE}
          alt="Mão de luva preta limpando com um pincel o painel de um carro clássico"
          sizes={HERO_IMAGE_SIZES}
          preload
          className="aspect-[1.618] w-full object-cover"
        />
      </div>
    </section>
  );
}
