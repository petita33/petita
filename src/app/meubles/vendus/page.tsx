import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnoncesGrille } from "@/components/AnnoncesGrille";
import { JsonLd } from "@/components/JsonLd";
import { trierParDateDecroissante } from "@/lib/annonces";
import { lireAnnonces } from "@/lib/annonces-store";
import {
  filArianeJsonLd,
  creerMetadataPage,
  grapheSchema,
  listeAnnoncesJsonLd,
} from "@/lib/seo";

const DESCRIPTION =
  "Galerie des meubles anciens restaurés qui ont trouvé leur maison, pour découvrir le savoir-faire de l'Atelier Petita.";

export const metadata = creerMetadataPage({
  titre: "Nos meubles vendus — Atelier Petita",
  description: DESCRIPTION,
  chemin: "/meubles/vendus",
});

// La publication admin invalide cette copie sans attendre l'échéance horaire.
export const revalidate = 3600;

export default async function MeublesVendus() {
  const annonces = trierParDateDecroissante(
    (await lireAnnonces()).filter(
      (annonce) => annonce.categorie === "meubles-vendus",
    ),
  );

  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            { nom: "Nos meubles vendus", chemin: "/meubles/vendus" },
          ]),
          listeAnnoncesJsonLd(annonces),
        )}
      />
      <Header />

      <main>
        {/* En-tête de page */}
        <div className="bg-petita-cream/60 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-2 font-display text-sm text-petita-brown/70">
              <Link href="/" className="no-underline hover:text-petita-brick">Accueil</Link>
              <span aria-hidden="true">›</span>
              <span className="text-petita-brick">Nos meubles vendus</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Nos meubles vendus
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
            <p className="m-0 max-w-[52ch] text-petita-brown">
              Ces pièces ont trouvé leur foyer. Une galerie pour s&apos;inspirer et découvrir l&apos;étendue de
              notre travail de restauration.
            </p>
          </div>
        </div>

        {/* Grille des meubles */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <AnnoncesGrille
            annonces={annonces}
            messageVide="La galerie des pièces vendues se remplira au fil des restaurations."
          />

          {/* CTA vers les pièces en vente */}
          <div className="mt-16 rounded-xl border border-petita-gold/30 bg-petita-cream p-8 text-center sm:p-12">
            <h2 className="m-0 font-display text-2xl font-semibold text-petita-brick">
              Vous avez un coup de cœur ?
            </h2>
            <p className="mx-auto my-4 max-w-[48ch] text-petita-brown">
              Découvrez nos pièces actuellement disponibles à la vente, ou contactez-nous pour nous parler de votre projet.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/meubles/en-vente"
                className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-8 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
              >
                Voir les meubles en vente
              </Link>
              <Link
                href="/#contact"
                className="inline-flex min-h-12 items-center rounded-md border border-petita-gold/60 px-8 py-3.5 font-display text-lg text-petita-brick no-underline hover:bg-petita-brick hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
