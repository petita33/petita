import Link from "next/link";
import { formaterPrix, type Annonce } from "@/lib/annonces";
import { GalerieAnnonce } from "./GalerieAnnonce";

/**
 * Grille d'annonces publiées depuis l'espace d'administration.
 * `variante="vendu"` masque le prix et ajoute la pastille « Vendu ».
 */
export function AnnoncesGrille({
  annonces,
  variante = "en-vente",
  messageVide,
}: {
  annonces: Annonce[];
  variante?: "en-vente" | "vendu";
  messageVide: string;
}) {
  if (annonces.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-petita-gold/40 px-6 py-14 text-center text-petita-brown/80">
        {messageVide}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {annonces.map((annonce) => (
        <CarteAnnonce key={annonce.id} annonce={annonce} variante={variante} />
      ))}
    </div>
  );
}

function CarteAnnonce({
  annonce,
  variante,
}: {
  annonce: Annonce;
  variante: "en-vente" | "vendu";
}) {
  const prix = variante === "vendu" ? null : formaterPrix(annonce.prix);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-petita-gold/20 bg-petita-cream transition-shadow hover:shadow-md">
      <div className="relative">
        <GalerieAnnonce images={annonce.images} titre={annonce.titre} />
        {variante === "vendu" ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-petita-brick/90 px-3.5 py-1 font-display text-sm text-petita-cream">
            Vendu
          </span>
        ) : null}
      </div>

      <div className="flex flex-grow flex-col gap-2 p-5">
        <h2 className="m-0 font-display text-xl font-semibold text-petita-brick">
          {annonce.titre}
        </h2>
        {prix ? (
          <p className="m-0 font-display text-lg font-semibold text-petita-gold">
            {prix}
          </p>
        ) : null}
        {annonce.description ? (
          <p className="m-0 whitespace-pre-line text-sm text-petita-brown">
            {annonce.description}
          </p>
        ) : null}

        {variante === "en-vente" ? (
          <div className="mt-auto pt-4">
            <Link
              href="/#contact"
              className="inline-flex min-h-11 items-center rounded-md border border-petita-gold/60 px-5 py-2.5 font-display text-[15px] text-petita-brick no-underline hover:bg-petita-brick hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
            >
              Nous contacter
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
