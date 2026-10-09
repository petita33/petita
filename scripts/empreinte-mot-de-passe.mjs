#!/usr/bin/env node
/**
 * Génère la valeur d'`ADMIN_PASSWORD_HASH` à partir d'un mot de passe saisi.
 *
 *   npm run empreinte-mot-de-passe
 *
 * Le mot de passe n'est ni affiché, ni écrit sur le disque, ni passé en
 * argument — il ne finit donc pas dans l'historique du terminal. Copier la
 * ligne obtenue dans `.env` et dans les variables du projet Vercel, puis
 * supprimer `ADMIN_PASSWORD` : tant qu'`ADMIN_PASSWORD_HASH` est renseigné,
 * c'est lui qui fait foi.
 */

import { pbkdf2, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { promisify } from "node:util";

// Recommandation OWASP pour PBKDF2-HMAC-SHA256 : casser une empreinte volée
// coûte alors autant de calcul que d'en vérifier une, six cent mille fois.
const ITERATIONS = 600_000;
const LONGUEUR_OCTETS = 32;

const deriver = promisify(pbkdf2);

/** Saisie sans écho : le terminal n'affiche rien pendant la frappe. */
function demanderMotDePasse(question) {
  const lecture = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  return new Promise((resoudre) => {
    lecture.question(question, (reponse) => {
      lecture.close();
      process.stdout.write("\n");
      resoudre(reponse);
    });
    // Appelé par readline à chaque caractère : on n'en réaffiche aucun.
    lecture._writeToOutput = (texte) => {
      if (texte.startsWith(question)) process.stdout.write(question);
    };
  });
}

const motDePasse = await demanderMotDePasse("Mot de passe de l'administration : ");
if (motDePasse.length < 12) {
  console.error(
    "\nMot de passe trop court : douze caractères au minimum, une phrase de passe de préférence.",
  );
  process.exit(1);
}

const verification = await demanderMotDePasse("Confirmez le mot de passe    : ");
if (verification !== motDePasse) {
  console.error("\nLes deux saisies diffèrent. Rien n'a été généré.");
  process.exit(1);
}

const sel = randomBytes(16);
const empreinte = await deriver(
  motDePasse,
  sel,
  ITERATIONS,
  LONGUEUR_OCTETS,
  "sha256",
);

console.log(
  `\nADMIN_PASSWORD_HASH=pbkdf2$${ITERATIONS}$${sel.toString("base64url")}$${empreinte.toString("base64url")}\n`,
);
console.log(
  "Copiez cette ligne dans .env et dans Vercel → Settings → Environment Variables,",
);
console.log("puis supprimez ADMIN_PASSWORD des deux endroits.");
