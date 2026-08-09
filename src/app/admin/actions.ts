"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CATEGORIES, estCategorie, type Annonce } from "@/lib/annonces";
import {
  ecrireAnnonces,
  lireInstantane,
  supprimerImages,
} from "@/lib/annonces-store";
import {
  fermerSession,
  motDePasseValide,
  ouvrirSession,
  sessionActive,
} from "@/lib/session";

export type EtatFormulaire = { erreur?: string } | undefined;

// Les Server Actions sont joignables par POST direct : chacune revérifie la
// session. Le contrôle est écrit en toutes lettres à chaque appel plutôt que
// derrière un helper — un helper qui se contente de lever est éliminé par le
// minifieur de Next 16 lorsqu'il vit dans le même module que `sessionActive`.
const REFUS = "Session expirée. Reconnectez-vous puis réessayez.";

const LIMITE_TITRE = 120;
const LIMITE_DESCRIPTION = 4000;
const LIMITE_IMAGES = 12;

// ---------------------------------------------------------------- connexion

export async function connexion(
  _etat: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const motDePasse = String(donnees.get("motDePasse") ?? "");
  const suite = String(donnees.get("suite") ?? "");

  if (!(await motDePasseValide(motDePasse))) {
    // Ralentit les tentatives automatisées sans gêner une saisie humaine.
    await new Promise((resoudre) => setTimeout(resoudre, 600));
    return { erreur: "Mot de passe incorrect." };
  }

  await ouvrirSession();
  // On ne suit que les destinations internes à l'admin.
  redirect(suite.startsWith("/admin") ? suite : "/admin");
}

export async function deconnexion() {
  await fermerSession();
  redirect("/admin/connexion");
}

// ----------------------------------------------------------------- annonces

function nettoyerImages(brut: FormDataEntryValue | null): string[] {
  if (typeof brut !== "string" || brut.trim() === "") return [];

  let valeurs: unknown;
  try {
    valeurs = JSON.parse(brut);
  } catch {
    return [];
  }
  if (!Array.isArray(valeurs)) return [];

  return valeurs
    .filter((url): url is string => typeof url === "string")
    // Seules les URLs Vercel Blob sont acceptées : le champ vient du client.
    .filter((url) => /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url))
    .slice(0, LIMITE_IMAGES);
}

function lirePrix(brut: FormDataEntryValue | null): number | null | "invalide" {
  const texte = String(brut ?? "").trim().replace(",", ".");
  if (texte === "") return null;
  const valeur = Number(texte);
  if (!Number.isFinite(valeur) || valeur < 0) return "invalide";
  return Math.round(valeur * 100) / 100;
}

export async function enregistrerAnnonce(
  _etat: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  if (!(await sessionActive())) return { erreur: REFUS };

  const id = String(donnees.get("id") ?? "").trim();
  const titre = String(donnees.get("titre") ?? "").trim();
  const description = String(donnees.get("description") ?? "").trim();
  const categorie = String(donnees.get("categorie") ?? "");
  const images = nettoyerImages(donnees.get("images"));
  const prix = lirePrix(donnees.get("prix"));

  if (!titre) return { erreur: "Le titre est obligatoire." };
  if (titre.length > LIMITE_TITRE) {
    return { erreur: `Le titre ne doit pas dépasser ${LIMITE_TITRE} caractères.` };
  }
  if (description.length > LIMITE_DESCRIPTION) {
    return {
      erreur: `La description ne doit pas dépasser ${LIMITE_DESCRIPTION} caractères.`,
    };
  }
  if (!estCategorie(categorie)) return { erreur: "Emplacement invalide." };
  if (prix === "invalide") return { erreur: "Le prix doit être un nombre positif." };
  if (images.length === 0) return { erreur: "Ajoutez au moins une photo." };

  const maintenant = new Date().toISOString();
  const { annonces, version } = await lireInstantane();

  let suivantes: Annonce[];
  let imagesADetruire: string[] = [];

  if (id) {
    const index = annonces.findIndex((annonce) => annonce.id === id);
    if (index === -1) return { erreur: "Cette annonce n'existe plus." };

    const precedente = annonces[index];
    imagesADetruire = precedente.images.filter((url) => !images.includes(url));

    suivantes = [...annonces];
    suivantes[index] = {
      ...precedente,
      titre,
      description,
      categorie,
      prix,
      images,
      modifieLe: maintenant,
    };
  } else {
    suivantes = [
      ...annonces,
      {
        id: crypto.randomUUID(),
        titre,
        description,
        categorie,
        prix,
        images,
        creeLe: maintenant,
        modifieLe: maintenant,
      },
    ];
  }

  try {
    await ecrireAnnonces(suivantes, version);
  } catch (erreur) {
    // Remonté dans le formulaire plutôt que sur une page d'erreur : la saisie
    // reste à l'écran et peut être renvoyée telle quelle.
    console.error("Écriture des annonces impossible", erreur);
    return { erreur: `Enregistrement impossible : ${(erreur as Error).message}` };
  }

  await supprimerImages(imagesADetruire);
  rafraichir(categorie, id ? annonces.find((a) => a.id === id)?.categorie : undefined);
  redirect("/admin");
}

export async function supprimerAnnonce(donnees: FormData) {
  if (!(await sessionActive())) redirect("/admin/connexion");

  const id = String(donnees.get("id") ?? "");
  const { annonces, version } = await lireInstantane();
  const cible = annonces.find((annonce) => annonce.id === id);
  if (!cible) redirect("/admin");

  try {
    await ecrireAnnonces(
      annonces.filter((annonce) => annonce.id !== id),
      version,
    );
  } catch (erreur) {
    console.error("Suppression de l'annonce impossible", erreur);
    redirect("/admin?erreur=conflit");
  }

  await supprimerImages(cible.images);
  rafraichir(cible.categorie);
  redirect("/admin");
}

/** Régénère l'admin et la (ou les) page(s) publique(s) concernée(s). */
function rafraichir(...categories: (string | undefined)[]) {
  revalidatePath("/admin");
  for (const categorie of new Set(categories)) {
    if (estCategorie(categorie)) revalidatePath(CATEGORIES[categorie].href);
  }
}
