/**
 * Identité du stockage Cloudflare R2 : quelle adresse sert nos objets au
 * public, quel point d'accès reçoit les envois, et quelles URLs viennent
 * réellement de chez nous.
 *
 * Ce module ne dépend de rien — ni SDK, ni Node — pour rester importable aussi
 * bien depuis une Server Action que depuis `next.config.ts`, où la liste des
 * hôtes autorisés à l'optimiseur d'images doit dire exactement la même chose.
 */

/**
 * L'origine publique du bucket, sans barre finale : le domaine personnalisé
 * relié au bucket dans Cloudflare (`R2_PUBLIC_URL`), ou `null` s'il n'est pas
 * configuré (développement local sans variables).
 */
export function originePublique() {
  const brut = process.env.R2_PUBLIC_URL?.trim();
  if (!brut) return null;
  try {
    return new URL(brut).origin;
  } catch {
    return null;
  }
}

/** L'hôte exact qui sert nos objets publics, ou `null` s'il est inconnu. */
export function hotePublic() {
  const origine = originePublique();
  return origine ? new URL(origine).hostname : null;
}

/**
 * Le point d'accès S3 du compte R2 — celui qui reçoit les envois du
 * navigateur. Seule l'origine compte : un `R2_ENDPOINT` copié avec le nom du
 * bucket au bout reste valable.
 */
export function pointAccesR2() {
  const brut = process.env.R2_ENDPOINT?.trim();
  if (!brut) return null;
  try {
    return new URL(brut).origin;
  } catch {
    return null;
  }
}

/** L'URL publique d'un objet du bucket. */
export function urlPublique(chemin: string) {
  const origine = originePublique();
  if (!origine) throw new Error("R2_PUBLIC_URL est absent ou invalide.");
  return `${origine}/${chemin}`;
}

/**
 * Le chemin d'un objet dans le bucket, déduit de son URL publique, ou `null`
 * si l'URL n'est pas l'une des nôtres.
 */
export function cheminDepuisUrl(url: string) {
  const origine = originePublique();
  if (!origine || !url.startsWith(`${origine}/`)) return null;
  return url.slice(origine.length + 1);
}

/**
 * Vrai si l'URL désigne bien un objet de notre bucket, dans le dossier attendu.
 *
 * Les URLs viennent du navigateur : sans ce contrôle, n'importe quelle adresse
 * pourrait être enregistrée puis servie depuis nos pages. Tant que l'origine
 * publique n'est pas configurée, rien n'est accepté. Le dossier est comparé en
 * entier : `annonces` n'accepte pas `annonces-bis/`, ni un chemin qui remonte
 * ailleurs.
 */
export function estUrlStockee(url: string, dossier: string) {
  const attendu = hotePublic();
  if (!attendu) return false;

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
  if (cible.hostname !== attendu || cible.port !== "") return false;

  // `URL` a déjà résolu les `..` ; restent les doubles séparateurs, qu'elle
  // conserve tels quels et qui désigneraient un autre objet que celui lu ici.
  return cible.pathname.startsWith(`/${dossier}/`) && !cible.pathname.includes("//");
}
