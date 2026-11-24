"use client";

import type { DossierImages } from "@/lib/images";
import { preparerImage } from "./preparerImage";

/**
 * `preparerImage` réencode en WebP, mais un navigateur qui ne sait pas
 * l'écrire rend du PNG sans prévenir : on annonce le type réellement produit.
 */
function typeProduit(contenu: Blob) {
  return contenu.type || "image/webp";
}

type Autorisation = {
  urlEnvoi: string;
  entetes: Record<string, string>;
  url: string;
};

/** Demande au serveur une URL d'envoi signée pour ce fichier. */
async function demanderAutorisation(
  dossier: DossierImages,
  type: string,
  taille: number,
): Promise<Autorisation> {
  const reponse = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dossier, type, taille }),
  });
  const corps = (await reponse.json().catch(() => null)) as
    | (Autorisation & { error?: string })
    | null;
  if (!reponse.ok || !corps?.urlEnvoi) {
    throw new Error(corps?.error ?? `le serveur a refusé l'envoi (HTTP ${reponse.status})`);
  }
  return corps;
}

/**
 * `fetch` ne sait pas suivre la progression d'un envoi : `XMLHttpRequest`,
 * si. C'est elle qui fait avancer la barre sous la photo.
 */
function deposer(
  { urlEnvoi, entetes }: Autorisation,
  contenu: Blob,
  onProgression: (pourcentage: number) => void,
) {
  return new Promise<void>((resoudre, rejeter) => {
    const requete = new XMLHttpRequest();
    requete.open("PUT", urlEnvoi);
    for (const [nom, valeur] of Object.entries(entetes)) {
      requete.setRequestHeader(nom, valeur);
    }
    requete.upload.onprogress = (evenement) => {
      if (evenement.lengthComputable) {
        onProgression((evenement.loaded / evenement.total) * 100);
      }
    };
    requete.onload = () => {
      if (requete.status >= 200 && requete.status < 300) {
        onProgression(100);
        resoudre();
      } else {
        console.error(`Dépôt refusé par le stockage (HTTP ${requete.status})`, requete.responseText);
        rejeter(new Error(`le stockage a refusé la photo (HTTP ${requete.status})`));
      }
    };
    // Coupure réseau, ou règle CORS du bucket absente : le navigateur ne dit
    // pas lequel des deux.
    requete.onerror = () =>
      rejeter(new Error("la connexion au stockage a échoué, vérifiez le réseau puis réessayez"));
    requete.send(contenu);
  });
}

/**
 * Prépare une photo puis l'envoie directement au bucket R2, dans `dossier`.
 * Renvoie son URL publique.
 *
 * Le nom du fichier d'origine est abandonné au passage : le chemin est tiré au
 * sort par le serveur. Un nom de cliché ne devient jamais une URL publique.
 *
 * En cas d'échec, lève une erreur dont le message est déjà lisible par la
 * patronne : l'appelant n'a plus qu'à l'afficher.
 */
export async function envoyerImage(
  fichier: File,
  dossier: DossierImages,
  onProgression: (pourcentage: number) => void,
): Promise<string> {
  const prepare = await preparerImage(fichier);
  const autorisation = await demanderAutorisation(dossier, typeProduit(prepare), prepare.size);
  await deposer(autorisation, prepare, onProgression);
  return autorisation.url;
}
