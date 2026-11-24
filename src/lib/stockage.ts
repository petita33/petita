/**
 * Accès bas niveau au bucket Cloudflare R2, partagé par les jeux de données du
 * site et par les photos.
 *
 * Chaque jeu de données tient dans un seul JSON, mais celui-ci n'est jamais
 * réécrit sur place : chaque enregistrement dépose un fichier daté dans le
 * dossier du jeu de données, et le plus récent fait foi. L'ancien fichier
 * reste lisible le temps qu'une lecture déjà partie l'obtienne, et un
 * enregistrement concurrent se voit dans la liste au lieu de s'écraser.
 *
 * Les lectures passent par l'API S3 du bucket, jamais par son domaine public :
 * R2 y est fortement cohérent, une version écrite est donc lue aussitôt, sans
 * cache CDN ni pare-feu entre les deux.
 */

import "server-only";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cheminDepuisUrl, originePublique, pointAccesR2, urlPublique } from "./store";

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

const VARIABLES = [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
] as const;

export function variablesManquantes() {
  return VARIABLES.filter((nom) => !process.env[nom]?.trim());
}

export function stockageConfigure() {
  return variablesManquantes().length === 0 && Boolean(pointAccesR2() && originePublique());
}

function messageNonConfigure() {
  const manquantes = variablesManquantes();
  return manquantes.length > 0
    ? `Stockage R2 non configuré : ${manquantes.join(", ")} absente(s).`
    : "Stockage R2 non configuré : R2_ENDPOINT ou R2_PUBLIC_URL n'est pas une URL valide.";
}

let client: S3Client | undefined;

function r2() {
  if (!stockageConfigure()) throw new Error(messageNonConfigure());
  client ??= new S3Client({
    region: "auto",
    endpoint: pointAccesR2()!,
    // Chemin `/<bucket>/<objet>` sur l'hôte du compte : c'est cette seule
    // origine que la CSP de l'admin et la règle CORS du bucket ont à connaître.
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    // Les sommes de contrôle ajoutées d'office par les SDK récents ne sont pas
    // toutes acceptées par R2, et cassent les URLs d'envoi signées.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

function bucket() {
  return process.env.R2_BUCKET!;
}

const EXTENSION = ".json";

/**
 * Le nom d'une version, tel que `ecrireJson` le compose : horodatage ISO, tiret,
 * huit caractères tirés au sort, `.json`.
 *
 * Tout objet qui ne suit pas cette convention est ignoré à la lecture comme au
 * ménage. C'est ce qui empêche un objet déposé par erreur sous un dossier de
 * données d'être pris pour la version courante et de rendre le catalogue
 * illisible.
 */
const NOM_VERSION = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z-[0-9a-f]{8}\.json$/;

type Objet = {
  chemin: string;
  modifieLe: Date;
};

/** Tous les objets sous `dossier/`, pagination comprise. */
async function listerObjets(dossier: string): Promise<Objet[]> {
  const objets: Objet[] = [];
  let curseur: string | undefined;

  do {
    const page = await r2().send(
      new ListObjectsV2Command({
        Bucket: bucket(),
        Prefix: `${dossier}/`,
        ContinuationToken: curseur,
      }),
    );
    for (const objet of page.Contents ?? []) {
      if (!objet.Key || !objet.LastModified) continue;
      objets.push({ chemin: objet.Key, modifieLe: objet.LastModified });
    }
    curseur = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (curseur);

  return objets;
}

/** Les versions d'un jeu de données, la plus récente en tête. */
async function listerVersions(dossier: string): Promise<Objet[]> {
  const versions: Objet[] = [];
  const intrus: string[] = [];

  for (const objet of await listerObjets(dossier)) {
    if (NOM_VERSION.test(objet.chemin.slice(dossier.length + 1))) {
      versions.push(objet);
    } else {
      intrus.push(objet.chemin);
    }
  }

  if (intrus.length > 0) {
    // Laissé en place plutôt que supprimé : le site continue de fonctionner, et
    // ce qui a atterri là mérite d'être regardé avant d'être jeté.
    console.error(
      `Objet(s) inattendu(s) sous ${dossier}/, ignoré(s) : ${intrus.join(", ")}`,
    );
  }

  // Le nom porte l'horodatage de l'écriture : il départage deux versions que le
  // bucket daterait de la même seconde.
  return versions.sort(
    (a, b) =>
      b.modifieLe.getTime() - a.modifieLe.getTime() ||
      b.chemin.localeCompare(a.chemin),
  );
}

/** Le fichier a bien été lu, mais son contenu n'est pas exploitable. */
class VersionIllisible extends Error {}

function introuvable(erreur: unknown) {
  return (erreur as { name?: string }).name === "NoSuchKey";
}

async function lireVersion(chemin: string): Promise<unknown | undefined> {
  let texte: string;
  try {
    const reponse = await r2().send(
      new GetObjectCommand({ Bucket: bucket(), Key: chemin }),
    );
    texte = (await reponse.Body?.transformToString("utf-8")) ?? "";
  } catch (erreur) {
    // Version supprimée par le ménage d'une écriture concurrente : l'appelant se
    // rabattra sur la précédente.
    if (introuvable(erreur)) return undefined;
    throw erreur;
  }

  try {
    return JSON.parse(texte);
  } catch {
    throw new VersionIllisible(`Le fichier ${chemin} n'est pas un JSON valide.`);
  }
}

/**
 * Lit la dernière version d'un jeu de données, avec de quoi la réécrire.
 *
 * Renvoie un contenu nul tant que rien n'a jamais été écrit — ou tant que R2
 * n'est pas configuré (dev local sans variables), pour que le site public
 * reste affichable. Une panne, elle, lève : « absent » ne veut jamais dire
 * « en échec ». C'est ce qui rend sûr le balayage des images orphelines, qui
 * déduit de ces JSON ce qui est encore référencé — une panne prise pour
 * « aucune annonce » lui ferait supprimer des photos bien vivantes.
 */
export async function lireJson(dossier: string): Promise<InstantaneJson> {
  if (!stockageConfigure()) {
    console.warn(`${messageNonConfigure()} ${dossier} ne peut pas être lu.`);
    return { contenu: null, version: null };
  }

  const versions = await listerVersions(dossier);
  if (versions.length === 0) return { contenu: null, version: null };

  let derniereErreur: unknown;
  for (const version of versions) {
    try {
      const contenu = await lireVersion(version.chemin);
      if (contenu !== undefined) return { contenu, version: version.chemin };
    } catch (erreur) {
      // Un bucket injoignable n'est pas une version corrompue : se rabattre sur
      // la précédente servirait un catalogue périmé, que le cache public
      // garderait jusqu'au prochain enregistrement.
      if (!(erreur instanceof VersionIllisible)) throw erreur;
      // Version illisible — JSON tronqué, contenu inattendu : on se rabat sur la
      // précédente plutôt que de rendre tout le site indisponible. L'écriture
      // suivante repartira alors en conflit, ce qui est le bon moment pour venir
      // regarder ce qui traîne dans le dossier.
      console.error(`Version ${version.chemin} ignorée`, erreur);
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
  if (!stockageConfigure()) throw new Error(messageNonConfigure());

  const versions = await listerVersions(dossier);
  const actuelle = versions[0]?.chemin ?? null;
  if (actuelle !== version) throw new ConflitDeVersion();

  const horodatage = new Date().toISOString();
  const chemin = `${dossier}/${horodatage}-${crypto.randomUUID().slice(0, 8)}${EXTENSION}`;

  await r2().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: chemin,
      Body: JSON.stringify(valeur, null, 2),
      ContentType: "application/json",
      // Une version n'est jamais réécrite : un cache peut la garder sans
      // jamais rien servir de périmé.
      CacheControl: "public, max-age=86400, immutable",
    }),
  );

  if (await ecritureConcurrente(dossier, versions, chemin)) {
    // Notre version part avec : deux enregistrements simultanés repartent tous
    // deux avec un conflit à l'écran plutôt qu'un seul, silencieusement écrasé.
    await supprimerObjets([chemin]).catch((erreur) =>
      console.error(`Version ${chemin} non retirée après conflit`, erreur),
    );
    throw new ConflitDeVersion();
  }

  // Le ménage ne doit jamais faire échouer un enregistrement déjà abouti.
  await rangerVersions(dossier, versions);
}

/**
 * Le contrôle de version est une lecture suivie d'une écriture : entre les
 * deux, un second onglet peut avoir déposé sa propre version. On relit donc
 * après coup — si une version que nous n'avions pas vue est apparue,
 * l'écriture est annulée au lieu de recouvrir celle de l'autre.
 *
 * Un échec de cette relecture ne remet pas en cause l'enregistrement, qui a
 * abouti : on le trace et on le laisse passer.
 */
async function ecritureConcurrente(
  dossier: string,
  connues: Objet[],
  nouvelle: string,
) {
  let apres: Objet[];
  try {
    apres = await listerVersions(dossier);
  } catch (erreur) {
    console.error(`Relecture des versions de ${dossier} impossible`, erreur);
    return false;
  }

  const dejaVues = new Set([nouvelle, ...connues.map((v) => v.chemin)]);
  const survenues = apres.filter((version) => !dejaVues.has(version.chemin));
  if (survenues.length === 0) return false;

  console.warn(
    `Écriture concurrente sur ${dossier} : ${survenues.map((v) => v.chemin).join(", ")}`,
  );
  return true;
}

/**
 * Supprime les versions périmées d'un jeu de données. La précédente est
 * conservée : une lecture commencée avant l'écriture peut encore la demander.
 */
async function rangerVersions(dossier: string, precedentes: Objet[]) {
  const aJeter = precedentes.slice(1).map((v) => v.chemin);
  if (aJeter.length === 0) return;

  const { echecs } = await supprimerObjets(aJeter);
  if (echecs.length > 0) {
    console.error(`Anciennes versions de ${dossier} non supprimées : ${echecs.join(", ")}`);
  }
}

/**
 * Une version précédente protège les lectures déjà parties. Passé 24 heures
 * elle n'a plus de finalité : le ménage quotidien la supprime.
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
  if (!stockageConfigure()) return { supprimees: 0, echecs: 0 };

  const limite = Date.now() - AGE_MIN_VERSION_MS;
  let supprimees = 0;
  let echecs = 0;

  for (const dossier of dossiers) {
    try {
      const versions = await listerVersions(dossier);
      const aJeter = versions
        .slice(1)
        .filter((version) => version.modifieLe.getTime() <= limite)
        .map((version) => version.chemin);
      if (aJeter.length === 0) continue;

      console.info(`Purge d'anciennes versions : ${aJeter.join(", ")}`);
      const bilan = await supprimerObjets(aJeter);
      supprimees += bilan.supprimes.length;
      echecs += bilan.echecs.length;
      for (const chemin of bilan.echecs) {
        console.error("Ancienne version non supprimée : " + chemin);
      }
    } catch (erreur) {
      echecs += 1;
      console.error("Purge des versions impossible pour " + dossier, erreur);
    }
  }

  return { supprimees, echecs };
}

/**
 * Supprime des objets par lots de 1 000, la limite de l'API. Un objet déjà
 * absent compte comme supprimé ; une erreur sur l'un n'arrête pas les autres.
 */
async function supprimerObjets(chemins: string[]) {
  const supprimes: string[] = [];
  const echecs: string[] = [];

  for (let debut = 0; debut < chemins.length; debut += 1000) {
    const lot = chemins.slice(debut, debut + 1000);
    try {
      const reponse = await r2().send(
        new DeleteObjectsCommand({
          Bucket: bucket(),
          Delete: { Objects: lot.map((Key) => ({ Key })), Quiet: true },
        }),
      );
      const enErreur = new Set((reponse.Errors ?? []).map((e) => e.Key));
      for (const chemin of lot) {
        (enErreur.has(chemin) ? echecs : supprimes).push(chemin);
      }
    } catch (erreur) {
      console.error(`Suppression de ${lot.length} objet(s) impossible`, erreur);
      echecs.push(...lot);
    }
  }

  return { supprimes, echecs };
}

export type ResultatSuppression = {
  supprimees: string[];
  /** URLs restées dans le bucket. Le balayage des orphelines les reprendra. */
  echecs: string[];
};

/**
 * Supprime des images du bucket, désignées par leur URL publique.
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

  const parChemin = new Map<string, string>();
  const etrangeres: string[] = [];
  for (const url of urls) {
    const chemin = cheminDepuisUrl(url);
    if (chemin) parChemin.set(chemin, url);
    else etrangeres.push(url);
  }

  if (etrangeres.length > 0) {
    // Une URL d'un autre hôte — par exemple restée de l'ancien stockage — ne
    // peut pas être supprimée d'ici.
    console.error(`URL(s) hors du bucket, non supprimée(s) (${contexte}) : ${etrangeres.join(", ")}`);
  }

  let bilan = { supprimes: [] as string[], echecs: [...parChemin.keys()] };
  if (parChemin.size > 0 && stockageConfigure()) {
    bilan = await supprimerObjets([...parChemin.keys()]);
  }

  const supprimees = bilan.supprimes.map((chemin) => parChemin.get(chemin)!);
  const echecs = [...bilan.echecs.map((chemin) => parChemin.get(chemin)!), ...etrangeres];

  if (echecs.length > 0) {
    console.error(
      `${echecs.length} image(s) restée(s) dans le bucket (${contexte}) : ${echecs.join(", ")}. ` +
        "Elles seront reprises au prochain balayage des orphelines.",
    );
  }

  return { supprimees, echecs };
}

export type ImageStockee = {
  url: string;
  chemin: string;
  deposeeLe: Date;
};

/** Toutes les images d'un dossier du bucket, pagination comprise. */
export async function listerImages(dossier: string): Promise<ImageStockee[]> {
  return (await listerObjets(dossier)).map((objet) => ({
    url: urlPublique(objet.chemin),
    chemin: objet.chemin,
    deposeeLe: objet.modifieLe,
  }));
}

/** Une image ne change jamais d'adresse : elle peut rester en cache un an. */
export const CACHE_IMAGE = "public, max-age=31536000, immutable";

/**
 * Une URL d'envoi signée, valable `validiteSecondes`, qui n'autorise que le
 * dépôt de ce chemin, avec ce type et cette taille exacts : le navigateur doit
 * renvoyer les mêmes en-têtes, sans quoi R2 refuse la signature.
 */
export async function urlEnvoiSignee(
  chemin: string,
  type: string,
  taille: number,
  validiteSecondes: number,
) {
  return getSignedUrl(
    r2(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: chemin,
      ContentType: type,
      ContentLength: taille,
      CacheControl: CACHE_IMAGE,
    }),
    {
      expiresIn: validiteSecondes,
      signableHeaders: new Set(["content-type", "content-length", "cache-control"]),
    },
  );
}
