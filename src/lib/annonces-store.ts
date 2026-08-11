/**
 * Stockage des annonces sur Vercel Blob.
 *
 * Toutes les annonces tiennent dans un seul JSON ; la mécanique de lecture,
 * d'écriture et de contrôle de version vit dans `blob.ts`.
 */

import { ecrireJson, lireJson } from "./blob";
import { normaliserCategorie, type Annonce } from "./annonces";
import { normaliserFormat } from "./formats";

const CHEMIN_DONNEES = "donnees/annonces.json";

export type Instantane = {
  annonces: Annonce[];
  /** ETag du JSON lu, ou `null` si le fichier n'existe pas encore. */
  version: string | null;
};

export async function lireInstantane(): Promise<Instantane> {
  const { contenu, version } = await lireJson(CHEMIN_DONNEES);
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
  await ecrireJson(CHEMIN_DONNEES, annonces, version);
}
