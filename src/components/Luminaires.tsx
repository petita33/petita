import Link from "next/link";
import type { Visuels } from "@/lib/visuels";
import { VisuelFixe } from "./VisuelFixe";

export function Luminaires({ visuels }: { visuels: Visuels }) {
  return (
    <section id="luminaires" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
      <div
        data-reveal
        className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3 lg:gap-12"
      >
        <div className="overflow-hidden rounded-xl">
          <VisuelFixe
            emplacement="luminaires-gauche"
            visuels={visuels}
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
        <div className="px-0 text-center lg:px-4">
          <h2 className="m-0 font-display text-[30px] font-semibold text-petita-brick sm:text-4xl lg:text-[44px]">
            Créateurs de luminaires
          </h2>
          <div className="mx-auto my-5 h-0.5 w-15 bg-petita-gold" />
          <p className="mx-auto mb-7.5 max-w-[42ch]">
            Nous sélectionnons avec passion des luminaires anciens que nous restaurons et sublimons.
            Chaque pièce est unique.
          </p>
          <Link
            href="/luminaires/en-vente"
            className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-7 py-4 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
          >
            Explorez nos luminaires
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl">
          <VisuelFixe
            emplacement="luminaires-droite"
            visuels={visuels}
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
