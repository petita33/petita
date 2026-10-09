const COTE_MAX = 2200;
const QUALITE = 0.85;

/**
 * Au-delà, on refuse plutôt que de tenter le décodage : une image de plusieurs
 * dizaines de mégapixels — ou annoncée comme telle — fait tomber l'onglet avant
 * de produire quoi que ce soit d'utile.
 */
const PIXELS_MAX = 50_000_000;

/**
 * Prépare une photo avant l'envoi : décodage, orientation redressée,
 * redimensionnement, puis réencodage en WebP.
 *
 * Le réencodage est systématique, y compris quand il ne fait pas gagner un
 * octet. C'est lui qui garantit que rien de la photo d'origine ne subsiste à
 * côté des pixels : ni EXIF, ni coordonnées GPS, ni modèle d'appareil, ni
 * miniature intégrée, ni nom de fichier. Une photo de téléphone porte tout cela
 * par défaut, et la publier reviendrait à publier le lieu et l'heure de la
 * prise de vue.
 *
 * En cas d'échec, lève : l'ancien repli « on envoie le fichier d'origine »
 * publiait justement les clichés que l'on ne savait pas nettoyer.
 */
export async function preparerImage(fichier: File): Promise<Blob> {
  if (typeof createImageBitmap !== "function") {
    throw new Error(
      "ce navigateur ne sait pas préparer les photos, essayez depuis un autre appareil",
    );
  }

  let bitmap: ImageBitmap;
  try {
    // `from-image` applique la rotation notée dans l'EXIF : la photo garde le
    // sens sous lequel elle a été prise, alors que sa métadonnée disparaît.
    bitmap = await createImageBitmap(fichier, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      "cette photo n'a pas pu être lue (format non pris en charge), utilisez JPG, PNG, WebP ou AVIF",
    );
  }

  if (bitmap.width * bitmap.height > PIXELS_MAX) {
    bitmap.close();
    throw new Error("cette photo est démesurée, réduisez-la avant de l'envoyer");
  }

  const ratio = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.round(bitmap.width * ratio);
  const hauteur = Math.round(bitmap.height * ratio);

  const canevas = document.createElement("canvas");
  canevas.width = largeur;
  canevas.height = hauteur;

  const contexte = canevas.getContext("2d");
  if (!contexte) {
    bitmap.close();
    throw new Error("la préparation de la photo a échoué, réessayez");
  }
  contexte.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  const resultat = await new Promise<Blob | null>((resoudre) =>
    canevas.toBlob(resoudre, "image/webp", QUALITE),
  );
  if (!resultat) {
    throw new Error("la conversion de la photo a échoué, réessayez");
  }
  return resultat;
}
