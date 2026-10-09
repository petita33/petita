/**
 * Session admin : un mot de passe unique, une session signée en cookie httpOnly.
 *
 * Le jeton est `<payload base64url>.<HMAC-SHA256 base64url>`. Aucune donnée
 * sensible n'y transite, uniquement une date d'expiration.
 *
 * `ADMIN_SESSION_SECRET` n'est jamais utilisé tel quel : chaque usage travaille
 * avec une clé dérivée qui lui est propre (séparation de domaine). Une faiblesse
 * découverte sur l'un ne donne rien sur l'autre, et deux usages ne peuvent pas
 * se signer mutuellement des valeurs.
 */

import { cookies } from "next/headers";

export const NOM_COOKIE = "petita_admin";

const DUREE_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
const encodeur = new TextEncoder();

function lireSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET n'est pas défini. Voir .env.example.",
    );
  }
  return secret;
}

/** Les usages du secret, chacun avec sa propre clé dérivée. */
type Usage = "session" | "mot-de-passe";

const clesDerivees = new Map<Usage, Promise<CryptoKey>>();

/**
 * Clé propre à un usage : HMAC(secret, « petita:<usage>:v1 ») sert de matériel,
 * réimporté en clé HMAC. Seuls les primitifs HMAC sont employés, ce qui reste
 * valable dans tous les runtimes où ce module tourne (proxy compris).
 */
async function deriverCle(usage: Usage) {
  const racine = await crypto.subtle.importKey(
    "raw",
    encodeur.encode(lireSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const materiel = await crypto.subtle.sign(
    "HMAC",
    racine,
    encodeur.encode(`petita:${usage}:v1`),
  );
  return crypto.subtle.importKey(
    "raw",
    materiel,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function cle(usage: Usage) {
  const dejaDerivee = clesDerivees.get(usage);
  if (dejaDerivee) return dejaDerivee;

  const derivation = deriverCle(usage);
  clesDerivees.set(usage, derivation);
  return derivation;
}

function versBase64Url(octets: ArrayBuffer | Uint8Array) {
  const vue = octets instanceof Uint8Array ? octets : new Uint8Array(octets);
  let binaire = "";
  for (const octet of vue) binaire += String.fromCharCode(octet);
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function depuisBase64Url(texte: string) {
  const base64 = texte.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}

function octetsDepuisBase64Url(texte: string) {
  const binaire = depuisBase64Url(texte);
  return Uint8Array.from(binaire, (caractere) => caractere.charCodeAt(0));
}

async function signer(valeur: string, usage: Usage) {
  return versBase64Url(
    await crypto.subtle.sign("HMAC", await cle(usage), encodeur.encode(valeur)),
  );
}

/**
 * Comparaison à temps constant de deux chaînes.
 *
 * `===` s'arrête au premier caractère différent : la durée de la comparaison
 * renseigne alors sur le nombre de caractères devinés. On parcourt donc toute
 * la longueur en accumulant les écarts. Les longueurs, elles, sont publiques
 * ici : ce sont toujours celles d'une empreinte de taille fixe.
 *
 * `crypto.timingSafeEqual` de Node ferait le même travail, mais ce module est
 * aussi chargé par le proxy : on s'en tient à ce qui ne dépend d'aucun runtime.
 */
function egaliteConstante(a: string, b: string) {
  if (a.length !== b.length) return false;

  let ecart = 0;
  for (let index = 0; index < a.length; index += 1) {
    ecart |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return ecart === 0;
}

/**
 * Compare deux valeurs sans que la durée ne renseigne sur leur contenu : on
 * compare leurs HMAC plutôt que les chaînes elles-mêmes, ce qui ne laisse fuiter
 * ni la longueur ni les caractères de la valeur secrète.
 */
async function egaliteSure(a: string, b: string, usage: Usage) {
  const [signatureA, signatureB] = await Promise.all([
    signer(a, usage),
    signer(b, usage),
  ]);
  return egaliteConstante(signatureA, signatureB);
}

/**
 * Empreinte lente d'un mot de passe, au format
 * `pbkdf2$<itérations>$<sel base64url>$<empreinte base64url>`.
 *
 * Renseigner `ADMIN_PASSWORD_HASH` évite de garder le mot de passe en clair
 * dans les variables d'environnement : une fuite du tableau de bord Vercel ne
 * livre alors qu'une empreinte coûteuse à casser. Générer la valeur avec
 * `npm run empreinte-mot-de-passe`.
 */
async function empreinteValide(motDePasse: string, empreinte: string) {
  const [algorithme, iterations, sel, attendu] = empreinte.split("$");
  if (algorithme !== "pbkdf2" || !iterations || !sel || !attendu) {
    throw new Error(
      "ADMIN_PASSWORD_HASH est mal formé. Regénérez-le avec `npm run empreinte-mot-de-passe`.",
    );
  }

  const tours = Number(iterations);
  if (!Number.isInteger(tours) || tours < 1) {
    throw new Error("ADMIN_PASSWORD_HASH annonce un nombre d'itérations invalide.");
  }

  const materiel = await crypto.subtle.importKey(
    "raw",
    encodeur.encode(motDePasse),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: octetsDepuisBase64Url(sel),
      iterations: tours,
    },
    materiel,
    256,
  );

  return egaliteConstante(versBase64Url(bits), attendu);
}

export async function motDePasseValide(motDePasse: string) {
  const empreinte = process.env.ADMIN_PASSWORD_HASH;
  if (empreinte) return empreinteValide(motDePasse, empreinte);

  const attendu = process.env.ADMIN_PASSWORD;
  if (!attendu) {
    throw new Error(
      "Ni ADMIN_PASSWORD_HASH ni ADMIN_PASSWORD ne sont définis. Voir .env.example.",
    );
  }
  return egaliteSure(motDePasse, attendu, "mot-de-passe");
}

export async function creerJeton(expiration: number) {
  const charge = versBase64Url(encodeur.encode(JSON.stringify({ exp: expiration })));
  return `${charge}.${await signer(charge, "session")}`;
}

/** Vérifie signature + expiration. Utilisable depuis le proxy comme depuis une action. */
export async function jetonValide(jeton: string | undefined | null) {
  if (!jeton) return false;
  const separateur = jeton.lastIndexOf(".");
  if (separateur < 1) return false;

  const charge = jeton.slice(0, separateur);
  const signature = jeton.slice(separateur + 1);
  if (!egaliteConstante(signature, await signer(charge, "session"))) return false;

  try {
    const { exp } = JSON.parse(depuisBase64Url(charge)) as { exp?: number };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export async function ouvrirSession() {
  const expiration = Date.now() + DUREE_SESSION_MS;
  const magasin = await cookies();
  magasin.set(NOM_COOKIE, await creerJeton(expiration), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiration),
  });
}

export async function fermerSession() {
  (await cookies()).delete(NOM_COOKIE);
}

export async function sessionActive() {
  return jetonValide((await cookies()).get(NOM_COOKIE)?.value);
}
