/**
 * Stockage des annonces sur Cloudflare R2.
 *
 * Toutes les annonces tiennent dans un seul JSON ; la mécanique de lecture,
 * d'écriture et de contrôle de version vit dans `stockage.ts`.
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { ecrireJson, lireJson } from "./stockage";
import {
  identifiantDepuisSegmentAnnonce,
  normaliserCategorie,
  type Annonce,
} from "./annonces";
import { normaliserFormat } from "./formats";

/** Dossier des versions successives du JSON, la plus récente faisant foi. */
export const DOSSIER_DONNEES_ANNONCES = "donnees/annonces";
export const TAG_ANNONCES = "annonces";

export type Instantane = {
  annonces: Annonce[];
  /** Version lue, à repasser à l'écriture — `null` si rien n'a été écrit. */
  version: string | null;
};

export async function lireInstantane(): Promise<Instantane> {
  const { contenu, version } = await lireJson(DOSSIER_DONNEES_ANNONCES);
  return { annonces: normaliserAnnonces(contenu), version };
}

function texte(valeur: unknown) {
  return typeof valeur === "string" ? valeur : "";
}

/** Une date ISO, ou la valeur de repli si le champ est absent ou aberrant. */
function date(valeur: unknown, repli: string) {
  return typeof valeur === "string" && !Number.isNaN(Date.parse(valeur))
    ? valeur
    : repli;
}

/**
 * Ramène le JSON stocké à des annonces sûres.
 *
 * Le document vient du réseau : il est relu champ par champ plutôt que
 * simplement transtypé. Chaque annonce est reconstruite à partir des seules
 * clés connues — une clé en trop est abandonnée, un type inattendu retombe sur
 * une valeur neutre — et une entrée sans identifiant est écartée en le
 * signalant. Le reste du code peut donc traiter ce qu'il reçoit comme des
 * `Annonce`, ce que le cast d'avant se contentait d'affirmer.
 */
function normaliserAnnonces(contenu: unknown): Annonce[] {
  if (!Array.isArray(contenu)) return [];

  const annonces: Annonce[] = [];
  let ecartees = 0;

  for (const entree of contenu) {
    if (!entree || typeof entree !== "object" || Array.isArray(entree)) {
      ecartees += 1;
      continue;
    }

    const brut = entree as Record<string, unknown>;
    const id = texte(brut.id).trim();
    if (!id) {
      ecartees += 1;
      continue;
    }

    const creeLe = date(brut.creeLe, new Date(0).toISOString());
    const prix = typeof brut.prix === "number" && Number.isFinite(brut.prix) && brut.prix >= 0
      ? brut.prix
      : null;
    const lienExterne = texte(brut.lienExterne).trim();

    annonces.push({
      id,
      titre: texte(brut.titre),
      description: texte(brut.description),
      // Les annonces enregistrées avant l'ajout d'un champ n'en ont pas la clé :
      // on comble ici pour que le reste du code n'ait jamais à tester `undefined`.
      categorie: normaliserCategorie(brut.categorie),
      prix,
      images: Array.isArray(brut.images)
        ? brut.images.filter(
            (url): url is string =>
              typeof url === "string" && url.startsWith("https://"),
          )
        : [],
      // Les annonces publiées avant le choix du format gardent le cadre 4:3
      // dans lequel elles ont toujours été montrées.
      format: normaliserFormat(brut.format),
      lienExterne: /^https?:\/\//i.test(lienExterne) ? lienExterne : null,
      creeLe,
      modifieLe: date(brut.modifieLe, creeLe),
    });
  }

  if (ecartees > 0) {
    console.error(
      `${ecartees} entrée(s) illisible(s) écartée(s) de ${DOSSIER_DONNEES_ANNONCES}.`,
    );
  }

  return annonces;
}

/**
 * Aucune péremption dans le temps : `updateTag(TAG_ANNONCES)` est appelé par
 * chaque Server Action qui écrit, et c'est la seule chose qui puisse changer ce
 * catalogue. Une expiration à l'heure ne rafraîchirait donc rien — elle
 * relancerait un `lireJson`, donc un `list()` facturé comme une opération de
 * classe A, vingt-quatre fois par jour pour retrouver le même contenu.
 */
const lireAnnoncesMisesEnCache = unstable_cache(
  async () => (await lireInstantane()).annonces,
  ["annonces-publiques"],
  { tags: [TAG_ANNONCES], revalidate: false },
);

export async function lireAnnonces(): Promise<Annonce[]> {
  return lireAnnoncesMisesEnCache();
}

export const lireAnnonce = cache(async function lireAnnonce(
  segmentOuId: string,
): Promise<Annonce | null> {
  const annonces = await lireAnnonces();
  const identifiant = identifiantDepuisSegmentAnnonce(segmentOuId);
  if (!identifiant) return null;

  const correspondances = annonces.filter(
    (annonce) =>
      annonce.id.toLowerCase() === identifiant ||
      annonce.id.toLowerCase().startsWith(identifiant),
  );
  return correspondances.length === 1 ? correspondances[0] : null;
});

export async function ecrireAnnonces(annonces: Annonce[], version: string | null) {
  await ecrireJson(DOSSIER_DONNEES_ANNONCES, annonces, version);
}
