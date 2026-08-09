import Image from "next/image";
import { altDe, EMPLACEMENTS, type EmplacementId, type Visuels } from "@/lib/visuels";
import { PlaceholderImage } from "./PlaceholderImage";

/**
 * Un des emplacements photo fixes de la page d'accueil.
 *
 * Le cadre — proportions, teinte, comportement au survol — appartient au site
 * et ne bouge pas. Seule la photo vient de l'administration ; tant qu'aucune
 * n'a été déposée, l'aplat décoratif tient la place sans casser la mise en page.
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
        ratio={cadre.ratio}
        tone={cadre.tone}
        alt={cadre.altParDefaut}
      />
    );
  }

  return (
    <div className={`group relative ${cadre.ratio} overflow-hidden`}>
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
