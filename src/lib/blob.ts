/**
 * Accès bas niveau au store Vercel Blob, partagé par les jeux de données du site.
 *
 * Chaque jeu de données tient dans un seul JSON. Les écritures utilisent
 * `ifMatch` (ETag) pour ne jamais écraser une modification concurrente sans le
 * signaler.
 */

import { BlobPreconditionFailedError, del, get, list, put } from "@vercel/blob";

export class ConflitDeVersion extends Error {
  constructor() {
    super(
      "Les données ont été modifiées ailleurs entre-temps. Rechargez la page puis réessayez.",
    );
    this.name = "ConflitDeVersion";
  }
}

export type InstantaneJson = {
  /** Contenu décodé, ou `null` si le fichier n'existe pas encore. */
  contenu: unknown;
  /** ETag du JSON lu, ou `null` si le fichier n'existe pas encore. */
  version: string | null;
};

export function blobConfigure() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/**
 * `get` lit le blob par son URL publique, donc à travers le CDN, qui compresse
 * la réponse et *affaiblit* l'ETag au passage : `W/"abc…"` là où le store tient
 * `"abc…"`. Le `x-if-match` d'une écriture est comparé à la valeur forte : sans
 * ce nettoyage, aucune écriture conditionnelle ne peut aboutir.
 *
 * On ne garde que la valeur, sans le marqueur faible. Si le CDN venait un jour à
 * renvoyer un tout autre ETag, l'écriture échouerait — jamais elle n'écraserait
 * en silence.
 */
function etagFort(etag: string) {
  return etag.replace(/^W\//, "");
}

/**
 * Lit un JSON avec son ETag. Renvoie un contenu nul tant que le fichier n'a
 * jamais été écrit — ou tant qu'aucun jeton Blob n'est configuré (dev local sans
 * `vercel env pull`), pour que le site public reste affichable.
 *
 * `useCache: false` n'a d'effet que sur les blobs privés (le SDK n'ajoute son
 * `cache=0` que dans ce cas) : la lecture passe donc bien par le CDN. C'est la
 * purge à l'écriture, côté Vercel, qui garantit la fraîcheur du contenu.
 */
export async function lireJson(chemin: string): Promise<InstantaneJson> {
  if (!blobConfigure()) {
    console.warn(`BLOB_READ_WRITE_TOKEN absent : ${chemin} ne peut pas être lu.`);
    return { contenu: null, version: null };
  }

  const reponse = await get(chemin, { access: "public", useCache: false });

  // `get` lève sur une panne réelle et ne renvoie `null` que pour un fichier
  // jamais écrit : ici, « absent » veut donc bien dire « jeu de données vide ».
  // C'est ce qui rend sûr le balayage des images orphelines, qui déduit de ces
  // JSON ce qui est encore référencé — une panne prise pour « aucune annonce »
  // lui ferait supprimer des photos bien vivantes.
  if (!reponse) {
    return { contenu: null, version: null };
  }

  // 304 supposerait un `ifNoneMatch`, que nous ne posons jamais ; sans corps à
  // lire, il n'y a rien à faire de mieux que de le signaler.
  if (reponse.statusCode !== 200) {
    throw new Error(
      `Lecture de ${chemin} inattendue (HTTP ${reponse.statusCode}).`,
    );
  }

  const texte = await new Response(reponse.stream).text();
  try {
    return { contenu: JSON.parse(texte), version: etagFort(reponse.blob.etag) };
  } catch {
    throw new Error(`Le fichier ${chemin} n'est pas un JSON valide.`);
  }
}

export async function ecrireJson(
  chemin: string,
  valeur: unknown,
  version: string | null,
) {
  if (!blobConfigure()) {
    throw new Error(
      "Aucun store Vercel Blob n'est configuré : BLOB_READ_WRITE_TOKEN est absent.",
    );
  }

  try {
    await put(chemin, JSON.stringify(valeur, null, 2), {
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
    // `BlobError` ne renseigne pas `name` : toutes les erreurs du SDK arrivent
    // ici en `name === "Error"`. Seul `instanceof` les distingue.
    if (erreur instanceof BlobPreconditionFailedError) {
      throw new ConflitDeVersion();
    }
    throw erreur;
  }
}

export type ResultatSuppression = {
  supprimees: string[];
  /** URLs restées dans le store. Le balayage des orphelines les reprendra. */
  echecs: string[];
};

/**
 * Supprime des images du store.
 *
 * Un échec ne bloque jamais l'appelant — la donnée a déjà été enregistrée, on
 * ne va pas lui faire recommencer sa saisie pour un nettoyage. Mais il n'est
 * plus avalé pour autant : il est tracé avec son contexte et renvoyé, et
 * `balayerImagesOrphelines()` finira par ramasser ce qui est resté.
 */
export async function supprimerImages(
  urls: string[],
  contexte: string,
): Promise<ResultatSuppression> {
  if (urls.length === 0) return { supprimees: [], echecs: [] };

  try {
    await del(urls);
    return { supprimees: urls, echecs: [] };
  } catch (erreur) {
    console.error(
      `Suppression groupée de ${urls.length} image(s) impossible (${contexte}) — nouvel essai une par une.`,
      erreur,
    );
  }

  // Une seule URL en défaut fait échouer tout le lot : on réessaie
  // individuellement pour ne pas abandonner les autres au passage.
  const supprimees: string[] = [];
  const echecs: string[] = [];
  for (const url of urls) {
    try {
      await del(url);
      supprimees.push(url);
    } catch (erreur) {
      echecs.push(url);
      console.error(`Image non supprimée (${contexte}) : ${url}`, erreur);
    }
  }

  if (echecs.length > 0) {
    console.error(
      `${echecs.length} image(s) restée(s) dans le store (${contexte}). ` +
        "Elles seront reprises au prochain balayage des orphelines.",
    );
  }

  return { supprimees, echecs };
}

export type ImageStockee = {
  url: string;
  pathname: string;
  deposeeLe: Date;
};

/** Toutes les images d'un dossier du store, pagination comprise. */
export async function listerImages(dossier: string): Promise<ImageStockee[]> {
  const images: ImageStockee[] = [];
  let curseur: string | undefined;

  do {
    const page = await list({ prefix: `${dossier}/`, cursor: curseur });
    for (const blob of page.blobs) {
      images.push({
        url: blob.url,
        pathname: blob.pathname,
        deposeeLe: blob.uploadedAt,
      });
    }
    curseur = page.hasMore ? page.cursor : undefined;
  } while (curseur);

  return images;
}

/**
 * Vrai si l'URL désigne bien une image de notre store, dans le dossier attendu.
 * Les URLs viennent du navigateur : sans ce contrôle, n'importe quelle adresse
 * pourrait être enregistrée puis servie depuis nos pages.
 */
export function estUrlBlob(url: string, dossier: string) {
  return new RegExp(
    `^https://[a-z0-9-]+\\.public\\.blob\\.vercel-storage\\.com/${dossier}/`,
  ).test(url);
}
