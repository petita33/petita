/**
 * Types et constantes partagés des annonces.
 * Ce fichier ne fait aucun accès réseau : il est importable côté client.
 */

export const CATEGORIES = {
  "luminaires-en-vente": {
    label: "Luminaires en vente",
    href: "/luminaires/en-vente",
  },
  "luminaires-vendus": {
    label: "Luminaires vendus",
    href: "/luminaires/vendus",
  },
  meubles: {
    label: "Meubles",
    href: "/meubles",
  },
} as const;

export type Categorie = keyof typeof CATEGORIES;

export const CATEGORIES_ORDRE = Object.keys(CATEGORIES) as Categorie[];

export function estCategorie(valeur: unknown): valeur is Categorie {
  return typeof valeur === "string" && valeur in CATEGORIES;
}

export type Annonce = {
  id: string;
  categorie: Categorie;
  titre: string;
  description: string;
  /** En euros. `null` quand aucun prix n'est affiché. */
  prix: number | null;
  /** URLs Vercel Blob, dans l'ordre d'affichage. La première sert de vignette. */
  images: string[];
  creeLe: string;
  modifieLe: string;
};

const formatEuros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function formaterPrix(prix: number | null) {
  if (prix === null) return null;
  // Les prix ronds s'affichent sans décimales : « 120 € » plutôt que « 120,00 € ».
  return formatEuros.format(prix).replace(",00", "");
}

export function trierParDateDecroissante(annonces: Annonce[]) {
  return [...annonces].sort((a, b) => b.creeLe.localeCompare(a.creeLe));
}
