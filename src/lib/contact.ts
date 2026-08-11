/**
 * Envoi des messages du formulaire de contact, via Resend.
 *
 * Le destinataire est fixe (`CONTACT_EMAIL_TO`) : le visiteur ne choisit
 * jamais où part le message. Son adresse ne sert que de `replyTo` — la mettre
 * en expéditeur ferait envoyer depuis un domaine non vérifié, ce que Resend
 * refuse et que SPF/DKIM feraient tomber en spam.
 */

import { Resend } from "resend";

/**
 * Domaine partagé de Resend, utilisable sans vérification DNS mais qui ne
 * distribue qu'à l'adresse du titulaire du compte. Suffisant pour démarrer ;
 * `CONTACT_EMAIL_FROM` prend le relais dès qu'un domaine est vérifié.
 */
const EXPEDITEUR_PAR_DEFAUT = "Atelier Petita <onboarding@resend.dev>";

export type MessageContact = {
  nom: string;
  email: string;
  message: string;
};

function lireConfiguration() {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    throw new Error("RESEND_API_KEY n'est pas défini. Voir .env.example.");
  }

  const destinataire = process.env.CONTACT_EMAIL_TO;
  if (!destinataire) {
    throw new Error("CONTACT_EMAIL_TO n'est pas défini. Voir .env.example.");
  }

  return {
    cle,
    destinataire,
    expediteur: process.env.CONTACT_EMAIL_FROM || EXPEDITEUR_PAR_DEFAUT,
  };
}

/** Le message est saisi librement : rien n'en ressort tel quel dans le HTML. */
function echapper(texte: string) {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function corpsHtml({ nom, email, message }: MessageContact) {
  return `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3a2a24">
  <p><strong>Nom</strong> : ${echapper(nom)}<br>
  <strong>E-mail</strong> : <a href="mailto:${echapper(email)}">${echapper(email)}</a></p>
  <hr style="border:none;border-top:1px solid #d8c3a5">
  <p style="white-space:pre-wrap">${echapper(message)}</p>
</div>`;
}

export async function envoyerMessageContact(saisie: MessageContact) {
  const { cle, destinataire, expediteur } = lireConfiguration();

  const { error } = await new Resend(cle).emails.send({
    from: expediteur,
    to: destinataire,
    // Répondre depuis sa boîte écrit directement au visiteur.
    replyTo: saisie.email,
    subject: `Site Petita — message de ${saisie.nom}`,
    text: `Nom : ${saisie.nom}\nE-mail : ${saisie.email}\n\n${saisie.message}\n`,
    html: corpsHtml(saisie),
  });

  // Resend renvoie l'échec dans la réponse plutôt qu'en levant : sans ce test,
  // un envoi refusé passerait pour un succès.
  if (error) {
    throw new Error(`${error.name} : ${error.message}`);
  }
}
