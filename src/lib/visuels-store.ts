/**
 * Stockage des photos fixes de la page d'accueil sur Vercel Blob.
 * Même mécanique que les annonces : un seul JSON, versionné par ETag.
 */

import { unstable_cache } from "next/cache";
import { ecrireJson, lireJson } from "./blob";
import { normaliserVisuels, type Visuels } from "./visuels";

/** Dossier des versions successives du JSON, la plus récente faisant foi. */
const DONNEES = "donnees/visuels";
export const TAG_VISUELS = "visuels";

export type InstantaneVisuels = {
  visuels: Visuels;
  /** Version lue, à repasser à l'écriture — `null` si rien n'a été écrit. */
  version: string | null;
};

export async function lireInstantaneVisuels(): Promise<InstantaneVisuels> {
  const { contenu, version } = await lireJson(DONNEES);
  return { visuels: normaliserVisuels(contenu), version };
}

const lireVisuelsMisEnCache = unstable_cache(
  async () => (await lireInstantaneVisuels()).visuels,
  ["visuels-publics"],
  { tags: [TAG_VISUELS], revalidate: 3600 },
);

export async function lireVisuels(): Promise<Visuels> {
  return lireVisuelsMisEnCache();
}

export async function ecrireVisuels(visuels: Visuels, version: string | null) {
  await ecrireJson(DONNEES, visuels, version);
}
