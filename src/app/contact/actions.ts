"use server";

import { envoyerMessageContact } from "@/lib/contact";

/**
 * `valeurs` est renvoyé en cas d'échec : React réinitialise le formulaire après
 * une action, ces valeurs le repeuplent pour ne pas faire retaper la saisie.
 */
export type EtatContact =
  | {
      ok: boolean;
      message: string;
      valeurs?: { nom: string; email: string; message: string };
    }
  | undefined;

const LIMITE_NOM = 120;
const LIMITE_EMAIL = 200;
const LIMITE_MESSAGE = 4000;

const CONFIRMATION = "Merci, votre message est bien parti. Nous répondons sous 48 heures.";
const SECOURS =
  "L'envoi a échoué. Réessayez, ou écrivez-nous directement à petita-lumieres@protonmail.com.";

/** Replie la saisie sur une seule ligne : le nom finit dans l'objet du mail. */
function ligne(brut: FormDataEntryValue | null) {
  return String(brut ?? "").replace(/\s+/g, " ").trim();
}

export async function envoyerContact(
  _etat: EtatContact,
  donnees: FormData,
): Promise<EtatContact> {
  const nom = ligne(donnees.get("nom"));
  const email = ligne(donnees.get("email"));
  const message = String(donnees.get("message") ?? "").trim();

  // Champ leurre : invisible pour un visiteur, rempli par les robots qui
  // remplissent tout. On confirme sans rien envoyer plutôt que de refuser,
  // pour ne pas leur indiquer ce qui a bloqué.
  if (ligne(donnees.get("site")) !== "") return { ok: true, message: CONFIRMATION };

  const echec = (raison: string): EtatContact => ({
    ok: false,
    message: raison,
    valeurs: { nom, email, message },
  });

  // Les contraintes du navigateur (`required`, `type="email"`) ne valent rien :
  // une Server Action est joignable par POST direct.
  if (!nom || !email || !message) return echec("Merci de remplir tous les champs.");
  if (nom.length > LIMITE_NOM) {
    return echec(`Le nom ne doit pas dépasser ${LIMITE_NOM} caractères.`);
  }
  if (email.length > LIMITE_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return echec("Cette adresse e-mail semble incorrecte.");
  }
  if (message.length > LIMITE_MESSAGE) {
    return echec(`Le message ne doit pas dépasser ${LIMITE_MESSAGE} caractères.`);
  }

  try {
    await envoyerMessageContact({ nom, email, message });
  } catch (erreur) {
    // La cause exacte (clé absente, domaine non vérifié…) reste dans les logs :
    // elle ne dit rien d'utile au visiteur et renseignerait un attaquant.
    console.error("Envoi du message de contact impossible", erreur);
    return echec(SECOURS);
  }

  return { ok: true, message: CONFIRMATION };
}
