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
        <h1 className="m-0 font-display text-3xl font-semibold text-petita-brick sm:text-4xl">
          Photos de la page d&apos;accueil
        </h1>
        <div className="my-4 h-0.5 w-16 bg-petita-gold" />
        <p className="m-0 max-w-[62ch] text-[15px] text-petita-brown">
          La page d&apos;accueil compte {EMPLACEMENTS_ORDRE.length} emplacements
          photo. Ils ne bougent jamais : vous changez seulement la photo posée
          dans chacun. Un emplacement laissé vide affiche un fond décoratif.
        </p>
        <p className="mt-2 m-0 text-[15px] text-petita-brown/70">
          {remplis} emplacement{remplis > 1 ? "s" : ""} sur{" "}
          {EMPLACEMENTS_ORDRE.length} avec une photo. Les vignettes de « Nos
          dernières ventes » ne sont pas ici : elles viennent de vos annonces.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-12">
        {SECTIONS_ORDRE.map((section) => (
          <section key={section}>
            <h2 className="m-0 flex flex-wrap items-baseline gap-3 font-display text-xl font-semibold text-petita-brick">
              {SECTIONS[section].titre}
              <span className="font-body text-sm font-normal text-petita-brown/70">
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
