import { CarFrontIcon, ClockIcon } from "lucide-react";
import Image from "next/image";
import type { PublicService } from "@/shared/api/catalog";
import { formatDuration } from "@/shared/format/duration";

// docs/catalogo/paginas-publicas.md, Cartão (RF006): the image of the
// service on top, then the category, the name, the description and the
// average duration.

// The width of the image: the page content (max-w-page) less the margins,
// the gaps and the padding of the card, in one column, two from 768 px and
// three from 1024 px.
const CARD_IMAGE_SIZES =
  "(min-width: 1240px) 331px, (min-width: 1024px) calc(33vw - 82px), (min-width: 768px) calc(50vw - 80px), calc(100vw - 88px)";

const IMAGE_AREA_CLASS =
  "relative aspect-[1.618] w-full overflow-hidden rounded-lg";

export function ServiceCard({ service }: { service: PublicService }) {
  return (
    <article className="flex h-full flex-col gap-5 rounded-xl bg-background p-5 shadow-neu-md">
      {service.imageUrl === null ? (
        // L5: without an image, the same place pressed in, with an icon, so
        // every card keeps the same size.
        <div
          className={`${IMAGE_AREA_CLASS} flex items-center justify-center inset-shadow-neu-sm`}
        >
          <CarFrontIcon
            aria-hidden
            className="size-[42px] text-muted-foreground"
          />
        </div>
      ) : (
        <div className={IMAGE_AREA_CLASS}>
          {/* The name of the service, right below, says what it shows. */}
          <Image
            src={service.imageUrl}
            alt=""
            fill
            sizes={CARD_IMAGE_SIZES}
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.08em] text-link uppercase">
          {service.category.name}
        </p>
        <h2 className="font-semibold">{service.name}</h2>
        <p className="text-muted-foreground">{service.description}</p>
        <p className="mt-auto flex items-center gap-1 text-sm">
          <ClockIcon aria-hidden className="size-4 shrink-0" />
          Duração média: {formatDuration(service.avgDurationMinutes)}
        </p>
      </div>
    </article>
  );
}
