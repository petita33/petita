import Link from "next/link";
import type { Visuels } from "@/lib/visuels";
import { VisuelFixe } from "./VisuelFixe";

export function Meubles({ visuels }: { visuels: Visuels }) {
  return (
    <section id="meubles" className="border-y border-petita-gold/30 bg-petita-cream">
      <div
        data-reveal
        className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-3 lg:gap-12 lg:px-10 lg:py-24"
      >
        <div className="text-center">
          <h2 className="m-0 font-display text-[30px] font-semibold text-petita-brick sm:text-4xl lg:text-[44px]">
            Restaurateurs de meubles
          </h2>
          <div className="mx-auto my-5 h-0.5 w-15 bg-petita-gold" />
          <p className="mx-auto mb-7.5 max-w-[42ch]">
            Du ponçage à la dernière couche de cire, nous redonnons vie et modernité à des meubles
            chargés d’histoire…
          </p>
          <Link
            href="/meubles/en-vente"
            className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-7 py-4 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
          >
            Explorez nos meubles
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl">
          <VisuelFixe
            emplacement="meubles-milieu"
            visuels={visuels}
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
        <div className="overflow-hidden rounded-xl">
          <VisuelFixe
            emplacement="meubles-droite"
            visuels={visuels}
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
