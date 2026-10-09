"use client";

import { upload } from "@vercel/blob/client";
import { cheminUpload, type DossierImages } from "@/lib/images";
import { preparerImage } from "./preparerImage";

/** Tout ce qui sort de `preparerImage` est du WebP réencodé par le navigateur. */
const TYPE_ENVOYE = "image/webp";

/**
 * Le SDK client remplace le corps de nos réponses d'erreur par « Failed to
 * retrieve the client token ». On interroge la route pour retrouver la cause.
 */
async function causeReelle(message: string) {
  if (!/client token/i.test(message)) return message;
  try {
    const reponse = await fetch("/api/admin/upload");
    if (reponse.status === 401) {
      return "session expirée, reconnectez-vous puis réessayez";
    }
    if (reponse.status === 429) {
      return "trop de photos envoyées coup sur coup, patientez quelques minutes";
    }
    const { raison } = (await reponse.json()) as { raison: string | null };
    if (raison) return raison;
  } catch {
    // On retombe sur le message d'origine.
  }
  return `${message} (détail dans les logs Vercel de /api/admin/upload)`;
}

/**
 * Prépare une photo puis l'envoie directement à Vercel Blob, dans `dossier`.
 * Renvoie son URL publique.
 *
 * Le nom du fichier d'origine est abandonné au passage : le chemin est tiré au
 * sort selon la convention que la route d'émission des jetons exige. Un nom de
 * cliché ne devient jamais une URL publique, et le serveur n'a jamais à faire
 * confiance à un chemin composé ici.
 *
 * En cas d'échec, lève une erreur dont le message est déjà lisible par la
 * patronne : l'appelant n'a plus qu'à l'afficher.
 */
export async function envoyerImage(
  fichier: File,
  dossier: DossierImages,
  onProgression: (pourcentage: number) => void,
): Promise<string> {
  try {
    const prepare = await preparerImage(fichier);

    const resultat = await upload(cheminUpload(dossier, TYPE_ENVOYE), prepare, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      contentType: TYPE_ENVOYE,
      onUploadProgress: ({ percentage }) => onProgression(percentage),
    });

    return resultat.url;
  } catch (cause) {
    throw new Error(await causeReelle((cause as Error).message));
  }
}
