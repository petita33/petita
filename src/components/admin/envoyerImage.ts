"use client";

import { upload } from "@vercel/blob/client";
import { compresserImage } from "./compresserImage";

const FORMATS_ACCEPTES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

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
    const { raison } = (await reponse.json()) as { raison: string | null };
    if (raison) return raison;
  } catch {
    // On retombe sur le message d'origine.
  }
  return `${message} (détail dans les logs Vercel de /api/admin/upload)`;
}

/**
 * Compresse une photo puis l'envoie directement à Vercel Blob, dans `dossier`.
 * Renvoie son URL publique.
 *
 * En cas d'échec, lève une erreur dont le message est déjà lisible par la
 * patronne : l'appelant n'a plus qu'à l'afficher.
 */
export async function envoyerImage(
  fichier: File,
  dossier: string,
  onProgression: (pourcentage: number) => void,
): Promise<string> {
  let prepare: File;
  try {
    prepare = await compresserImage(fichier);
    if (!FORMATS_ACCEPTES.includes(prepare.type)) {
      throw new Error(
        `format non pris en charge (${prepare.type || "inconnu"}), utilisez JPG, PNG, WebP ou AVIF`,
      );
    }

    const resultat = await upload(`${dossier}/${prepare.name}`, prepare, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      contentType: prepare.type,
      onUploadProgress: ({ percentage }) => onProgression(percentage),
    });

    return resultat.url;
  } catch (cause) {
    throw new Error(await causeReelle((cause as Error).message));
  }
}
