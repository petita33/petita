import Link from "next/link";
import { CATEGORIES, formaterPrix, hrefAnnonce, type Annonce } from "@/lib/annonces";
import { GalerieAnnonce } from "./GalerieAnnonce";

/**
 * Grille d'annonces publiées depuis l'espace d'administration.
 * Prix et pastille (« Vendu », « En rénovation ») découlent de la catégorie
 * de chaque annonce : la grille n'a rien à paramétrer.
 */
export function AnnoncesGrille({
  annonces,
  messageVide,
}: {
  annonces: Annonce[];
  messageVide: string;
}) {
  if (annonces.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-petita-gold/40 px-6 py-14 text-center text-petita-brown">
        {messageVide}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {annonces.map((annonce) => (
        <CarteAnnonce key={annonce.id} annonce={annonce} />
      ))}
    </div>
  );
}

function CarteAnnonce({ annonce }: { annonce: Annonce }) {
  const categorie = CATEGORIES[annonce.categorie];
  const prix = categorie.enVente ? formaterPrix(annonce.prix) : null;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-petita-gold/20 bg-petita-cream transition-shadow hover:shadow-md">
      <div className="relative">
        <GalerieAnnonce images={annonce.images} titre={annonce.titre} />
        {categorie.pastille ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-petita-brick/90 px-3.5 py-1 font-display text-sm text-petita-cream">
            {categorie.pastille}
          </span>
        ) : null}
      </div>

      <div className="flex flex-grow flex-col gap-2 p-5">
        <h2 className="m-0 font-display text-xl font-semibold text-petita-brick">
          {/*
            Lien étiré : le pseudo-élément recouvre toute la carte, qui devient
            cliquable sans imbriquer les commandes du carrousel dans un <a>.
          */}
          <Link
            href={hrefAnnonce(annonce.id)}
            className="text-petita-brick no-underline after:absolute after:inset-0 after:content-[''] hover:text-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
          >
            {annonce.titre}
          </Link>
        </h2>
        {prix ? (
          <p className="m-0 font-display text-lg font-semibold text-petita-gold-fonce">
            {prix}
          </p>
        ) : null}
        {annonce.description ? (
          <p className="m-0 line-clamp-3 whitespace-pre-line text-sm text-petita-brown">
            {annonce.description}
          </p>
        ) : null}

        <p
          aria-hidden="true"
          className="mt-auto pt-4 font-display text-[15px] text-petita-gold-fonce"
        >
          Voir le détail →
        </p>
      </div>
    </article>
  );
}
