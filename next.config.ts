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
    ],
  },
};

export default nextConfig;
