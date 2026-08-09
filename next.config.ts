import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Les photos des annonces sont servies par le store Vercel Blob.
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/annonces/**",
        search: "",
      },
      {
        protocol: "https",
        // Les photos fixes de la page d'accueil, dans le même store.
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/visuels/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
