import Image from "next/image";
import {
  altDe,
  cadreDe,
  EMPLACEMENTS,
  type EmplacementId,
  type Visuels,
} from "@/lib/visuels";
import { PlaceholderImage } from "./PlaceholderImage";

/**
 * Un des emplacements photo fixes de la page d'accueil.
 *
 * La teinte et le comportement au survol appartiennent au site ; les
 * proportions suivent le format choisi pour la photo, et retombent sur le
 * cadre conseillé pour l'emplacement à défaut. Les sections de la page
 * d'accueil centrent leurs colonnes : un cadre plus haut ou plus large
 * n'y casse rien. Tant qu'aucune photo n'a été déposée, l'aplat décoratif
 * tient la place.
 */
export function VisuelFixe({
  emplacement,
  visuels,
  sizes,
  priority = false,
}: {
  emplacement: EmplacementId;
  visuels: Visuels;
  /** Largeur rendue selon le point de rupture, pour le choix de la résolution. */
  sizes: string;
  priority?: boolean;
}) {
  const cadre = EMPLACEMENTS[emplacement];
  const visuel = visuels[emplacement];

  if (!visuel) {
    return (
      <PlaceholderImage
        ratio={cadre.conseille.classe}
        tone={cadre.tone}
        alt={cadre.altParDefaut}
      />
    );
  }

  return (
    <div
      className={`group relative ${cadreDe(emplacement, visuel)} overflow-hidden`}
    >
      <Image
        src={visuel.url}
        alt={altDe(emplacement, visuel)}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
    </div>
  );
}
