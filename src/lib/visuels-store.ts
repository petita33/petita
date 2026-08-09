/**
 * Stockage des photos fixes de la page d'accueil sur Vercel Blob.
 * Même mécanique que les annonces : un seul JSON, versionné par ETag.
 */

import { ecrireJson, lireJson } from "./blob";
import { normaliserVisuels, type Visuels } from "./visuels";

const CHEMIN_DONNEES = "donnees/visuels.json";

export type InstantaneVisuels = {
  visuels: Visuels;
  /** ETag du JSON lu, ou `null` si le fichier n'existe pas encore. */
  version: string | null;
};

export async function lireInstantaneVisuels(): Promise<InstantaneVisuels> {
  const { contenu, version } = await lireJson(CHEMIN_DONNEES);
  return { visuels: normaliserVisuels(contenu), version };
}

export async function lireVisuels(): Promise<Visuels> {
  return (await lireInstantaneVisuels()).visuels;
}

export async function ecrireVisuels(visuels: Visuels, version: string | null) {
  await ecrireJson(CHEMIN_DONNEES, visuels, version);
}
