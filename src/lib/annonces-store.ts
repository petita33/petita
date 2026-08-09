/**
 * Stockage des annonces sur Vercel Blob.
 *
 * Toutes les annonces tiennent dans un seul JSON. Il est lu avec `useCache: false`
 * pour court-circuiter le CDN : une modification est donc visible immédiatement.
 * Les écritures utilisent `ifMatch` (ETag) pour ne jamais écraser une modification
 * concurrente sans le signaler.
 */

import { del, get, put } from "@vercel/blob";
import type { Annonce } from "./annonces";

const CHEMIN_DONNEES = "donnees/annonces.json";

export class ConflitDeVersion extends Error {
  constructor() {
    super(
      "Les annonces ont été modifiées ailleurs entre-temps. Rechargez la page puis réessayez.",
    );
    this.name = "ConflitDeVersion";
  }
}

export type Instantane = {
  annonces: Annonce[];
  /** ETag du JSON lu, ou `null` si le fichier n'existe pas encore. */
  version: string | null;
};

function blobConfigure() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/**
 * Lit le JSON avec son ETag. Renvoie une liste vide tant que le store n'a jamais
 * été écrit — ou tant qu'aucun jeton Blob n'est configuré (dev local sans
 * `vercel env pull`), pour que le site public reste affichable.
 */
export async function lireInstantane(): Promise<Instantane> {
  if (!blobConfigure()) {
    console.warn(
      "BLOB_READ_WRITE_TOKEN absent : les annonces ne peuvent pas être chargées.",
    );
    return { annonces: [], version: null };
  }

  const reponse = await get(CHEMIN_DONNEES, {
    access: "public",
    useCache: false,
  });

  if (!reponse || reponse.statusCode !== 200) {
    return { annonces: [], version: null };
  }

  const texte = await new Response(reponse.stream).text();
  let contenu: unknown;
  try {
    contenu = JSON.parse(texte);
  } catch {
    throw new Error(`Le fichier ${CHEMIN_DONNEES} n'est pas un JSON valide.`);
  }

  return {
    annonces: Array.isArray(contenu) ? (contenu as Annonce[]) : [],
    version: reponse.blob.etag,
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
  if (!blobConfigure()) {
    throw new Error(
      "Aucun store Vercel Blob n'est configuré : BLOB_READ_WRITE_TOKEN est absent.",
    );
  }

  try {
    await put(CHEMIN_DONNEES, JSON.stringify(annonces, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      // Minimum accepté par Vercel Blob ; la lecture passe de toute façon
      // par `useCache: false`.
      cacheControlMaxAge: 60,
      ...(version ? { ifMatch: version } : {}),
    });
  } catch (erreur) {
    if ((erreur as Error).name === "BlobPreconditionFailedError") {
      throw new ConflitDeVersion();
    }
    throw erreur;
  }
}

/** Supprime des images du store. Les échecs ne bloquent pas l'appelant. */
export async function supprimerImages(urls: string[]) {
  if (urls.length === 0) return;
  try {
    await del(urls);
  } catch (erreur) {
    console.error("Suppression d'images impossible", erreur);
  }
}
