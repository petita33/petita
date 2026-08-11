/**
 * Les formats d'image proposés à l'envoi d'une photo.
 *
 * Ce sont les proportions que proposent les appareils photo de téléphone :
 * le cadre du site épouse celui de la prise de vue, la photo n'est donc plus
 * recadrée à l'affichage. Chaque annonce choisit le sien ; les emplacements
 * fixes de la page d'accueil peuvent aussi s'en écarter.
 *
 * Ce fichier ne fait aucun accès réseau : il est importable côté client.
 *
 * Les classes Tailwind sont écrites en toutes lettres : une classe construite
 * à l'exécution (`aspect-[${x}/${y}]`) échapperait à l'analyse du CSS.
 */

export const FORMATS = {
  "4:3": {
    label: "4:3",
    orientation: "Paysage",
    aide: "Le format d'origine de la plupart des téléphones.",
    classe: "aspect-[4/3]",
    largeur: 4,
    hauteur: 3,
  },
  "3:4": {
    label: "3:4",
    orientation: "Portrait",
    aide: "Le même, téléphone tenu à la verticale.",
    classe: "aspect-[3/4]",
    largeur: 3,
    hauteur: 4,
  },
  "1:1": {
    label: "1:1",
    orientation: "Carré",
    aide: "Le carré, comme sur Instagram.",
    classe: "aspect-square",
    largeur: 1,
    hauteur: 1,
  },
  "16:9": {
    label: "16:9",
    orientation: "Paysage large",
    aide: "Le format large des écrans et des vidéos.",
    classe: "aspect-[16/9]",
    largeur: 16,
    hauteur: 9,
  },
  "9:16": {
    label: "9:16",
    orientation: "Portrait plein écran",
    aide: "Toute la hauteur de l'écran, comme une story.",
    classe: "aspect-[9/16]",
    largeur: 9,
    hauteur: 16,
  },
  "3:2": {
    label: "3:2",
    orientation: "Paysage",
    aide: "Le format des appareils photo argentiques et reflex.",
    classe: "aspect-[3/2]",
    largeur: 3,
    hauteur: 2,
  },
  "2:3": {
    label: "2:3",
    orientation: "Portrait",
    aide: "Le même, à la verticale.",
    classe: "aspect-[2/3]",
    largeur: 2,
    hauteur: 3,
  },
} as const satisfies Record<
  string,
  {
    label: string;
    orientation: string;
    aide: string;
    classe: string;
    largeur: number;
    hauteur: number;
  }
>;

export type FormatImage = keyof typeof FORMATS;

export const FORMATS_ORDRE = Object.keys(FORMATS) as FormatImage[];

/** Le format des annonces publiées avant que le choix n'existe. */
export const FORMAT_PAR_DEFAUT: FormatImage = "4:3";

export function estFormat(valeur: unknown): valeur is FormatImage {
  return typeof valeur === "string" && valeur in FORMATS;
}

/**
 * Ramène un format stocké (ou reçu d'un formulaire) à un format connu.
 * Une valeur inconnue retombe sur le format par défaut plutôt que de casser
 * l'affichage : l'annonce reste visible et son format corrigeable depuis l'admin.
 */
export function normaliserFormat(valeur: unknown): FormatImage {
  return estFormat(valeur) ? valeur : FORMAT_PAR_DEFAUT;
}

export function classeDuFormat(format: FormatImage) {
  return FORMATS[format].classe;
}
