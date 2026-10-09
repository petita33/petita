/**
 * Identité du store Vercel Blob : quel hôte sert nos objets, et quelles URLs
 * viennent réellement de chez nous.
 *
 * Ce module ne dépend de rien — ni SDK, ni Node — pour rester importable aussi
 * bien depuis une Server Action que depuis `next.config.ts`, où la liste des
 * hôtes autorisés à l'optimiseur d'images doit dire exactement la même chose.
 */

/**
 * L'identifiant du store, tel que le SDK le déduit lui aussi :
 * `BLOB_READ_WRITE_TOKEN` a la forme `vercel_blob_rw_<store>_<secret>`, et
 * `BLOB_STORE_ID` la forme `store_<store>`.
 */
function identifiantStore() {
  const depuisJeton = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3];
  if (depuisJeton) return depuisJeton;
  return process.env.BLOB_STORE_ID?.replace(/^store_/, "") || null;
}

/**
 * L'hôte exact qui sert nos objets publics, ou `null` si aucune variable ne
 * permet de le déduire (développement local sans `vercel env pull`).
 *
 * Le SDK compose la même adresse à partir du même identifiant :
 * `https://<store>.public.blob.vercel-storage.com/<chemin>`.
 */
export function hoteBlobPublic() {
  const identifiant = identifiantStore();
  return identifiant
    ? `${identifiant.toLowerCase()}.public.blob.vercel-storage.com`
    : null;
}

/** Sert de repli quand l'hôte exact n'est pas déductible. */
const HOTE_BLOB = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/;

/**
 * Vrai si l'URL désigne bien un objet de notre store, dans le dossier attendu.
 *
 * Les URLs viennent du navigateur : sans ce contrôle, n'importe quelle adresse
 * pourrait être enregistrée puis servie depuis nos pages. Un store voisin — un
 * autre projet Vercel, celui d'un tiers — est refusé comme le reste dès que
 * l'hôte attendu est connu, et le dossier est comparé en entier : `annonces`
 * n'accepte pas `annonces-bis/`, ni un chemin qui remonte ailleurs.
 */
export function estUrlBlob(url: string, dossier: string) {
  let cible: URL;
  try {
    cible = new URL(url);
  } catch {
    return false;
  }

  if (cible.protocol !== "https:") return false;
  // Un paramètre de requête ne sert à rien sur un objet public et brouillerait
  // les comparaisons d'URL comme les clés de cache.
  if (cible.search !== "" || cible.hash !== "") return false;

  const attendu = hoteBlobPublic();
  if (attendu ? cible.hostname !== attendu : !HOTE_BLOB.test(cible.hostname)) {
    return false;
  }

  // `URL` a déjà résolu les `..` ; restent les doubles séparateurs, qu'elle
  // conserve tels quels et qui désigneraient un autre objet que celui lu ici.
  return cible.pathname.startsWith(`/${dossier}/`) && !cible.pathname.includes("//");
}
