"use server";

import { envoyerMessageContact } from "@/lib/contact";
import {
  consommer,
  empreinte,
  empreinteAppelant,
  estMarque,
  marquer,
} from "@/lib/limites";

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
const TROP_DE_MESSAGES =
  "Plusieurs messages ont déjà été envoyés depuis cette connexion. Patientez quelques minutes, ou écrivez-nous directement à petita-lumieres@protonmail.com.";

/**
 * Plafonds anti-rafale, sur quinze minutes glissantes.
 *
 * Deux compteurs plutôt qu'un : les tentatives, larges, arrêtent une rafale
 * avant tout traitement, y compris quand elle n'envoie que des formulaires
 * incomplets ; les envois, serrés, bornent ce qui part réellement dans la boîte
 * et consomme le quota Resend. Un visiteur qui se trompe trois fois de suite ne
 * touche donc pas au second.
 *
 * Une adresse partagée — entreprise, partage de connexion, réseau mobile —
 * regroupe plusieurs visiteurs : le plafond par connexion reste assez large
 * pour ne bloquer personne de bonne foi, et le plafond global prend le relais
 * quand la rafale se répartit sur beaucoup d'adresses.
 */
const TENTATIVES_PAR_CONNEXION = 30;
const ENVOIS_PAR_CONNEXION = 5;
const ENVOIS_TOUTES_CONNEXIONS = 20;
const FENETRE_MS = 15 * 60 * 1000;

/** Durée pendant laquelle un message identique n'est pas renvoyé deux fois. */
const DOUBLON_MS = 30 * 60 * 1000;

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

  const echec = (raison: string): EtatContact => ({
    ok: false,
    message: raison,
    valeurs: { nom, email, message },
  });

  // Le champ leurre et les limites de longueur ne coûtent rien à contourner en
  // appelant la Server Action directement : le décompte des tentatives passe
  // donc avant tout le reste, et compte aussi celles des robots.
  const appelant = await empreinteAppelant();
  if (!consommer(`contact:tentatives:${appelant}`, TENTATIVES_PAR_CONNEXION, FENETRE_MS)) {
    console.warn(`Plafond de tentatives atteint (appelant ${appelant}).`);
    return echec(TROP_DE_MESSAGES);
  }

  // Champ leurre : invisible pour un visiteur, rempli par les robots qui
  // remplissent tout. On confirme sans rien envoyer plutôt que de refuser,
  // pour ne pas leur indiquer ce qui a bloqué.
  if (ligne(donnees.get("site")) !== "") return { ok: true, message: CONFIRMATION };

  // Les contraintes du navigateur (`required`, `type="email"`) ne valent rien :
  // une Server Action est joignable par POST direct.
  if (!email || !message) {
    return echec("Merci de renseigner votre adresse e-mail et votre message.");
  }
  if (nom.length > LIMITE_NOM) {
    return echec(`Le nom ne doit pas dépasser ${LIMITE_NOM} caractères.`);
  }
  if (email.length > LIMITE_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return echec("Cette adresse e-mail semble incorrecte.");
  }
  if (message.length > LIMITE_MESSAGE) {
    return echec(`Le message ne doit pas dépasser ${LIMITE_MESSAGE} caractères.`);
  }

  // Un même message renvoyé plusieurs fois — bouton cliqué deux fois, robot qui
  // rejoue sa requête — ne remplit pas la boîte de réception pour autant. Le
  // repère ne porte que sur une empreinte du contenu, jamais sur le contenu.
  const doublon = `contact:doublon:${await empreinte(`${email}|${message}`)}`;
  if (estMarque(doublon)) return { ok: true, message: CONFIRMATION };

  // Le message est complet et inédit : c'est seulement ici qu'il consomme le
  // quota d'envoi, celui qui protège la boîte de réception et le quota Resend.
  if (
    !consommer(`contact:envois:${appelant}`, ENVOIS_PAR_CONNEXION, FENETRE_MS) ||
    !consommer("contact:envois:tous", ENVOIS_TOUTES_CONNEXIONS, FENETRE_MS)
  ) {
    console.warn(`Plafond d'envois atteint (appelant ${appelant}).`);
    return echec(TROP_DE_MESSAGES);
  }

  try {
    await envoyerMessageContact({ nom, email, message });
  } catch (erreur) {
    // La cause exacte (clé absente, domaine non vérifié…) reste dans les logs :
    // elle ne dit rien d'utile au visiteur et renseignerait un attaquant.
    console.error("Envoi du message de contact impossible", erreur);
    return echec(SECOURS);
  }

  marquer(doublon, DOUBLON_MS);
  return { ok: true, message: CONFIRMATION };
}
