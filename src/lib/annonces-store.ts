/**
 * Stockage des annonces sur Vercel Blob.
 *
 * Toutes les annonces tiennent dans un seul JSON ; la mécanique de lecture,
 * d'écriture et de contrôle de version vit dans `blob.ts`.
 */

import { ecrireJson, lireJson } from "./blob";
import { normaliserCategorie, type Annonce } from "./annonces";
import { normaliserFormat } from "./formats";

/** Dossier des versions successives du JSON, la plus récente faisant foi. */
const DONNEES = "donnees/annonces";

export type Instantane = {
  annonces: Annonce[];
  /** Version lue, à repasser à l'écriture — `null` si rien n'a été écrit. */
  version: string | null;
};

export async function lireInstantane(): Promise<Instantane> {
  const { contenu, version } = await lireJson(DONNEES);
  const annonces = Array.isArray(contenu) ? (contenu as Annonce[]) : [];

  return {
    // Les annonces enregistrées avant l'ajout d'un champ n'en ont pas la clé :
    // on comble ici pour que le reste du code n'ait jamais à tester `undefined`.
    annonces: annonces.map((annonce) => ({
      ...annonce,
      categorie: normaliserCategorie(annonce.categorie),
      // Les annonces publiées avant le choix du format gardent le cadre 4:3
      // dans lequel elles ont toujours été montrées.
      format: normaliserFormat(annonce.format),
      lienExterne:
        typeof annonce.lienExterne === "string" && annonce.lienExterne !== ""
          ? annonce.lienExterne
          : null,
    })),
    version,
  };
}

export async function lireAnnonces(): Promise<Annonce[]> {
  return (await lireInstantane()).annonces;
}

export async function lireAnnonce(id: string): Promise<Annonce | null> {
  const { annonces } = await lireInstantane();
  return annonces.find((annonce) => annonce.id === id) ?? null;
}

export async function ecrireAnnonces(annonces: Annonce[], version: string | null) {
  await ecrireJson(DONNEES, annonces, version);
}
