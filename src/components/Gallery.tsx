import Image from "next/image";
import Link from "next/link";
import { hrefAnnonce, type Annonce } from "@/lib/annonces";
import { PlaceholderImage } from "./PlaceholderImage";

/**
 * Vitrine des dernières pièces vendues, alimentée par les annonces : la
 * sélection vient de `dernieresVentes()`, il n'y a pas de liste à tenir ici.
 * Tant qu'aucune annonce n'est vendue, la section reste en place, sans vignette.
 */
export function Gallery({ ventes }: { ventes: Annonce[] }) {
  return (
    <section id="ventes" className="bg-petita-rose text-petita-cream">
      <div data-reveal className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-[90px]">
        <div className="mb-11 flex flex-col items-center">
          <h2 className="m-0 text-center font-display text-[30px] font-semibold text-petita-cream sm:text-4xl lg:text-[44px]">
            Nos dernières ventes
          </h2>
          <div className="mt-5 h-0.5 w-15 bg-petita-gold" />
        </div>
        {ventes.length === 0 ? (
          <div className="min-h-50" />
        ) : (
          <div className="flex snap-x snap-mandatory gap-4.5 overflow-x-auto pb-1.5 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 lg:gap-7">
            {ventes.map((annonce) => (
              <CarteVente key={annonce.id} annonce={annonce} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Ici, et seulement ici, le format propre à l'annonce est ignoré : la vitrine
 * est une rangée de vignettes, elle ne tient que si toutes ont exactement la
 * même hauteur. Le cadre est donc fixe, au format 9:16 : c'est celui dans lequel
 * sont prises les photos des pièces vendues, elles le remplissent donc pile.
 *
 * Une photo d'un autre format n'est pas rognée pour autant — elle est posée en
 * entier dans le cadre (`object-contain`) et le reste est comblé par la même
 * photo, agrandie et floutée, plutôt que par un aplat mort.
 */
const CADRE_VIGNETTE = "aspect-[9/16]";

const TAILLES_VIGNETTE = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 78vw";

function CarteVente({ annonce }: { annonce: Annonce }) {
  const photo = annonce.images[0];

  return (
    <figure className="group relative m-0 min-w-[min(78vw,260px)] snap-start sm:min-w-0">
      <div className={`relative ${CADRE_VIGNETTE} overflow-hidden rounded-xl bg-petita-brick/30`}>
        {photo ? (
          <>
            {/*
              Décor de remplissage : la photo débordée et floutée, pour que les
              marges d'un cliché plus large ou plus haut que le cadre ne soient
              pas un aplat mort. Purement visuel, donc hors de l'arbre a11y.
            */}
            <Image
              src={photo}
              alt=""
              aria-hidden="true"
              fill
              sizes={TAILLES_VIGNETTE}
              className="scale-110 object-cover opacity-55 blur-xl"
            />
            <Image
              src={photo}
              alt={annonce.titre}
              fill
              sizes={TAILLES_VIGNETTE}
              className="object-contain"
            />
          </>
        ) : (
          <PlaceholderImage ratio={CADRE_VIGNETTE} tone="rose" alt={annonce.titre} />
        )}
      </div>
      {/*
        Hauteur fixe elle aussi : un titre sur deux lignes ne doit pas décaler
        le bas de la vignette par rapport à ses voisines.
      */}
      <figcaption className="relative -mt-5.5 flex h-18 items-center justify-center rounded-md bg-petita-cream px-3 text-center font-display text-[19px] leading-tight shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
        {/*
          Lien étiré : le pseudo-élément recouvre toute la vignette, photo
          comprise, sans imbriquer la figcaption hors de la <figure>.
        */}
        <Link
          href={hrefAnnonce(annonce.id)}
          className="line-clamp-2 text-petita-brick no-underline after:absolute after:inset-0 after:content-[''] hover:text-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
        >
          {annonce.titre}
        </Link>
      </figcaption>
    </figure>
  );
}
