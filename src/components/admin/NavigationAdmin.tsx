"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Les deux domaines de l'administration, volontairement séparés : d'un côté
 * les annonces, qui se créent et se suppriment ; de l'autre les photos fixes
 * de la page d'accueil, dont seul le contenu change.
 */
const ONGLETS = [
  {
    href: "/admin",
    libelle: "Mes annonces",
    aide: "Publier, modifier, retirer des pièces",
  },
  {
    href: "/admin/visuels",
    libelle: "Photos de la page d'accueil",
    aide: "Changer les photos de présentation",
  },
] as const;

export function NavigationAdmin() {
  const chemin = usePathname();

  return (
    <nav
      aria-label="Sections de l'administration"
      className="border-b border-petita-gold/25 bg-petita-cream/60"
    >
      <ul className="mx-auto m-0 flex max-w-5xl list-none flex-wrap gap-2 p-0 px-3 sm:px-6">
        {ONGLETS.map((onglet) => {
          // `/admin` ne doit pas s'allumer quand on est sur `/admin/visuels`.
          const actif =
            onglet.href === "/admin"
              ? chemin === "/admin" || chemin.startsWith("/admin/nouvelle") || chemin.startsWith("/admin/modifier")
              : chemin.startsWith(onglet.href);

          return (
            <li key={onglet.href}>
              <Link
                href={onglet.href}
                aria-current={actif ? "page" : undefined}
                className={`flex min-h-12 flex-col justify-center border-b-2 px-3 py-2 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-petita-gold ${
                  actif
                    ? "border-petita-brick text-petita-brick"
                    : "border-transparent text-petita-brown hover:border-petita-gold/50 hover:text-petita-brick"
                }`}
              >
                <span className="font-display text-[15px] font-semibold sm:text-[16px]">
                  {onglet.libelle}
                </span>
                <span className="text-[12px] text-petita-brown/70 sm:text-[13px]">
                  {onglet.aide}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
