#!/usr/bin/env node
/**
 * Copie le contenu du store Vercel Blob vers le bucket Cloudflare R2.
 *
 *   node --env-file=.env scripts/migrer-vers-r2.mjs --essai   # ne fait que compter
 *   node --env-file=.env scripts/migrer-vers-r2.mjs           # copie pour de bon
 *
 * Il faut dans l'environnement à la fois BLOB_READ_WRITE_TOKEN (lecture de
 * l'ancien store) et les variables R2_* (voir `.env.example`).
 *
 * - Les photos de `annonces/` et `visuels/` sont copiées sous le même chemin.
 *   Celles déjà présentes dans R2 avec la même taille sont sautées : le script
 *   peut être relancé sans risque après une interruption.
 * - Pour `donnees/annonces` et `donnees/visuels`, seule la version courante est
 *   reprise, avec ses URLs Blob réécrites vers le domaine public R2, et déposée
 *   comme première version dans R2. Si R2 contient déjà une version, le jeu de
 *   données est laissé tel quel — `--forcer` en dépose une nouvelle par-dessus,
 *   ce qui efface les modifications faites depuis dans R2.
 *
 * Le script termine en vérifiant que chaque photo citée par les données
 * existe bien dans R2.
 */

import { list } from "@vercel/blob";
import {
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const ESSAI = process.argv.includes("--essai");
const FORCER = process.argv.includes("--forcer");

const DOSSIERS_IMAGES = ["annonces", "visuels"];
const JEUX_DE_DONNEES = ["donnees/annonces", "donnees/visuels"];
const NOM_VERSION = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z-[0-9a-f]{8}\.json$/;
const HOTE_BLOB = /https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//gi;
const CACHE_IMAGE = "public, max-age=31536000, immutable";

function exiger(nom) {
  const valeur = process.env[nom]?.trim();
  if (!valeur) {
    console.error(`Variable manquante : ${nom}`);
    process.exit(1);
  }
  return valeur;
}

exiger("BLOB_READ_WRITE_TOKEN");
const BUCKET = exiger("R2_BUCKET");
const ORIGINE_R2 = new URL(exiger("R2_PUBLIC_URL")).origin;

const r2 = new S3Client({
  region: "auto",
  endpoint: new URL(exiger("R2_ENDPOINT")).origin,
  forcePathStyle: true,
  credentials: {
    accessKeyId: exiger("R2_ACCESS_KEY_ID"),
    secretAccessKey: exiger("R2_SECRET_ACCESS_KEY"),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

async function listerBlob(prefixe) {
  const objets = [];
  let cursor;
  do {
    const page = await list({ prefix: prefixe, cursor });
    objets.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return objets;
}

async function listerR2(prefixe) {
  const cles = [];
  let ContinuationToken;
  do {
    const page = await r2.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefixe, ContinuationToken }),
    );
    for (const objet of page.Contents ?? []) cles.push(objet.Key);
    ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return cles;
}

async function tailleR2(cle) {
  try {
    const tete = await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: cle }));
    return tete.ContentLength ?? null;
  } catch (erreur) {
    if (erreur?.$metadata?.httpStatusCode === 404) return null;
    throw erreur;
  }
}

/** Le pare-feu de Vercel répond parfois 403 aux rafales : on patiente et on relance. */
async function telecharger(url) {
  const attentes = [0, 1_000, 2_000, 4_000, 8_000, 16_000];
  let derniere;
  for (const attente of attentes) {
    if (attente) await new Promise((r) => setTimeout(r, attente));
    const reponse = await fetch(url).catch((erreur) => ({ ok: false, status: 0, erreur }));
    if (reponse.ok) {
      return {
        octets: new Uint8Array(await reponse.arrayBuffer()),
        type: reponse.headers.get("content-type") ?? "application/octet-stream",
      };
    }
    derniere = reponse.status;
    if (reponse.status === 404) break;
  }
  throw new Error(`Lecture impossible (HTTP ${derniere || "sans réponse"}) : ${url}`);
}

// ------------------------------------------------------------------ photos

let copiees = 0;
let sautees = 0;
let echecs = 0;

for (const dossier of DOSSIERS_IMAGES) {
  const objets = await listerBlob(`${dossier}/`);
  console.log(`${dossier}/ : ${objets.length} photo(s) dans Blob.`);

  for (const objet of objets) {
    try {
      if ((await tailleR2(objet.pathname)) === objet.size) {
        sautees += 1;
        continue;
      }
      if (ESSAI) {
        console.log(`  à copier : ${objet.pathname}`);
        copiees += 1;
        continue;
      }
      const { octets, type } = await telecharger(objet.downloadUrl);
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: objet.pathname,
          Body: octets,
          ContentType: type,
          CacheControl: CACHE_IMAGE,
        }),
      );
      copiees += 1;
      console.log(`  copiée : ${objet.pathname}`);
    } catch (erreur) {
      echecs += 1;
      console.error(`  ÉCHEC ${objet.pathname} :`, erreur.message ?? erreur);
    }
  }
}

console.log(
  `Photos : ${copiees} ${ESSAI ? "à copier" : "copiée(s)"}, ${sautees} déjà présente(s), ${echecs} en échec.`,
);

// ----------------------------------------------------------------- données

const urlsCitees = new Set();

for (const jeu of JEUX_DE_DONNEES) {
  const versions = (await listerBlob(`${jeu}/`))
    .filter((objet) => NOM_VERSION.test(objet.pathname.slice(jeu.length + 1)))
    .sort(
      (a, b) =>
        new Date(b.uploadedAt) - new Date(a.uploadedAt) ||
        b.pathname.localeCompare(a.pathname),
    );
  // Avant l'écriture versionnée, le jeu de données tenait dans `<jeu>.json`.
  const source =
    versions[0] ?? (await listerBlob(`${jeu}.json`)).find((o) => o.pathname === `${jeu}.json`);

  if (!source) {
    console.log(`${jeu} : rien dans Blob.`);
    continue;
  }

  const { octets } = await telecharger(source.downloadUrl);
  const texte = new TextDecoder().decode(octets).replace(HOTE_BLOB, `${ORIGINE_R2}/`);
  const contenu = JSON.parse(texte);
  for (const url of texte.match(new RegExp(`${ORIGINE_R2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[^"\\s]+`, "g")) ?? []) {
    urlsCitees.add(url);
  }

  const dejaDansR2 = (await listerR2(`${jeu}/`)).some((cle) =>
    NOM_VERSION.test(cle.slice(jeu.length + 1)),
  );
  if (dejaDansR2 && !FORCER) {
    console.log(`${jeu} : R2 a déjà une version, laissée telle quelle (--forcer pour remplacer).`);
    continue;
  }

  const cle = `${jeu}/${new Date().toISOString()}-${crypto.randomUUID().slice(0, 8)}.json`;
  if (ESSAI) {
    console.log(`${jeu} : ${source.pathname} serait déposé sous ${cle}.`);
    continue;
  }
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: cle,
      Body: JSON.stringify(contenu, null, 2),
      ContentType: "application/json",
      CacheControl: "public, max-age=86400, immutable",
    }),
  );
  console.log(`${jeu} : ${source.pathname} → ${cle}`);
}

// --------------------------------------------------------------- contrôle

if (!ESSAI) {
  const presentes = new Set(
    (await Promise.all(DOSSIERS_IMAGES.map((d) => listerR2(`${d}/`)))).flat(),
  );
  const manquantes = [...urlsCitees].filter(
    (url) => !presentes.has(url.slice(ORIGINE_R2.length + 1)),
  );
  if (manquantes.length > 0) {
    console.error(`${manquantes.length} photo(s) citée(s) mais absente(s) de R2 :`);
    for (const url of manquantes) console.error(`  ${url}`);
    process.exitCode = 1;
  } else {
    console.log(`Contrôle : les ${urlsCitees.size} photo(s) citée(s) sont dans R2.`);
  }
}

if (echecs > 0) process.exitCode = 1;
