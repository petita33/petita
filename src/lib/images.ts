/**
 * Le contrat des photos envoyées au store : types acceptés, forme du chemin,
 * et vérification que le contenu déposé est bien une image.
 *
 * Ce fichier ne fait aucun accès réseau à l'import : il est partagé entre le
 * navigateur, qui compose le chemin d'envoi, et le serveur, qui refuse tout ce
 * qui s'en écarte. Une seule règle, écrite une fois.
 */

/** Les seuls types acceptés, avec l'extension qui leur correspond. */
export const TYPES_IMAGE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type TypeImage = keyof typeof TYPES_IMAGE;

export const TYPES_ACCEPTES = Object.keys(TYPES_IMAGE) as TypeImage[];

export const EXTENSIONS_ACCEPTEES = Object.values(TYPES_IMAGE);

export function estTypeImage(valeur: unknown): valeur is TypeImage {
  return typeof valeur === "string" && valeur in TYPES_IMAGE;
}

/** Les deux seuls dossiers d'images du store. */
export const DOSSIERS_IMAGES = ["annonces", "visuels"] as const;

export type DossierImages = (typeof DOSSIERS_IMAGES)[number];

export function estDossierImages(valeur: unknown): valeur is DossierImages {
  return (
    typeof valeur === "string" &&
    (DOSSIERS_IMAGES as readonly string[]).includes(valeur)
  );
}

/**
 * Chemin d'envoi d'une photo : `annonces/<uuid>.<extension>`.
 *
 * Le nom est tiré au sort, jamais dérivé du fichier choisi. Rien de ce que la
 * patronne a sur son téléphone — nom du cliché, chemin, accents, séparateurs —
 * ne se retrouve dans une URL publique, et rien de ce que composerait un client
 * modifié ne peut désigner autre chose qu'un objet neuf de ces deux dossiers.
 */
export function cheminUpload(dossier: DossierImages, type: TypeImage) {
  return `${dossier}/${crypto.randomUUID()}.${TYPES_IMAGE[type]}`;
}

const CHEMIN_UPLOAD =
  /^(annonces|visuels)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$/;

const TYPE_DE_EXTENSION: Record<string, TypeImage> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

/**
 * Le type qu'annonce un chemin d'envoi, ou `null` si le chemin ne respecte pas
 * la convention. Sert au serveur à n'autoriser, pour le jeton qu'il émet, que
 * le seul type cohérent avec l'extension demandée.
 */
export function typeDuCheminUpload(chemin: string): TypeImage | null {
  const correspondance = CHEMIN_UPLOAD.exec(chemin);
  return correspondance ? TYPE_DE_EXTENSION[correspondance[2]] : null;
}

/** Vrai si l'URL se termine par une extension d'image acceptée. */
export function extensionAcceptee(url: string) {
  const chemin = url.split("?")[0].toLowerCase();
  return EXTENSIONS_ACCEPTEES.some((extension) => chemin.endsWith(`.${extension}`));
}

// ------------------------------------------------------- contrôle des octets

const ftyp = (octets: Uint8Array, marques: string[]) => {
  if (lire(octets, 4, 4) !== "ftyp") return false;
  // La marque principale est en 8..12, les marques compatibles suivent : un
  // AVIF légitime peut n'annoncer `avif` que dans cette liste.
  const entete = lire(octets, 8, 24);
  return marques.some((marque) => entete.includes(marque));
};

function lire(octets: Uint8Array, debut: number, longueur: number) {
  return String.fromCharCode(...octets.slice(debut, debut + longueur));
}

const SIGNATURES: Array<{ type: TypeImage; reconnait: (o: Uint8Array) => boolean }> = [
  {
    type: "image/jpeg",
    reconnait: (o) => o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff,
  },
  {
    type: "image/png",
    reconnait: (o) =>
      lire(o, 0, 8) === "\x89PNG\r\n\x1a\n",
  },
  {
    type: "image/webp",
    reconnait: (o) => lire(o, 0, 4) === "RIFF" && lire(o, 8, 4) === "WEBP",
  },
  {
    type: "image/avif",
    reconnait: (o) => ftyp(o, ["avif", "avis"]),
  },
];

const ENTETE_OCTETS = 32;

/**
 * Le type réel d'un objet du store, lu dans ses premiers octets.
 *
 * `undefined` signale que le contrôle n'a pas pu avoir lieu (store injoignable,
 * réponse inattendue) : ce n'est pas un refus, et l'appelant ne doit pas
 * bloquer une saisie déjà valide pour une panne réseau.
 */
async function typeReel(url: string): Promise<TypeImage | null | undefined> {
  let reponse: Response;
  try {
    reponse = await fetch(url, {
      headers: { Range: `bytes=0-${ENTETE_OCTETS - 1}` },
      cache: "no-store",
    });
  } catch (erreur) {
    console.error(`Contrôle du format impossible pour ${url}`, erreur);
    return undefined;
  }

  // 404 : l'objet n'existe pas. Une URL qui ne désigne rien n'a rien à faire
  // dans une annonce, c'est bien un refus.
  if (reponse.status === 404) return null;
  if (!reponse.ok) {
    console.error(`Contrôle du format impossible pour ${url} (HTTP ${reponse.status}).`);
    return undefined;
  }

  const octets = new Uint8Array(await reponse.arrayBuffer());
  return SIGNATURES.find(({ reconnait }) => reconnait(octets))?.type ?? null;
}

/**
 * Les URLs dont le contenu n'est pas une image reconnue.
 *
 * Le type déclaré à l'envoi vient du navigateur : il ne prouve rien. Cette
 * lecture des premiers octets est le seul moment où l'on constate ce qui a
 * réellement été déposé — un exécutable renommé `.webp`, un fichier tronqué ou
 * un polyglotte ressortent ici, avant d'être référencés par une page publique.
 */
export async function imagesInvalides(urls: string[]) {
  const controles = await Promise.all(
    urls.map(async (url) => ({ url, type: await typeReel(url) })),
  );
  return controles.filter(({ type }) => type === null).map(({ url }) => url);
}
