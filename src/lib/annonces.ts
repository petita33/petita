/**
 * Types et constantes partagés des annonces.
 * Ce fichier ne fait aucun accès réseau : il est importable côté client.
 */

import type { FormatImage } from "./formats";

/**
 * Les catégories sont réparties en groupes, qui n'ont rien à voir entre eux
 * dans l'espace d'administration : d'un côté ce qui est proposé à la vente,
 * de l'autre les pièces encore sur l'établi.
 */
export const GROUPES = {
  annonces: {
    titre: "Mes annonces",
    creer: "Nouvelle annonce",
    /** Nom au singulier, décliné par `compter()`. */
    nom: "annonce",
  },
  "en-cours": {
    titre: "En cours de rénovation",
    creer: "Nouvelle rénovation",
    nom: "rénovation",
  },
} as const;

export type Groupe = keyof typeof GROUPES;

export const GROUPES_ORDRE = Object.keys(GROUPES) as Groupe[];

export function estGroupe(valeur: unknown): valeur is Groupe {
  return typeof valeur === "string" && valeur in GROUPES;
}

export const CATEGORIES = {
  "luminaires-en-vente": {
    label: "Luminaires en vente",
    href: "/luminaires/en-vente",
    groupe: "annonces",
    // `enVente` commande l'affichage du prix et les formulations d'achat.
    enVente: true,
    // Pastille posée sur la vignette et sur la page de détail.
    pastille: null,
  },
  "luminaires-vendus": {
    label: "Luminaires vendus",
    href: "/luminaires/vendus",
    groupe: "annonces",
    enVente: false,
    pastille: "Vendu",
  },
  "meubles-en-vente": {
    label: "Meubles en vente",
    href: "/meubles/en-vente",
    groupe: "annonces",
    enVente: true,
    pastille: null,
  },
  "meubles-vendus": {
    label: "Meubles vendus",
    href: "/meubles/vendus",
    groupe: "annonces",
    enVente: false,
    pastille: "Vendu",
  },
  "en-cours": {
    label: "En cours de rénovation",
    href: "/en-cours",
    groupe: "en-cours",
    // Une pièce encore à l'atelier n'a ni prix affiché ni bouton d'achat.
    enVente: false,
    pastille: "En rénovation",
  },
} as const satisfies Record<
  string,
  {
    label: string;
    href: string;
    groupe: Groupe;
    enVente: boolean;
    pastille: string | null;
  }
>;

export type Categorie = keyof typeof CATEGORIES;

export const CATEGORIES_ORDRE = Object.keys(CATEGORIES) as Categorie[];

export function estCategorie(valeur: unknown): valeur is Categorie {
  return typeof valeur === "string" && valeur in CATEGORIES;
}

export function categoriesDuGroupe(groupe: Groupe) {
  return CATEGORIES_ORDRE.filter(
    (categorie) => CATEGORIES[categorie].groupe === groupe,
  );
}

/** Groupe d'administration dont relève une annonce. */
export function groupeDe(categorie: Categorie): Groupe {
  return CATEGORIES[categorie].groupe;
}

/**
 * Contrepartie « vendu » d'une catégorie en vente : c'est la page vers laquelle
 * l'annonce bascule une fois la pièce partie.
 */
const CATEGORIES_VENDUES = {
  "luminaires-en-vente": "luminaires-vendus",
  "meubles-en-vente": "meubles-vendus",
} as const satisfies Partial<Record<Categorie, Categorie>>;

type CategorieEnVente = keyof typeof CATEGORIES_VENDUES;

/** La catégorie « vendu » correspondante, ou `null` hors des pages de vente. */
export function categorieVendue(categorie: Categorie): Categorie | null {
  return categorie in CATEGORIES_VENDUES
    ? CATEGORIES_VENDUES[categorie as CategorieEnVente]
    : null;
}

/** « 3 annonces », « 1 rénovation »… */
export function compter(nombre: number, nom: string) {
  return `${nombre} ${nom}${nombre > 1 ? "s" : ""}`;
}

/**
 * Catégories des annonces publiées avant la scission « meubles » en deux pages.
 * Les annonces déjà stockées gardent l'ancienne valeur : elle est traduite à la
 * lecture, puis remplacée définitivement au prochain enregistrement.
 */
const CATEGORIES_HERITEES: Record<string, Categorie> = {
  meubles: "meubles-en-vente",
};

/**
 * Ramène une catégorie stockée à une catégorie connue. Une valeur inconnue
 * retombe sur la première catégorie plutôt que de faire disparaître l'annonce :
 * elle reste visible et corrigeable depuis l'admin.
 */
export function normaliserCategorie(valeur: unknown): Categorie {
  if (estCategorie(valeur)) return valeur;
  if (typeof valeur === "string" && valeur in CATEGORIES_HERITEES) {
    return CATEGORIES_HERITEES[valeur];
  }
  return CATEGORIES_ORDRE[0];
}

/** Le dossier du store Blob où atterrissent les photos des annonces. */
export const DOSSIER_ANNONCES = "annonces";

export type Annonce = {
  id: string;
  categorie: Categorie;
  titre: string;
  description: string;
  /** En euros. `null` quand aucun prix n'est affiché. */
  prix: number | null;
  /** URLs Vercel Blob, dans l'ordre d'affichage. La première sert de vignette. */
  images: string[];
  /**
   * Proportions du cadre dans lequel les photos sont montrées, partout sur le
   * site. Commun à toutes les photos de l'annonce, propre à chaque annonce.
   */
  format: FormatImage;
  /**
   * Lien vers l'annonce sur la plateforme de vente (Vinted, Leboncoin…).
   * `null` quand aucun lien n'est renseigné. Affiché uniquement sur la page
   * de détail de l'annonce, jamais dans les grilles.
   */
  lienExterne: string | null;
  creeLe: string;
  modifieLe: string;
};

/** Chemin de la page de détail d'une annonce. */
export function hrefAnnonce(id: string) {
  return `/annonces/${id}`;
}

/**
 * Nom lisible de la plateforme d'un lien, pour libeller le bouton.
 * Les hôtes inconnus retombent sur le domaine sans `www.`.
 */
export function nomPlateforme(lien: string) {
  let hote: string;
  try {
    hote = new URL(lien).hostname.replace(/^www\./, "");
  } catch {
    return "la plateforme";
  }

  const connues: Record<string, string> = {
    vinted: "Vinted",
    leboncoin: "leboncoin",
    selency: "Selency",
    etsy: "Etsy",
    ebay: "eBay",
    instagram: "Instagram",
    facebook: "Facebook",
  };

  // On teste le premier label du domaine : « vinted.fr », « www.vinted.be »…
  const racine = hote.split(".")[0];
  return connues[racine] ?? hote;
}

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

/**
 * Les vignettes de « Nos dernières ventes » : les premières annonces des pages
 * « Luminaires vendus » et « Meubles vendus », dans l'ordre où elles y figurent.
 * Rien à tenir à jour à la main — publier une annonce vendue suffit.
 */
export function dernieresVentes(annonces: Annonce[], parCategorie = 2) {
  const vitrine = ["luminaires-vendus", "meubles-vendus"] as const;

  return vitrine.flatMap((categorie) =>
    trierParDateDecroissante(
      annonces.filter((annonce) => annonce.categorie === categorie),
    ).slice(0, parCategorie),
  );
}
