import { CarteVisuel } from "@/components/admin/CarteVisuel";
import {
  emplacementsDeLaSection,
  EMPLACEMENTS_ORDRE,
  SECTIONS,
  SECTIONS_ORDRE,
} from "@/lib/visuels";
import { lireVisuels } from "@/lib/visuels-store";

export const dynamic = "force-dynamic";

export default async function PhotosDeLAccueil() {
  const visuels = await lireVisuels();
  const remplis = EMPLACEMENTS_ORDRE.filter(
    (emplacement) => visuels[emplacement],
  ).length;

  return (
    <>
      <div>
        <h1 className="m-0 font-display text-2xl font-semibold text-petita-brick sm:text-4xl">
          Photos de la page d&apos;accueil
        </h1>
        <div className="my-4 h-0.5 w-16 bg-petita-gold" />
        <p className="m-0 max-w-[62ch] text-sm text-petita-brown sm:text-[15px]">
          La page d&apos;accueil compte {EMPLACEMENTS_ORDRE.length} emplacements
          photo. Ils ne bougent jamais : vous changez seulement la photo posée
          dans chacun. Un emplacement laissé vide affiche un fond décoratif.
        </p>
        <p className="mt-2 m-0 text-sm text-petita-brown/70 sm:text-[15px]">
          {remplis} emplacement{remplis > 1 ? "s" : ""} sur{" "}
          {EMPLACEMENTS_ORDRE.length} avec une photo. Les vignettes de « Nos
          dernières ventes » ne sont pas ici : elles viennent de vos annonces.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-10 sm:mt-12 sm:gap-12">
        {SECTIONS_ORDRE.map((section) => (
          <section key={section}>
            <h2 className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-lg font-semibold text-petita-brick sm:text-xl">
              {SECTIONS[section].titre}
              <span className="font-body text-[13px] font-normal text-petita-brown/70 sm:text-sm">
                {SECTIONS[section].reperage}
              </span>
            </h2>

            <div className="mt-4 flex flex-col gap-5">
              {emplacementsDeLaSection(section).map((emplacement) => (
                <CarteVisuel
                  key={emplacement}
                  emplacement={emplacement}
                  visuel={visuels[emplacement]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
