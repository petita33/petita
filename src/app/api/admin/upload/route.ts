import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { sessionActive } from "@/lib/session";

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo

/**
 * Délivre un jeton d'upload à l'admin connecté. Le navigateur envoie ensuite le
 * fichier directement à Vercel Blob, ce qui évite la limite de 4,5 Mo des
 * fonctions serveur.
 */
export async function POST(request: Request) {
  // Contrôle en tête de route : un appelant anonyme repart en 401 sans que le
  // SDK Blob n'ait été sollicité. Le contrôle est répété dans
  // `onBeforeGenerateToken`, seul endroit garanti avant l'émission du jeton.
  if (!(await sessionActive())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const corps = (await request.json()) as HandleUploadBody;

  try {
    const reponse = await handleUpload({
      body: corps,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await sessionActive())) {
          throw new Error("Non autorisé");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
          ],
          maximumSizeInBytes: TAILLE_MAX,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(reponse);
  } catch (erreur) {
    return NextResponse.json(
      { error: (erreur as Error).message },
      { status: 400 },
    );
  }
}
