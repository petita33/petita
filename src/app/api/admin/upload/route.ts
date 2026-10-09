import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { typeDuCheminUpload } from "@/lib/images";
import { consommer, empreinteAppelant } from "@/lib/limites";
import { sessionActive } from "@/lib/session";

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo

/**
 * Le jeton ne vaut que pour l'envoi qui suit immédiatement sa demande. Une
 * minute couvre largement le temps de transfert d'une photo compressée ; passé
 * ce délai, un jeton intercepté ne sert plus à rien.
 */
const VALIDITE_JETON_MS = 60 * 1000;

/**
 * Plafonds d'envoi. Une annonce accepte douze photos : la patronne qui refait
 * entièrement plusieurs annonces d'affilée reste très en dessous, tandis qu'une
 * session volée ne peut pas remplir le store — ni la facture — en continu.
 * Le compteur global protège aussi le store si plusieurs postes s'y mettent.
 */
const ENVOIS_PAR_HEURE = 120;
const ENVOIS_PAR_HEURE_TOUS = 400;
const UNE_HEURE_MS = 60 * 60 * 1000;

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
 *
 * Le jeton émis n'ouvre qu'une seule porte : le chemin exact demandé, s'il
 * respecte la convention `annonces|visuels/<uuid>.<extension>`, pour la seule
 * durée du transfert et pour le seul type que l'extension annonce. Sans ce
 * contrôle, le client choisirait lui-même l'emplacement écrit dans le store —
 * y compris sous `donnees/`, où un objet inattendu ferait tomber la lecture du
 * catalogue.
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

  const appelant = await empreinteAppelant();
  if (
    !consommer(`upload:${appelant}`, ENVOIS_PAR_HEURE, UNE_HEURE_MS) ||
    !consommer("upload:tous", ENVOIS_PAR_HEURE_TOUS, UNE_HEURE_MS)
  ) {
    console.warn(`Plafond d'envois atteint (appelant ${appelant}).`);
    return NextResponse.json(
      {
        error:
          "Trop de photos envoyées coup sur coup. Patientez quelques minutes avant de reprendre.",
      },
      { status: 429 },
    );
  }

  const corps = (await request.json()) as HandleUploadBody;

  try {
    const reponse = await handleUpload({
      body: corps,
      request,
      onBeforeGenerateToken: async (chemin) => {
        if (!(await sessionActive())) {
          throw new Error("Non autorisé");
        }

        const type = typeDuCheminUpload(chemin);
        if (!type) {
          console.warn(`Chemin d'envoi refusé : ${chemin}`);
          throw new Error("Chemin d'envoi refusé");
        }

        return {
          // Le seul type cohérent avec l'extension demandée : un `.webp` ne
          // peut pas transporter autre chose qu'un WebP.
          allowedContentTypes: [type],
          maximumSizeInBytes: TAILLE_MAX,
          validUntil: Date.now() + VALIDITE_JETON_MS,
          // Le suffixe aléatoire est ajouté par le store : même en rejouant un
          // chemin déjà utilisé, un envoi ne peut pas en écraser un autre.
          addRandomSuffix: true,
          allowOverwrite: false,
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
