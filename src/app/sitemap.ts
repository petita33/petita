import type { MetadataRoute } from "next";
import { hrefAnnonce } from "@/lib/annonces";
import { lireAnnonces } from "@/lib/annonces-store";

const URL_SITE = "https://atelier-petita.fr";

// Les annonces peuvent changer sans nouveau déploiement : le sitemap doit les
// relire pour que Google découvre rapidement les créations publiées ensuite.
export const dynamic = "force-dynamic";

function url(chemin: string) {
  return new URL(chemin, URL_SITE).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const annonces = await lireAnnonces();

  const pages: MetadataRoute.Sitemap = [
    {
      url: url("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: url("/luminaires/en-vente"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: url("/meubles/en-vente"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: url("/en-cours"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: url("/luminaires/vendus"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: url("/meubles/vendus"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: url("/apropos"),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: url("/contact"),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: url("/mentions-legales"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: url("/cgu-cgv"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const pagesAnnonces: MetadataRoute.Sitemap = annonces.map((annonce) => ({
    url: url(hrefAnnonce(annonce.id)),
    lastModified: annonce.modifieLe,
    changeFrequency: annonce.categorie.endsWith("-vendus") ? "yearly" : "weekly",
    priority: annonce.categorie.endsWith("-vendus") ? 0.5 : 0.8,
    images: annonce.images,
  }));

  return [...pages, ...pagesAnnonces];
}
