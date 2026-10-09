import type { NextConfig } from "next";
import { hoteBlobPublic } from "./src/lib/store";

const enDeveloppement = process.env.NODE_ENV === "development";
/** Le bandeau de commentaires Vercel n'est injecté que sur les préversions. */
const enPrevisualisation = process.env.VERCEL_ENV === "preview";

/**
 * L'hôte exact de notre store, quand les variables permettent de le déduire.
 * À défaut — build sans jeton Blob — on retombe sur le motif générique plutôt
 * que de casser l'affichage des photos.
 */
const hoteBlob = hoteBlobPublic() ?? "*.public.blob.vercel-storage.com";
const ORIGINE_BLOB = `https://${hoteBlob}`;

/** L'API que le SDK Blob appelle depuis le navigateur pendant un envoi. */
const API_BLOB = "https://vercel.com";

/** Web Analytics et Speed Insights hors production, où ils sont servis par le site. */
const MESURES = "https://va.vercel-scripts.com";

const BANDEAU_VERCEL = "https://vercel.live";

/**
 * La politique de sécurité du contenu.
 *
 * `script-src` conserve `'unsafe-inline'` : le rendu de l'App Router dépose
 * dans la page des scripts en ligne (charge React, données de navigation,
 * JSON-LD). S'en passer imposerait un nonce par requête, donc un rendu
 * dynamique de toutes les pages — c'est-à-dire renoncer à la génération
 * statique d'un site vitrine, pour un gain nul tant qu'aucun script tiers n'est
 * chargé. Les autres directives, elles, sont strictes et c'est là que se joue
 * l'essentiel : plus de cadre parent possible (clickjacking), plus de plugin,
 * plus de `<base>` détourné, aucun envoi de formulaire vers l'extérieur, et une
 * liste fermée des origines autorisées à parler au navigateur.
 */
function politique({ admin }: { admin: boolean }) {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "frame-src": enPrevisualisation ? [BANDEAU_VERCEL] : ["'none'"],
    "form-action": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      MESURES,
      ...(enDeveloppement ? ["'unsafe-eval'"] : []),
      ...(enPrevisualisation ? [BANDEAU_VERCEL] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    // `blob:` sert aux aperçus locaux d'une photo en cours d'envoi.
    "img-src": ["'self'", "data:", "blob:", ORIGINE_BLOB],
    "font-src": ["'self'"],
    "connect-src": [
      "'self'",
      MESURES,
      // L'envoi direct d'une photo au store part de la page d'administration.
      ...(admin ? [API_BLOB, ORIGINE_BLOB] : []),
      ...(enDeveloppement ? ["ws:"] : []),
      ...(enPrevisualisation ? [BANDEAU_VERCEL, "wss://ws-us3.pusher.com"] : []),
    ],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([nom, valeurs]) => [nom, ...valeurs].join(" "))
    .join("; ");
}

const ENTETES_COMMUNS = [
  // Le type déclaré fait foi : pas de fichier réinterprété en script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Double de `frame-ancestors` pour les navigateurs qui l'ignorent encore.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Le site n'a besoin d'aucune de ces API : personne ne les obtiendra par une
  // page injectée ou un cadre.
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // `x-powered-by: Next.js` ne renseigne que l'attaquant sur ce qu'il attaque.
  poweredByHeader: false,
  experimental: {
    // Le store accepte les lectures séquentielles de prerender, mais protège
    // ses fichiers JSON contre les rafales lancées par plusieurs workers.
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1000,
  },
  async headers() {
    return [
      {
        source: "/:chemin*",
        headers: [
          ...ENTETES_COMMUNS,
          { key: "Content-Security-Policy", value: politique({ admin: false }) },
        ],
      },
      {
        // Placée après la règle générale : à clé égale, la dernière l'emporte.
        source: "/admin/:chemin*",
        headers: [
          ...ENTETES_COMMUNS,
          { key: "Content-Security-Policy", value: politique({ admin: true }) },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Les photos des annonces sont servies par notre store Vercel Blob, et
        // par lui seul : sans cet hôte épinglé, l'optimiseur d'images accepterait
        // de relayer le contenu de n'importe quel store public.
        hostname: hoteBlob,
        port: "",
        pathname: "/annonces/**",
        search: "",
      },
      {
        protocol: "https",
        // Les photos fixes de la page d'accueil, dans le même store.
        hostname: hoteBlob,
        port: "",
        pathname: "/visuels/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
