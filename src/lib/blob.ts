/**
 * Accès bas niveau au store Vercel Blob, partagé par les jeux de données du site.
 *
 * Chaque jeu de données tient dans un seul JSON, mais celui-ci n'est jamais
 * réécrit sur place : chaque enregistrement dépose un fichier daté dans le
 * dossier du jeu de données, et le plus récent fait foi.
 *
 * Pourquoi une version par écriture plutôt qu'un fichier réécrit sur place.
 *
 * Un blob public se lit par son URL, donc à travers le CDN de Vercel, qui le
 * garde en cache 60 s (minimum imposé : `cacheControlMaxAge: 0` est remonté à
 * 60). Réécrire le fichier est censé purger ce cache — mesuré sur ce store, ça
 * ne se produit pas : une fois l'URL en cache, les lectures qui suivent une
 * réécriture renvoient l'ancien contenu pendant près d'une minute, et alternent
 * entre ancien et nouveau selon le nœud qui répond. C'est exactement ce que
 * voyait la patronne : une annonce enregistrée n'apparaissait qu'après
 * plusieurs rechargements de l'admin.
 *
 * Aucun contournement n'existe côté lecture : `?cache=0` est refusé sur un
 * store public (HTTP 400), un paramètre d'URL unique ne change pas la clé de
 * cache, et le `useCache: false` du SDK ne vaut que pour les stores privés.
 *
 * D'où ce choix : le nom du fichier change à chaque enregistrement. Une version
 * neuve n'a jamais été lue, donc jamais mise en cache — sa lecture vient
 * forcément du stockage. Et `list()` interroge l'API du store, pas le CDN :
 * elle voit l'écriture immédiatement.
 */

import { del, list, put } from "@vercel/blob";
import { get as requeteHttps } from "node:https";

export class ConflitDeVersion extends Error {
  constructor() {
    super(
      "Les données ont été modifiées ailleurs entre-temps. Rechargez la page puis réessayez.",
    );
    this.name = "ConflitDeVersion";
  }
}

export type InstantaneJson = {
  /** Contenu décodé, ou `null` si le jeu de données n'existe pas encore. */
  contenu: unknown;
  /**
   * Chemin de la version lue, à repasser à `ecrireJson` — `null` si rien n'a
   * jamais été écrit.
   */
  version: string | null;
};

export function blobConfigure() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

const EXTENSION = ".json";

/**
 * Le nom d'une version, tel que `ecrireJson` le compose : horodatage ISO, tiret,
 * huit caractères tirés au sort, `.json`.
 *
 * Tout objet qui ne suit pas cette convention est ignoré à la lecture comme au
 * ménage. C'est ce qui empêche un objet déposé par erreur sous un dossier de
 * données — ou par un client qui aurait obtenu un jeton pour ce préfixe — d'être
 * pris pour la version courante et de rendre le catalogue illisible.
 */
const NOM_VERSION = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z-[0-9a-f]{8}\.json$/;

type Version = {
  pathname: string;
  uploadedAt: Date;
  downloadUrl: string;
};

/** Les versions d'un jeu de données, la plus récente en tête. */
async function listerVersions(dossier: string): Promise<Version[]> {
  const versions: Version[] = [];
  const intrus: string[] = [];
  let curseur: string | undefined;

  do {
    const page = await list({ prefix: `${dossier}/`, cursor: curseur });
    for (const blob of page.blobs) {
      if (!NOM_VERSION.test(blob.pathname.slice(dossier.length + 1))) {
        intrus.push(blob.pathname);
        continue;
      }
      versions.push({
        pathname: blob.pathname,
        uploadedAt: blob.uploadedAt,
        downloadUrl: blob.downloadUrl,
      });
    }
    curseur = page.hasMore ? page.cursor : undefined;
  } while (curseur);

  if (intrus.length > 0) {
    // Laissé en place plutôt que supprimé : le site continue de fonctionner, et
    // ce qui a atterri là mérite d'être regardé avant d'être jeté.
    console.error(
      `Objet(s) inattendu(s) sous ${dossier}/, ignoré(s) : ${intrus.join(", ")}`,
    );
  }

  // Le nom porte l'horodatage de l'écriture : il départage deux versions que le
  // store daterait de la même seconde.
  return versions.sort(
    (a, b) =>
      b.uploadedAt.getTime() - a.uploadedAt.getTime() ||
      b.pathname.localeCompare(a.pathname),
  );
}

function telecharger(url: string) {
  return new Promise<{ statut: number; texte: string }>((resolve, reject) => {
    const requete = requeteHttps(url, (reponse) => {
      const morceaux: Buffer[] = [];
      reponse.on("data", (morceau: Buffer) => morceaux.push(morceau));
      reponse.on("end", () => {
        resolve({
          statut: reponse.statusCode ?? 0,
          texte: Buffer.concat(morceaux).toString("utf8"),
        });
      });
    });
    requete.setTimeout(15_000, () => {
      requete.destroy(new Error("Délai de lecture du store dépassé."));
    });
    requete.on("error", reject);
  });
}

/** Le fichier a bien été lu, mais son contenu n'est pas exploitable. */
class VersionIllisible extends Error {}

/**
 * Attentes successives avant de relire un fichier refusé par le CDN.
 *
 * Le pare-feu de Vercel protège aussi le CDN des stores publics : selon le
 * débit et l'adresse d'origine, il répond à une partie des requêtes par un
 * challenge anti-bot (HTTP 403, en-tête `x-vercel-mitigated: challenge`) —
 * qu'aucun serveur ne peut résoudre, jeton Blob ou non. Les machines de build,
 * dont l'adresse est partagée avec d'autres projets, y sont les plus exposées.
 * Mesuré : une rafale de relances immédiates reste dans la fenêtre de
 * mitigation, alors que quelques secondes de pause suffisent à en sortir. Une
 * relance immédiate ne suffit donc pas : c'est elle qui faisait échouer le build.
 */
const ATTENTES_RELANCE_MS = [500, 1_000, 2_000, 4_000, 8_000];

function relancable(statut: number) {
  return statut === 0 || statut === 403 || statut === 429 || statut >= 500;
}

async function lireVersion(version: Version): Promise<unknown | undefined> {
  // `url` peut être protégée par Vercel même sur un store public ; `downloadUrl`
  // est l'adresse de lecture officielle renvoyée par `list()` et reste publique.
  // On passe par HTTPS natif : le `fetch` instrumenté de Next entre ici en
  // conflit avec le cache applicatif qui enveloppe déjà cette lecture.
  const tenter = () =>
    telecharger(version.downloadUrl).catch((erreur: unknown) => {
      console.warn(`Lecture de ${version.pathname} interrompue`, erreur);
      return { statut: 0, texte: "" };
    });

  let reponse = await tenter();
  for (const attente of ATTENTES_RELANCE_MS) {
    if (!relancable(reponse.statut)) break;
    await new Promise((resolve) => setTimeout(resolve, attente));
    reponse = await tenter();
  }

  // Version supprimée par le ménage d'une écriture concurrente : l'appelant se
  // rabattra sur la précédente.
  if (reponse.statut === 404) return undefined;

  if (reponse.statut !== 200) {
    throw new Error(
      `Lecture de ${version.pathname} inattendue (HTTP ${reponse.statut || "sans réponse"}).`,
    );
  }

  try {
    return JSON.parse(reponse.texte);
  } catch {
    throw new VersionIllisible(
      `Le fichier ${version.pathname} n'est pas un JSON valide.`,
    );
  }
}

/**
 * Lit la dernière version d'un jeu de données, avec de quoi la réécrire.
 *
 * Renvoie un contenu nul tant que rien n'a jamais été écrit — ou tant qu'aucun
 * jeton Blob n'est configuré (dev local sans `vercel env pull`), pour que le
 * site public reste affichable. Une panne, elle, lève : « absent » ne veut
 * jamais dire « en échec ». C'est ce qui rend sûr le balayage des images
 * orphelines, qui déduit de ces JSON ce qui est encore référencé — une panne
 * prise pour « aucune annonce » lui ferait supprimer des photos bien vivantes.
 */
export async function lireJson(dossier: string): Promise<InstantaneJson> {
  if (!blobConfigure()) {
    console.warn(`BLOB_READ_WRITE_TOKEN absent : ${dossier} ne peut pas être lu.`);
    return { contenu: null, version: null };
  }

  const versions = await listerVersions(dossier);
  if (versions.length === 0) return lireJsonHerite(dossier);

  let derniereErreur: unknown;
  for (const version of versions) {
    try {
      const contenu = await lireVersion(version);
      if (contenu !== undefined) return { contenu, version: version.pathname };
    } catch (erreur) {
      // Un store injoignable n'est pas une version corrompue : se rabattre sur
      // la précédente servirait un catalogue périmé, que le cache public
      // garderait jusqu'au prochain enregistrement.
      if (!(erreur instanceof VersionIllisible)) throw erreur;
      // Version illisible — JSON tronqué, contenu inattendu : on se rabat sur la
      // précédente plutôt que de rendre tout le site indisponible. L'écriture
      // suivante repartira alors en conflit, ce qui est le bon moment pour venir
      // regarder ce qui traîne dans le dossier.
      console.error(`Version ${version.pathname} ignorée`, erreur);
      derniereErreur = erreur;
    }
  }

  // `list` a bien renvoyé des versions : les avoir toutes vues disparaître ou
  // devenir illisibles est une panne, pas un jeu de données vide. Lever ici est
  // ce qui empêche le balayage des orphelines de prendre l'incident pour un
  // catalogue vide et de supprimer des photos bien vivantes.
  if (derniereErreur) throw derniereErreur;
  throw new Error(`Aucune version lisible de ${dossier}.`);
}

/**
 * Transition : avant l'écriture versionnée, chaque jeu de données tenait dans un
 * `<dossier>.json` réécrit sur place. Tant qu'aucune version datée n'existe,
 * c'est ce fichier qui fait foi ; le premier enregistrement en fait une
 * première version, après quoi plus rien ne le lit.
 */
async function lireJsonHerite(dossier: string): Promise<InstantaneJson> {
  const pathname = `${dossier}${EXTENSION}`;
  const page = await list({ prefix: pathname });
  const blob = page.blobs.find((candidat) => candidat.pathname === pathname);
  if (!blob) return { contenu: null, version: null };

  const contenu = await lireVersion({
    pathname: blob.pathname,
    uploadedAt: blob.uploadedAt,
    downloadUrl: blob.downloadUrl,
  });
  return { contenu: contenu ?? null, version: null };
}

/**
 * Écrit une nouvelle version d'un jeu de données.
 *
 * `version` est le chemin lu par `lireJson` : si une autre écriture est passée
 * entre-temps, la nôtre est refusée plutôt que d'effacer la sienne.
 */
export async function ecrireJson(
  dossier: string,
  valeur: unknown,
  version: string | null,
) {
  if (!blobConfigure()) {
    throw new Error(
      "Aucun store Vercel Blob n'est configuré : BLOB_READ_WRITE_TOKEN est absent.",
    );
  }

  const versions = await listerVersions(dossier);
  const actuelle = versions[0]?.pathname ?? null;
  if (actuelle !== version) throw new ConflitDeVersion();

  const horodatage = new Date().toISOString();
  const chemin = `${dossier}/${horodatage}-${crypto.randomUUID().slice(0, 8)}${EXTENSION}`;

  await put(chemin, JSON.stringify(valeur, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    // Le chemin est neuf : écraser quoi que ce soit signalerait un bug.
    allowOverwrite: false,
    // Une version n'est jamais réécrite : le CDN peut la garder longtemps sans
    // jamais rien servir de périmé.
    cacheControlMaxAge: 24 * 60 * 60,
  });

  if (await ecritureConcurrente(dossier, versions, chemin)) {
    // Notre version part avec : deux enregistrements simultanés repartent tous
    // deux avec un conflit à l'écran plutôt qu'un seul, silencieusement écrasé.
    await del(chemin).catch((erreur) =>
      console.error(`Version ${chemin} non retirée après conflit`, erreur),
    );
    throw new ConflitDeVersion();
  }

  // Le ménage ne doit jamais faire échouer un enregistrement déjà abouti.
  await rangerVersions(dossier, versions);
}

/**
 * Le contrôle de version est une lecture suivie d'une écriture : entre les
 * deux, un second onglet peut avoir déposé sa propre version, et le store n'a
 * pas de primitive qui refuserait la nôtre pour autant. On relit donc après
 * coup — si une version que nous n'avions pas vue est apparue, l'écriture est
 * annulée au lieu de recouvrir celle de l'autre.
 *
 * Un échec de cette relecture ne remet pas en cause l'enregistrement, qui a
 * abouti : on le trace et on le laisse passer.
 */
async function ecritureConcurrente(
  dossier: string,
  connues: Version[],
  nouvelle: string,
) {
  let apres: Version[];
  try {
    apres = await listerVersions(dossier);
  } catch (erreur) {
    console.error(`Relecture des versions de ${dossier} impossible`, erreur);
    return false;
  }

  const dejaVues = new Set([nouvelle, ...connues.map((v) => v.pathname)]);
  const survenues = apres.filter((version) => !dejaVues.has(version.pathname));
  if (survenues.length === 0) return false;

  console.warn(
    `Écriture concurrente sur ${dossier} : ${survenues.map((v) => v.pathname).join(", ")}`,
  );
  return true;
}

/**
 * Supprime les versions périmées d'un jeu de données. La précédente est
 * conservée : une lecture commencée avant l'écriture peut encore la demander.
 *
 * Le fichier de l'ancien format est repris par le ménage quotidien dès qu'une
 * version datée existe. Une sauvegarde historique ne doit pas rester publique
 * sans échéance ; le retour arrière relève d'une sauvegarde séparée et bornée.
 */
async function rangerVersions(dossier: string, precedentes: Version[]) {
  const aJeter = precedentes.slice(1).map((v) => v.pathname);
  if (aJeter.length === 0) return;

  try {
    await del(aJeter);
  } catch (erreur) {
    console.error(`Anciennes versions de ${dossier} non supprimées`, erreur);
  }
}

/**
 * Une version précédente protège les lectures déjà parties vers le CDN, dont
 * le cache peut vivre 24 heures. Passé ce délai elle n'a plus de finalité :
 * le ménage quotidien la supprime, ainsi que l'ancien fichier non versionné.
 *
 * La version courante est toujours gardée, quel que soit son âge.
 */
const AGE_MIN_VERSION_MS = 24 * 60 * 60 * 1000;

export type BilanPurgeVersions = {
  supprimees: number;
  echecs: number;
};

export async function purgerVersionsAnciennes(
  dossiers: string[],
): Promise<BilanPurgeVersions> {
  if (!blobConfigure()) return { supprimees: 0, echecs: 0 };

  const limite = Date.now() - AGE_MIN_VERSION_MS;
  let supprimees = 0;
  let echecs = 0;

  for (const dossier of dossiers) {
    try {
      const versions = await listerVersions(dossier);
      const aJeter = versions
        .slice(1)
        .filter((version) => version.uploadedAt.getTime() <= limite)
        .map((version) => version.pathname);

      // Transition de l'ancien format : il pouvait contenir une donnée retirée
      // depuis longtemps. Il n'est effacé que si une version actuelle existe.
      if (versions.length > 0) {
        const cheminHerite = dossier + EXTENSION;
        const page = await list({ prefix: cheminHerite });
        if (page.blobs.some((blob) => blob.pathname === cheminHerite)) {
          aJeter.push(cheminHerite);
        }
      }

      for (const chemin of aJeter) {
        try {
          console.info("Purge d'une ancienne version : " + chemin);
          await del(chemin);
          supprimees += 1;
        } catch (erreur) {
          echecs += 1;
          console.error("Ancienne version non supprimée : " + chemin, erreur);
        }
      }
    } catch (erreur) {
      echecs += 1;
      console.error("Purge des versions impossible pour " + dossier, erreur);
    }
  }

  return { supprimees, echecs };
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
