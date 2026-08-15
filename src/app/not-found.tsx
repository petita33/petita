import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Page introuvable — Atelier Petita",
  description: "Cette page n'existe plus ou a changé d'adresse.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex flex-1 items-center bg-petita-cream/60 px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="m-0 font-display text-sm font-semibold uppercase tracking-[0.22em] text-petita-gold-fonce">
            Erreur 404
          </p>
          <h1 className="mb-5 mt-3 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
            Cette pièce reste introuvable
          </h1>
          <p className="mx-auto mb-8 max-w-[48ch] text-petita-brown">
            Elle a peut-être trouvé une nouvelle adresse. Retrouvez les créations
            disponibles ou revenez à l’accueil de l’Atelier Petita.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/luminaires/en-vente"
              className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-7 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
            >
              Voir les créations
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center rounded-md border border-petita-gold/60 px-7 py-3.5 font-display text-lg text-petita-brick no-underline hover:bg-petita-brick hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
