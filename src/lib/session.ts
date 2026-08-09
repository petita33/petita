/**
 * Session admin : un mot de passe unique, une session signée en cookie httpOnly.
 *
 * Le jeton est `<payload base64url>.<HMAC-SHA256 base64url>`. Aucune donnée
 * sensible n'y transite, uniquement une date d'expiration.
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

async function cle() {
  return crypto.subtle.importKey(
    "raw",
    encodeur.encode(lireSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
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

async function signer(valeur: string) {
  return versBase64Url(
    await crypto.subtle.sign("HMAC", await cle(), encodeur.encode(valeur)),
  );
}

/**
 * Comparaison en temps constant : on compare les HMAC plutôt que les chaînes,
 * ce qui ne laisse fuiter ni la longueur ni les caractères du mot de passe.
 */
async function egaliteSure(a: string, b: string) {
  const [signatureA, signatureB] = await Promise.all([signer(a), signer(b)]);
  return signatureA === signatureB;
}

export async function motDePasseValide(motDePasse: string) {
  const attendu = process.env.ADMIN_PASSWORD;
  if (!attendu) {
    throw new Error("ADMIN_PASSWORD n'est pas défini. Voir .env.example.");
  }
  return egaliteSure(motDePasse, attendu);
}

export async function creerJeton(expiration: number) {
  const charge = versBase64Url(encodeur.encode(JSON.stringify({ exp: expiration })));
  return `${charge}.${await signer(charge)}`;
}

/** Vérifie signature + expiration. Utilisable depuis le proxy comme depuis une action. */
export async function jetonValide(jeton: string | undefined | null) {
  if (!jeton) return false;
  const separateur = jeton.lastIndexOf(".");
  if (separateur < 1) return false;

  const charge = jeton.slice(0, separateur);
  const signature = jeton.slice(separateur + 1);
  if (!(await egaliteSure(signature, await signer(charge)))) return false;

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
