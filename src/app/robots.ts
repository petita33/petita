import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { URL_SITE } from "@/lib/seo";

const DOMAINES_PRODUCTION = new Set([
  "atelier-petita.fr",
  "www.atelier-petita.fr",
]);

export default async function robots(): Promise<MetadataRoute.Robots> {
  const entetes = await headers();
  const hote = (entetes.get("x-forwarded-host") ?? entetes.get("host"))
    ?.split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();

  // Le domaine technique Vercel peut servir un déploiement marqué production :
  // le contrôle du host empêche aussi son exploration malgré ce cas particulier.
  if (
    process.env.VERCEL_ENV !== "production" ||
    !hote ||
    !DOMAINES_PRODUCTION.has(hote)
  ) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${URL_SITE}/sitemap.xml`,
    host: URL_SITE,
  };
}
