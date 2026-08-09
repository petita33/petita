import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { sessionActive } from "@/lib/session";

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo

const BLOB_ABSENT =
  "BLOB_READ_WRITE_TOKEN est absent de ce déploiement. Les envois depuis le " +
  "navigateur l'exigent : contrairement à la lecture des annonces, la signature " +
  "d'un jeton d'upload n'accepte pas l'authentification OIDC (BLOB_STORE_ID + " +
  "VERCEL_OIDC_TOKEN ne suffisent pas). Dans Vercel : Storage → le store Blob → " +
  "onglet des variables → copier BLOB_READ_WRITE_TOKEN dans les variables " +
  "d'environnement du projet, puis redéployer.";

/**
 * `handleUpload` passe par `getReadWriteBlobTokenFromOptionsOrEnv`, qui ne lit
 * que BLOB_READ_WRITE_TOKEN. Ne pas élargir ce test à BLOB_STORE_ID : la
 * requête partirait pour échouer plus loin avec un message opaque.
 */
function jetonUploadDisponible() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Consulté par le formulaire quand un envoi échoue : le SDK client remplace le
 * corps de nos réponses d'erreur par un message générique, ce GET permet de
 * réafficher la vraie cause.
 */
export async function GET() {
  if (!(await sessionActive())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json({
    pret: jetonUploadDisponible(),
    raison: jetonUploadDisponible() ? null : BLOB_ABSENT,
  });
}

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

  if (!jetonUploadDisponible()) {
    console.error(BLOB_ABSENT);
    return NextResponse.json({ error: BLOB_ABSENT }, { status: 503 });
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
    // Tracé côté serveur : le client ne reçoit qu'un message générique du SDK.
    console.error("Émission du jeton d'upload impossible", erreur);
    return NextResponse.json(
      { error: (erreur as Error).message },
      { status: 400 },
    );
  }
}
