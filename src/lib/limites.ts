/**
 * Limitation de fréquence des points d'entrée publics et d'administration.
 *
 * Portée réelle, à ne pas surestimer : les compteurs vivent dans la mémoire de
 * l'instance qui répond. Vercel réutilise une instance chaude pour les requêtes
 * qui s'enchaînent — c'est exactement le cas d'une rafale, donc la rafale est
 * bien freinée — mais une montée en charge répartie sur plusieurs instances
 * multiplie d'autant les plafonds, et un redémarrage remet les compteurs à
 * zéro. C'est une première couche, pas la limitation distribuée que réclame
 * l'audit : celle-là se règle au niveau du pare-feu Vercel (WAF), avec des
 * plafonds de dépense et des alertes de volume, et se configure hors du code.
 *
 * Les adresses IP ne sont jamais stockées telles quelles : seule une empreinte
 * tronquée, salée par une valeur tirée au démarrage du processus, sert de clé.
 * Elle ne survit donc pas à l'instance et ne permet aucun recoupement ultérieur.
 */

import "server-only";
import { headers } from "next/headers";

type Fenetre = { expireLe: number; compte: number };

const compteurs = new Map<string, Fenetre>();

/** Au-delà, on purge : une mémoire de fonction serverless n'est pas un cache. */
const MAX_ENTREES = 5_000;

const SEL = crypto.randomUUID();

function purger(maintenant: number) {
  for (const [cle, fenetre] of compteurs) {
    if (fenetre.expireLe <= maintenant) compteurs.delete(cle);
  }
  // Toujours trop d'entrées vivantes : on sacrifie les plus anciennes, que
  // `Map` restitue dans l'ordre d'insertion.
  if (compteurs.size <= MAX_ENTREES) return;
  const trop = compteurs.size - MAX_ENTREES;
  let index = 0;
  for (const cle of compteurs.keys()) {
    if (index >= trop) break;
    compteurs.delete(cle);
    index += 1;
  }
}

/**
 * Décompte une tentative. Renvoie `false` quand le plafond est atteint pour la
 * fenêtre en cours — l'appelant refuse alors sans rien exécuter de coûteux.
 */
export function consommer(cle: string, max: number, fenetreMs: number) {
  const maintenant = Date.now();
  if (compteurs.size >= MAX_ENTREES) purger(maintenant);

  const fenetre = compteurs.get(cle);
  if (!fenetre || fenetre.expireLe <= maintenant) {
    compteurs.set(cle, { expireLe: maintenant + fenetreMs, compte: 1 });
    return true;
  }

  fenetre.compte += 1;
  return fenetre.compte <= max;
}

/** Pose un repère temporaire, par exemple pour reconnaître un doublon. */
export function marquer(cle: string, dureeMs: number) {
  compteurs.set(cle, { expireLe: Date.now() + dureeMs, compte: 1 });
}

export function estMarque(cle: string) {
  const fenetre = compteurs.get(cle);
  return Boolean(fenetre && fenetre.expireLe > Date.now());
}

/** Empreinte courte et salée d'une valeur : rien d'identifiant n'est conservé. */
export async function empreinte(valeur: string) {
  const condensat = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${SEL}:${valeur}`),
  );
  return Array.from(new Uint8Array(condensat).slice(0, 8))
    .map((octet) => octet.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * De quoi distinguer un appelant sans le nommer. Derrière Vercel, la première
 * adresse de `x-forwarded-for` est celle du client, les suivantes sont les
 * relais traversés. Une IP partagée regroupe plusieurs visiteurs : les plafonds
 * doivent rester assez larges pour ne pas bloquer un réseau d'entreprise ou un
 * partage de connexion.
 */
export async function empreinteAppelant() {
  const entetes = await headers();
  const adresse =
    entetes.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    entetes.get("x-real-ip") ||
    "inconnu";
  return empreinte(adresse);
}
