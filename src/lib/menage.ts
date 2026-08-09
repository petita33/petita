/**
 * Ramassage des photos orphelines du store Blob.
 *
 * Une photo est envoyée au store dès que la patronne la choisit, bien avant
 * qu'elle clique sur « Enregistrer ». Si elle quitte la page, retire la photo
 * d'une annonce pas encore publiée, ou en change deux fois d'affilée, le
 * fichier reste dans le store sans que rien ne le référence. Une suppression
 * qui a échoué laisse le même genre de résidu.
 *
 * Ce balayage compare le contenu réel des dossiers d'images aux URLs citées
 * dans les JSON, et supprime ce qui ne sert plus. Il est déclenché après chaque
 * enregistrement, hors du temps de réponse (`after()`), et n'a donc jamais à
 * être lancé à la main.
 */

import { DOSSIER_ANNONCES } from "./annonces";
import { lireAnnonces } from "./annonces-store";
import { blobConfigure, listerImages, supprimerImages } from "./blob";
import { DOSSIER_VISUELS } from "./visuels";
import { lireVisuels } from "./visuels-store";

/**
 * Une photo tout juste envoyée n'est référencée nulle part tant que le
 * formulaire n'a pas été soumis. On laisse largement le temps de finir une
 * saisie — y compris de la reprendre le lendemain — avant de la considérer
 * comme abandonnée.
 */
const DELAI_DE_GRACE_MS = 24 * 60 * 60 * 1000;

export type BilanBalayage = {
  supprimees: number;
  /** Orphelines encore dans leur délai de grâce, laissées pour cette fois. */
  ajournees: number;
  echecs: number;
};

const RIEN: BilanBalayage = { supprimees: 0, ajournees: 0, echecs: 0 };

/**
 * Supprime les images qu'aucune annonce ni aucun emplacement de la page
 * d'accueil ne référence. N'échoue jamais bruyamment : c'est une tâche de fond,
 * son échec ne doit pas remonter à l'écran de la patronne.
 */
export async function balayerImagesOrphelines(): Promise<BilanBalayage> {
  if (!blobConfigure()) return RIEN;

  try {
    // `lireAnnonces` et `lireVisuels` lèvent si la lecture échoue vraiment (par
    // opposition à un fichier encore inexistant, qui vaut « rien à référencer »).
    // C'est ce qui rend ce balayage sûr : sur panne, on n'arrive jamais ici avec
    // une liste vide qui ferait tout supprimer.
    const [annonces, visuels, imagesAnnonces, imagesVisuels] = await Promise.all([
      lireAnnonces(),
      lireVisuels(),
      listerImages(DOSSIER_ANNONCES),
      listerImages(DOSSIER_VISUELS),
    ]);

    const referencees = new Set<string>();
    for (const annonce of annonces) {
      for (const url of annonce.images) referencees.add(url);
    }
    for (const visuel of Object.values(visuels)) {
      if (visuel) referencees.add(visuel.url);
    }

    const limite = Date.now() - DELAI_DE_GRACE_MS;
    const orphelines: string[] = [];
    let ajournees = 0;

    for (const image of [...imagesAnnonces, ...imagesVisuels]) {
      if (referencees.has(image.url)) continue;
      if (image.deposeeLe.getTime() > limite) {
        // Envoi peut-être encore en cours de saisie : on la reverra plus tard.
        ajournees += 1;
        continue;
      }
      orphelines.push(image.url);
    }

    if (orphelines.length === 0) {
      return { supprimees: 0, ajournees, echecs: 0 };
    }

    const { supprimees, echecs } = await supprimerImages(
      orphelines,
      "balayage des orphelines",
    );

    console.info(
      `Balayage des orphelines : ${supprimees.length} image(s) supprimée(s), ` +
        `${ajournees} ajournée(s), ${echecs.length} en échec.`,
    );

    return {
      supprimees: supprimees.length,
      ajournees,
      echecs: echecs.length,
    };
  } catch (erreur) {
    console.error("Balayage des images orphelines impossible", erreur);
    return RIEN;
  }
}
