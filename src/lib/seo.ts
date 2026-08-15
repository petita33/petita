import type { Metadata } from "next";
import {
  CATEGORIES,
  hrefAnnonce,
  type Annonce,
} from "./annonces";

export const URL_SITE = "https://atelier-petita.fr";
export const NOM_SITE = "Atelier Petita";
export const IMAGE_SOCIALE = "/og.png";

type NoeudJsonLd = Record<string, unknown>;

export type EtapeFilAriane = {
  nom: string;
  chemin: string;
};

export function urlAbsolue(chemin: string) {
  return new URL(chemin, URL_SITE).toString();
}

export function descriptionMeta(
  texte: string,
  repli: string,
  limite = 158,
) {
  const propre = (texte.trim() || repli).replace(/\s+/g, " ");
  if (propre.length <= limite) return propre;

  const extrait = propre.slice(0, limite + 1);
  const derniereEspace = extrait.lastIndexOf(" ");
  const coupure = derniereEspace >= Math.floor(limite * 0.7)
    ? derniereEspace
    : limite;

  return `${extrait.slice(0, coupure).replace(/[\s,;:.!?]+$/g, "")}…`;
}

export function creerMetadataPage({
  titre,
  description,
  chemin,
  image = IMAGE_SOCIALE,
}: {
  titre: string;
  description: string;
  chemin: string;
  image?: string;
}): Metadata {
  return {
    title: titre,
    description,
    alternates: { canonical: chemin },
    openGraph: {
      title: titre,
      description,
      url: chemin,
      type: "website",
      siteName: NOM_SITE,
      locale: "fr_FR",
      images: [
        image === IMAGE_SOCIALE
          ? {
              url: image,
              width: 1200,
              height: 630,
              alt: "Atelier Petita — luminaires et mobilier revisités",
            }
          : { url: image },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titre,
      description,
      images: [image],
    },
  };
}

export function grapheSchema(...noeuds: NoeudJsonLd[]): NoeudJsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": noeuds,
  };
}

export function entrepriseJsonLd(): NoeudJsonLd {
  return {
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${URL_SITE}/#atelier`,
    name: "Atelier Petita",
    url: URL_SITE,
    logo: urlAbsolue("/logo.png"),
    image: urlAbsolue("/logo.png"),
    email: "petita-lumieres@protonmail.com",
    telephone: "+33613359497",
    address: {
      "@type": "PostalAddress",
      streetAddress: "27 allée du Carretey",
      addressLocality: "Cestas",
      addressRegion: "Gironde",
      addressCountry: "FR",
    },
    sameAs: ["https://www.instagram.com/petita_lumieres/"],
  };
}

export function filArianeJsonLd(etapes: EtapeFilAriane[]): NoeudJsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: etapes.map((etape, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: etape.nom,
      item: urlAbsolue(etape.chemin),
    })),
  };
}

export function listeAnnoncesJsonLd(annonces: Annonce[]): NoeudJsonLd {
  return {
    "@type": "ItemList",
    numberOfItems: annonces.length,
    itemListElement: annonces.map((annonce, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        "@id": `${urlAbsolue(hrefAnnonce(annonce))}#produit`,
        name: annonce.titre,
        url: urlAbsolue(hrefAnnonce(annonce)),
        ...(annonce.images.length > 0 ? { image: annonce.images } : {}),
      },
    })),
  };
}

export function produitJsonLd(annonce: Annonce): NoeudJsonLd {
  const categorie = CATEGORIES[annonce.categorie];
  const url = urlAbsolue(hrefAnnonce(annonce));

  return {
    "@type": "Product",
    "@id": `${url}#produit`,
    name: annonce.titre,
    description:
      annonce.description ||
      `${annonce.titre}, pièce unique restaurée à la main par l'Atelier Petita.`,
    sku: annonce.id,
    url,
    category: categorie.label,
    ...(annonce.images.length > 0 ? { image: annonce.images } : {}),
    itemCondition: "https://schema.org/UsedCondition",
    brand: {
      "@type": "Brand",
      name: "Atelier Petita",
    },
    ...(annonce.prix !== null
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: annonce.prix,
            priceCurrency: "EUR",
            availability: categorie.enVente
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
            seller: {
              "@id": `${URL_SITE}/#atelier`,
            },
          },
        }
      : {}),
  };
}
