/**
 * Stockage des photos fixes de la page d'accueil sur Cloudflare R2.
 * Même mécanique que les annonces : un seul JSON, une version par écriture.
 */

import { unstable_cache } from "next/cache";
import { ecrireJson, lireJson } from "./stockage";
import { normaliserVisuels, type Visuels } from "./visuels";

/** Dossier des versions successives du JSON, la plus récente faisant foi. */
export const DOSSIER_DONNEES_VISUELS = "donnees/visuels";
export const TAG_VISUELS = "visuels";

export type InstantaneVisuels = {
  visuels: Visuels;
  /** Version lue, à repasser à l'écriture — `null` si rien n'a été écrit. */
  version: string | null;
};

export async function lireInstantaneVisuels(): Promise<InstantaneVisuels> {
  const { contenu, version } = await lireJson(DOSSIER_DONNEES_VISUELS);
  return { visuels: normaliserVisuels(contenu), version };
}

/** Invalidé par `updateTag(TAG_VISUELS)` seul, comme les annonces et pour les
 * mêmes raisons de coût — voir `annonces-store.ts`. */
const lireVisuelsMisEnCache = unstable_cache(
  async () => (await lireInstantaneVisuels()).visuels,
  ["visuels-publics"],
  { tags: [TAG_VISUELS], revalidate: false },
);

export async function lireVisuels(): Promise<Visuels> {
  return lireVisuelsMisEnCache();
}

export async function ecrireVisuels(visuels: Visuels, version: string | null) {
  await ecrireJson(DOSSIER_DONNEES_VISUELS, visuels, version);
}
