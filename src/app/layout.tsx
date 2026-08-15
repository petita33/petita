import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLd } from "@/components/JsonLd";
import { entrepriseJsonLd, grapheSchema, URL_SITE } from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: "Atelier Petita — Luminaires & mobilier revisités",
  description:
    "Des pièces anciennes chinées puis restaurées à la main dans notre atelier français : luminaires et meubles à l'unité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${lora.variable} h-full`}>
      <body className="min-h-full font-body text-[1.125rem] leading-[1.7] text-petita-brown antialiased">
        <JsonLd data={grapheSchema(entrepriseJsonLd())} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
