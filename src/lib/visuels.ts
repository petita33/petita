/**
 * Les photos fixes de la page d'accueil.
 *
 * Contrairement aux annonces, ces emplacements ne se créent ni ne se
 * suppriment : la page en compte un nombre fixe, décrit ici une fois pour
 * toutes. Seule la photo posée dans chacun d'eux est modifiable depuis
 * l'espace d'administration. Un emplacement sans photo affiche l'aplat
 * décoratif de `PlaceholderImage`.
 *
 * Ce fichier ne fait aucun accès réseau : il est importable côté client.
 *
 * Les vignettes de « Nos dernières ventes » ne figurent pas ici : elles
 * viennent des annonces.
 */

import { classeDuFormat, estFormat, type FormatImage } from "./formats";

/** Une colonne de la maquette d'une section, pour le schéma de repérage. */
type Bloc = "texte" | "photo";

/**
 * Les sections de la page d'accueil qui contiennent des photos fixes, dans
 * l'ordre où on les rencontre en descendant la page.
 */
export const SECTIONS = {
  hero: {
    titre: "Bandeau d'accueil",
    reperage: "Tout en haut de la page, à droite du grand titre.",
    // Colonnes de la section, de gauche à droite. Sert à dessiner la maquette
    // affichée dans l'administration : la patronne voit où la photo atterrit.
    disposition: ["texte", "photo"],
  },
  luminaires: {
    titre: "Créateurs de luminaires",
    reperage:
      "Sous le texte de présentation, autour du bouton « Explorez nos luminaires ».",
    disposition: ["photo", "texte", "photo"],
  },
  meubles: {
    titre: "Restaurateurs de meubles",
    reperage:
      "Sur fond crème, juste avant la section « Nos dernières ventes ».",
    disposition: ["texte", "photo", "photo"],
  },
} as const satisfies Record<
  string,
  { titre: string; reperage: string; disposition: readonly Bloc[] }
>;

export type SectionId = keyof typeof SECTIONS;

export const SECTIONS_ORDRE = Object.keys(SECTIONS) as SectionId[];

export const EMPLACEMENTS = {
  "accueil-ambiance": {
    section: "hero",
    /** Rang de la colonne occupée dans `disposition`. */
    colonne: 1,
    position: "La grande photo d'ambiance",
    conseille: {
      libelle: "Paysage — 5 pour 4",
      // Classe Tailwind, écrite en toutes lettres pour l'analyse du CSS.
      classe: "aspect-[5/4]",
      largeur: 5,
      hauteur: 4,
    },
    conseil:
      "La première image que voient les visiteurs : une vue d'ensemble de l'atelier ou une mise en situation vaut mieux qu'un gros plan.",
    tone: "blush",
    altParDefaut: "Photo d'ambiance de l'Atelier Petita",
  },
  "luminaires-gauche": {
    section: "luminaires",
    colonne: 0,
    position: "La photo de gauche",
    conseille: {
      libelle: "Portrait — 3 pour 4",
      classe: "aspect-[3/4]",
      largeur: 3,
      hauteur: 4,
    },
    conseil: "Un luminaire restauré, photographié en hauteur.",
    tone: "blush",
    altParDefaut: "Luminaire ancien restauré par l'Atelier Petita",
  },
  "luminaires-droite": {
    section: "luminaires",
    colonne: 2,
    position: "La photo de droite",
    conseille: {
      libelle: "Portrait — 3 pour 4",
      classe: "aspect-[3/4]",
      largeur: 3,
      hauteur: 4,
    },
    conseil: "Un second luminaire, pour équilibrer avec celui de gauche.",
    tone: "blush",
    altParDefaut: "Luminaire ancien restauré par l'Atelier Petita",
  },
  "meubles-milieu": {
    section: "meubles",
    colonne: 1,
    position: "La photo du milieu",
    conseille: {
      libelle: "Paysage — 4 pour 3",
      classe: "aspect-[4/3]",
      largeur: 4,
      hauteur: 3,
    },
    conseil: "Un meuble entier après restauration.",
    tone: "sand",
    altParDefaut: "Meuble ancien restauré par l'Atelier Petita",
  },
  "meubles-droite": {
    section: "meubles",
    colonne: 2,
    position: "La photo de droite",
    conseille: {
      libelle: "Paysage — 4 pour 3",
      classe: "aspect-[4/3]",
      largeur: 4,
      hauteur: 3,
    },
    conseil:
      "Un détail du travail réalisé — pochoir, poignée, patine — fait un bon contraste avec la photo du milieu.",
    tone: "sand",
    altParDefaut: "Détail d'un meuble restauré par l'Atelier Petita",
  },
} as const satisfies Record<
  string,
  {
    section: SectionId;
    colonne: number;
    position: string;
    /**
     * Le cadre dessiné pour cet emplacement. Il s'applique tant que la photo
     * posée là n'impose pas son propre format.
     */
    conseille: {
      libelle: string;
      classe: string;
      largeur: number;
      hauteur: number;
    };
    conseil: string;
    tone: "blush" | "sand" | "rose";
    altParDefaut: string;
  }
>;

export type EmplacementId = keyof typeof EMPLACEMENTS;

export const EMPLACEMENTS_ORDRE = Object.keys(EMPLACEMENTS) as EmplacementId[];

export function estEmplacement(valeur: unknown): valeur is EmplacementId {
  return typeof valeur === "string" && valeur in EMPLACEMENTS;
}

export function emplacementsDeLaSection(section: SectionId) {
  return EMPLACEMENTS_ORDRE.filter(
    (emplacement) => EMPLACEMENTS[emplacement].section === section,
  );
}

/** Le dossier du store Blob où atterrissent ces photos. */
export const DOSSIER_VISUELS = "visuels";

export type Visuel = {
  /** URL Vercel Blob de la photo. */
  url: string;
  /** Texte lu par les lecteurs d'écran. Vide = `altParDefaut`. */
  alt: string;
  /**
   * Proportions imposées à cette photo. Absent = le cadre conseillé pour
   * l'emplacement, celui que le site a toujours utilisé.
   */
  format?: FormatImage;
};

/** Un emplacement sans entrée n'a pas de photo : il affiche son aplat. */
export type Visuels = Partial<Record<EmplacementId, Visuel>>;

export function altDe(emplacement: EmplacementId, visuel: Visuel) {
  return visuel.alt.trim() || EMPLACEMENTS[emplacement].altParDefaut;
}

/**
 * Classe Tailwind du cadre d'un emplacement : le format choisi pour la photo
 * qui s'y trouve, sinon le cadre conseillé.
 */
export function cadreDe(emplacement: EmplacementId, visuel?: Visuel) {
  return visuel?.format
    ? classeDuFormat(visuel.format)
    : EMPLACEMENTS[emplacement].conseille.classe;
}

/**
 * Ramène le JSON stocké à des visuels sûrs : les emplacements inconnus (un
 * emplacement retiré du site depuis) et les entrées mal formées sont ignorés.
 */
export function normaliserVisuels(contenu: unknown): Visuels {
  if (!contenu || typeof contenu !== "object") return {};

  const visuels: Visuels = {};
  for (const [cle, valeur] of Object.entries(contenu)) {
    if (!estEmplacement(cle) || !valeur || typeof valeur !== "object") continue;
    const { url, alt, format } = valeur as {
      url?: unknown;
      alt?: unknown;
      format?: unknown;
    };
    if (typeof url !== "string" || url === "") continue;
    visuels[cle] = {
      url,
      alt: typeof alt === "string" ? alt : "",
      // Un format absent (photo posée avant que le choix existe) ou inconnu
      // laisse l'emplacement à son cadre conseillé.
      ...(estFormat(format) ? { format } : {}),
    };
  }
  return visuels;
}
