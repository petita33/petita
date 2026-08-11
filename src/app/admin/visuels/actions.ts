"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { estUrlBlob, supprimerImages } from "@/lib/blob";
import { balayerImagesOrphelines } from "@/lib/menage";
import { estFormat } from "@/lib/formats";
import { DOSSIER_VISUELS, estEmplacement, type Visuels } from "@/lib/visuels";
import { ecrireVisuels, lireInstantaneVisuels } from "@/lib/visuels-store";
import { sessionActive } from "@/lib/session";

export type EtatVisuel = { erreur?: string; succes?: string } | undefined;

// Les Server Actions sont joignables par POST direct : chacune revérifie la
// session. Le contrôle est écrit en toutes lettres à chaque appel plutôt que
// derrière un helper — un helper qui se contente de lever est éliminé par le
// minifieur de Next 16 lorsqu'il vit dans le même module que `sessionActive`.
const REFUS = "Session expirée. Reconnectez-vous puis réessayez.";

const LIMITE_ALT = 300;

/**
 * Pose (ou remplace) la photo d'un emplacement de la page d'accueil.
 * Un champ `image` vide vide l'emplacement : il retrouve son aplat décoratif.
 */
export async function enregistrerVisuel(
  _etat: EtatVisuel,
  donnees: FormData,
): Promise<EtatVisuel> {
  if (!(await sessionActive())) return { erreur: REFUS };

  const emplacement = String(donnees.get("emplacement") ?? "");
  const image = String(donnees.get("image") ?? "").trim();
  const alt = String(donnees.get("alt") ?? "").trim();
  // Vide ou inconnu : l'emplacement garde le cadre conseillé par le site.
  const formatBrut = donnees.get("format");
  const format = estFormat(formatBrut) ? formatBrut : undefined;

  if (!estEmplacement(emplacement)) return { erreur: "Emplacement inconnu." };
  if (image !== "" && !estUrlBlob(image, DOSSIER_VISUELS)) {
    return { erreur: "Cette photo n'a pas été envoyée correctement. Réessayez." };
  }
  if (alt.length > LIMITE_ALT) {
    return { erreur: `La description ne doit pas dépasser ${LIMITE_ALT} caractères.` };
  }

  const { visuels, version } = await lireInstantaneVisuels();
  const precedent = visuels[emplacement];

  const suivants: Visuels = { ...visuels };
  if (image === "") {
    delete suivants[emplacement];
  } else {
    suivants[emplacement] = { url: image, alt, ...(format ? { format } : {}) };
  }

  try {
    await ecrireVisuels(suivants, version);
  } catch (erreur) {
    // Remonté dans le formulaire plutôt que sur une page d'erreur : la saisie
    // reste à l'écran et peut être renvoyée telle quelle.
    console.error("Écriture des visuels impossible", erreur);
    return { erreur: `Enregistrement impossible : ${(erreur as Error).message}` };
  }

  // La photo remplacée n'est plus référencée nulle part : on libère le store.
  if (precedent && precedent.url !== image) {
    await supprimerImages([precedent.url], `emplacement ${emplacement}`);
  }

  // Ramasse au passage les photos envoyées puis abandonnées sans enregistrement.
  after(balayerImagesOrphelines);

  revalidatePath("/");
  revalidatePath("/admin/visuels");

  return {
    succes:
      image === ""
        ? "Photo retirée. L'emplacement affiche de nouveau son fond décoratif."
        : "Photo enregistrée. Elle est visible sur la page d'accueil.",
  };
}
