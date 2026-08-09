const COTE_MAX = 2200;
const QUALITE = 0.85;

/**
 * Réduit une photo dans le navigateur avant l'envoi : les clichés de téléphone
 * font souvent 5 à 10 Mo pour un rendu identique une fois redimensionné.
 * En cas d'échec (format non décodable), le fichier d'origine est renvoyé tel quel.
 */
export async function compresserImage(fichier: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return fichier;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(fichier);
  } catch {
    return fichier;
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
    return fichier;
  }
  contexte.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  const resultat = await new Promise<Blob | null>((resoudre) =>
    canevas.toBlob(resoudre, "image/webp", QUALITE),
  );
  if (!resultat || (ratio === 1 && resultat.size >= fichier.size)) return fichier;

  return new File([resultat], `${fichier.name.replace(/\.[^.]+$/, "")}.webp`, {
    type: "image/webp",
  });
}
