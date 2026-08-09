import { EMPLACEMENTS, SECTIONS, type EmplacementId } from "@/lib/visuels";

/**
 * Petit schéma de la section, colonne par colonne, avec l'emplacement concerné
 * marqué « ICI ». C'est le repère le plus rapide pour savoir quelle photo de la
 * page d'accueil on est en train de changer.
 *
 * Purement décoratif : les lecteurs d'écran lisent la description en toutes
 * lettres qui l'accompagne.
 */
export function MaquetteSection({ emplacement }: { emplacement: EmplacementId }) {
  const cadre = EMPLACEMENTS[emplacement];

  return (
    <div
      aria-hidden="true"
      className="flex gap-1.5 rounded-lg border border-petita-gold/30 bg-petita-cream p-2"
    >
      {SECTIONS[cadre.section].disposition.map((bloc, colonne) => {
        if (colonne === cadre.colonne) {
          return (
            <div
              key={colonne}
              className="flex h-14 flex-1 items-center justify-center rounded bg-petita-brick font-display text-[11px] font-semibold tracking-[0.18em] text-petita-cream"
            >
              ICI
            </div>
          );
        }

        if (bloc === "photo") {
          return <div key={colonne} className="h-14 flex-1 rounded bg-petita-gold/25" />;
        }

        return (
          <div
            key={colonne}
            className="flex h-14 flex-1 flex-col justify-center gap-1.5 rounded bg-petita-blush px-2"
          >
            <span className="block h-1 rounded-full bg-petita-brown/30" />
            <span className="block h-1 w-3/4 rounded-full bg-petita-brown/25" />
            <span className="block h-1 w-1/2 rounded-full bg-petita-brown/25" />
          </div>
        );
      })}
    </div>
  );
}
