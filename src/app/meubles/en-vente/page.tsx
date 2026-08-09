import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnoncesGrille } from "@/components/AnnoncesGrille";
import { trierParDateDecroissante } from "@/lib/annonces";
import { lireAnnonces } from "@/lib/annonces-store";

export const metadata: Metadata = {
  title: "Nos meubles en vente — Atelier Petita",
  description:
    "Découvrez notre sélection de meubles anciens restaurés, disponibles à la vente. Pièces uniques poncées, peintes et cirées à la main.",
};

// Les annonces sont lues à chaque requête pour qu'une publication soit
// visible immédiatement.
export const dynamic = "force-dynamic";

export default async function MeublesEnVente() {
  const annonces = trierParDateDecroissante(
    (await lireAnnonces()).filter(
      (annonce) => annonce.categorie === "meubles-en-vente",
    ),
  );

  return (
    <div className="overflow-x-hidden">
      <Header />

      <main>
        {/* En-tête de page */}
        <div className="bg-petita-cream/60 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-2 font-display text-sm text-petita-brown/70">
              <a href="/" className="no-underline hover:text-petita-brick">Accueil</a>
              <span aria-hidden="true">›</span>
              <span className="text-petita-brick">Nos meubles en vente</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Meuble ancien chiné en brocante, restauré et sublimé à quatre mains par l&apos;Atelier Petita — pièce unique
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
            <p className="m-0 max-w-[52ch] text-petita-brown">
              Buffets, commodes, guéridons… Du ponçage à la dernière couche de cire, nous redonnons
              vie et modernité à des meubles chargés d&apos;histoire. Chaque pièce est restaurée entre
              nos quatre mains, avec patience et passion.
            </p>
          </div>
        </div>

        {/* Grille des meubles */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <AnnoncesGrille
            annonces={annonces}
            messageVide="Aucun meuble disponible pour le moment — de nouvelles trouvailles arrivent après chaque chine."
          />

          <div className="mt-16 rounded-xl border border-petita-gold/30 bg-petita-cream p-8 text-center sm:p-12">
            <h2 className="m-0 font-display text-2xl font-semibold text-petita-brick">
              Vous cherchez une pièce particulière ?
            </h2>
            <p className="mx-auto my-4 max-w-[48ch] text-petita-brown">
              Contactez-nous pour nous décrire votre projet. Nous sélectionnons régulièrement de nouvelles pièces lors de nos chines.
            </p>
            <a
              href="/#contact"
              className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-8 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
            >
              Nous écrire
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
