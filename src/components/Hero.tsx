import type { Visuels } from "@/lib/visuels";
import { VisuelFixe } from "./VisuelFixe";

export function Hero({ visuels }: { visuels: Visuels }) {
  return (
    <section
      id="accueil"
      className="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:gap-16 lg:px-10 lg:py-24"
    >
      <div data-reveal>
        <h1 className="m-0 mb-2 text-balance font-display text-4xl font-bold leading-[1.1] text-petita-brick sm:text-5xl lg:text-[66px]">
          Atelier Petita — Luminaires &amp; mobilier revisités
        </h1>
        <div className="my-5 h-0.5 w-15 bg-petita-gold" />
        <p className="mb-8 max-w-[58ch] text-[1.08em] text-petita-brown">
          Des pièces anciennes chinées puis restaurées à la main.
          Une seconde vie, un seul exemplaire.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="#luminaires"
            className="inline-flex min-h-12 items-center rounded-md border-2 border-petita-brick bg-petita-brick px-7 py-4 font-display text-lg tracking-wide text-petita-cream no-underline hover:border-petita-rose hover:bg-petita-rose hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
          >
            Découvrir nos luminaires
          </a>
          <a
            href="#meubles"
            className="inline-flex min-h-12 items-center rounded-md border-2 border-petita-brick bg-transparent px-7 py-4 font-display text-lg tracking-wide text-petita-brick no-underline hover:bg-petita-brick hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
          >
            Nos meubles restaurés
          </a>
        </div>
      </div>
      <div data-reveal className="overflow-hidden rounded-xl shadow-[0_24px_60px_rgba(126,43,38,0.18)]">
        <VisuelFixe
          emplacement="accueil-ambiance"
          visuels={visuels}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
      </div>
    </section>
  );
}
