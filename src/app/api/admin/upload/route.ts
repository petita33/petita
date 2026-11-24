import { NextResponse } from "next/server";
import { cheminUpload, estDossierImages, estTypeImage } from "@/lib/images";
import { consommer, empreinteAppelant } from "@/lib/limites";
import { sessionActive } from "@/lib/session";
import {
  CACHE_IMAGE,
  stockageConfigure,
  urlEnvoiSignee,
  variablesManquantes,
} from "@/lib/stockage";
import { urlPublique } from "@/lib/store";

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo

/**
 * L'URL signée ne vaut que pour l'envoi qui suit immédiatement sa demande. Une
 * minute couvre largement le temps de transfert d'une photo compressée ; passé
 * ce délai, une URL interceptée ne sert plus à rien.
 */
const VALIDITE_URL_S = 60;

/**
 * Plafonds d'envoi. Une annonce accepte douze photos : la patronne qui refait
 * entièrement plusieurs annonces d'affilée reste très en dessous, tandis qu'une
 * session volée ne peut pas remplir le bucket — ni la facture — en continu.
 * Le compteur global protège aussi le bucket si plusieurs postes s'y mettent.
 */
const ENVOIS_PAR_HEURE = 120;
const ENVOIS_PAR_HEURE_TOUS = 400;
const UNE_HEURE_MS = 60 * 60 * 1000;

/**
 * Délivre à l'admin connecté une URL d'envoi signée. Le navigateur envoie
 * ensuite le fichier directement à R2, ce qui évite la limite de 4,5 Mo des
 * fonctions serveur.
 *
 * Le client ne choisit que le dossier, le type et la taille ; le chemin, lui,
 * est tiré au sort ici. L'URL émise n'ouvre qu'une seule porte : un objet neuf
 * de `annonces/` ou `visuels/`, pour la seule durée du transfert, avec le
 * type et la taille annoncés — jamais un objet de `donnees/`, où un fichier
 * inattendu ferait tomber la lecture du catalogue.
 */
export async function POST(request: Request) {
  if (!(await sessionActive())) {
    return NextResponse.json(
      { error: "Session expirée, reconnectez-vous puis réessayez." },
      { status: 401 },
    );
  }

  if (!stockageConfigure()) {
    const manquantes = variablesManquantes();
    const cause =
      "Le stockage des photos n'est pas configuré sur ce déploiement" +
      (manquantes.length > 0 ? ` (${manquantes.join(", ")} absente(s))` : "") +
      ".";
    console.error(cause);
    return NextResponse.json({ error: cause }, { status: 503 });
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

  let corps: { dossier?: unknown; type?: unknown; taille?: unknown };
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ error: "Demande illisible." }, { status: 400 });
  }

  const { dossier, type, taille } = corps;
  if (!estDossierImages(dossier) || !estTypeImage(type)) {
    console.warn(`Envoi refusé : dossier ${String(dossier)}, type ${String(type)}`);
    return NextResponse.json({ error: "Envoi refusé." }, { status: 400 });
  }
  if (typeof taille !== "number" || !Number.isInteger(taille) || taille <= 0) {
    return NextResponse.json({ error: "Envoi refusé." }, { status: 400 });
  }
  if (taille > TAILLE_MAX) {
    return NextResponse.json(
      { error: "Cette photo est trop lourde, même une fois compressée (10 Mo au plus)." },
      { status: 413 },
    );
  }

  const chemin = cheminUpload(dossier, type);
  try {
    return NextResponse.json({
      urlEnvoi: await urlEnvoiSignee(chemin, type, taille, VALIDITE_URL_S),
      // Les en-têtes que le navigateur doit renvoyer tels quels : ils font
      // partie de la signature.
      entetes: { "Content-Type": type, "Cache-Control": CACHE_IMAGE },
      url: urlPublique(chemin),
    });
  } catch (erreur) {
    console.error("Émission de l'URL d'envoi impossible", erreur);
    return NextResponse.json(
      { error: "Le stockage des photos ne répond pas. Réessayez dans un instant." },
      { status: 502 },
    );
  }
}
